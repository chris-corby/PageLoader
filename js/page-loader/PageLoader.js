import { applicationAllowsEvent } from './utilities/applicationAllowsEvent';
import { cleanDOM } from './utilities/cleanDOM';
import { connectionIsOkForPrefetching } from './utilities/connectionIsOkForPrefetching';
import { dispatchEvent as notifyApplicationOfEvent } from './utilities/dispatchEvent';
import { errorToLocation } from './utilities/errorToLocation';
import { fetchWithTimeout } from './utilities/fetchWithTimeout';
import { getClosestInternalLinkFromEvent } from './utilities/getClosestInternalLinkFromEvent';
import { getTimestamp } from './utilities/getTimestamp';
import { interactionEventIsPermissible } from './utilities/interactionEventIsPermissible';
import { parseHTMLDocument } from './utilities/parseHTMLDocument';
import { prefetchLocation } from './utilities/prefetchLocation';
import { setScrollPosition } from './utilities/setScrollPosition';
import { transitionPromise } from './utilities/transitionPromise';
import { updateHistory } from './utilities/updateHistory';
import { updateTitle } from './utilities/updateTitle';

export class PageLoader {
  constructor({
    cacheTimeoutInMinutes = 10,
    usePrefetch = true,
    useCache = true,
  } = {}) {
    this.started = false;
    this.enabled = false;

    this.useCache = useCache;
    this.visitCache = [];
    this.cacheTimeoutInMinutes = cacheTimeoutInMinutes;

    this.currentLocation = window.location.href;

    this.usePrefetch = usePrefetch && connectionIsOkForPrefetching();
    this.prefetchedLocations = new Set();
    this.prefetchedLocations.add(this.currentLocation);

    this.elementAttrs = {
      container: 'data-page-container',
      newContainer: 'data-page-new',
      transitionIn: 'data-page-in',
      transitionOut: 'data-page-out',
      track: 'data-page-track',
      noCache: 'data-page-no-cache',
      forbidLoad: 'data-page-no-load',
      forbidPrefetch: 'data-page-no-prefetch',
    };

    this.trackedAssets = [];

    //  Bind event listeners
    this.handleClick = this.handleClick.bind(this);
    this.handlePrefetchEvent = this.handlePrefetchEvent.bind(this);
    this.popStateRouter = this.popStateRouter.bind(this);
  }

  /*
   *  Quick Helpers
   */

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled;
  }

  cacheIsEnabled() {
    return this.useCache;
  }

  clearCache() {
    this.visitCache = [];
  }

  destroy() {
    this.clearCache();
    this.disable();

    document.body.removeEventListener('click', this.handleClick, {
      capture: true,
    });

    if (this.usePrefetch) {
      document.body.removeEventListener('touchstart', this.handleTouchstart, {
        capture: true,
        passive: true,
      });

      document.body.removeEventListener('mousedown', this.handleMousedown, {
        capture: true,
        passive: true,
      });
    }

    window.removeEventListener('popstate', this.popStateRouter);
  }

  /*
   *  Entry and Setup
   */

  start() {
    if (this.started) return;

    this.startHistory()
      .setTrackedAssets()
      .listenForInteractions()
      .listenForPopState();

    this.started = true;
    this.enable();
  }

  startHistory() {
    window.history.replaceState(
      { path: this.currentLocation },
      '',
      this.currentLocation
    );

    return this;
  }

  setTrackedAssets() {
    this.trackedAssets = this.getTrackedAssetsFromDOM(document);

    return this;
  }

  getTrackedAssetsFromDOM(DOM) {
    const assets = Array.from(
      DOM.querySelectorAll(`[${this.elementAttrs.track}]`)
    );

    const assetSrcs = assets.map(asset => asset.src || asset.href);

    return assetSrcs;
  }

  listenForInteractions() {
    //  Use capture to handle the event on the way down,
    //  not on the bubble up. It will hit the body earlier.

    document.body.addEventListener('click', this.handleClick, {
      capture: true,
    });

    if (this.usePrefetch) {
      document.body.addEventListener('touchstart', this.handlePrefetchEvent, {
        capture: true,
        passive: true,
      });

      document.body.addEventListener('mousedown', this.handlePrefetchEvent, {
        capture: true,
        passive: true,
      });
    }

    return this;
  }

  listenForPopState() {
    window.addEventListener('popstate', this.popStateRouter);
  }

  /*
   *  Handle Interactions
   */

  handleClick(event) {
    const link = getClosestInternalLinkFromEvent(event);

    if (this.clickIsPermissible(event, link)) {
      event.preventDefault();

      const location = link.href;
      this.navigate(location);
    }
  }

  clickIsPermissible(event, link) {
    return (
      interactionEventIsPermissible(event) &&
      this.linkIsPermissibleForClick(link) &&
      applicationAllowsEvent('page-loader:click', {
        detail: { link },
      })
    );
  }

  linkIsPermissibleForClick(link) {
    return link && !link.hasAttribute(this.elementAttrs.forbidLoad);
  }

  handlePrefetchEvent(event) {
    const link = getClosestInternalLinkFromEvent(event);
    const location = link?.href;

    if (this.prefetchIsPermissible(event, link, location)) {
      prefetchLocation(location);
      this.prefetchedLocations.add(location);
    }
  }

  prefetchIsPermissible(event, link, location) {
    return (
      interactionEventIsPermissible(event) &&
      this.linkIsPermissibleForPrefetch(link) &&
      this.locationIsPermissibleForPrefetch(location) &&
      applicationAllowsEvent('page-loader:before-prefetch', {
        detail: { location },
      })
    );
  }

  linkIsPermissibleForPrefetch(link) {
    //  Don’t cause mixed content warnings, assume HTTPS
    const isHTTPS = link?.protocol === 'https:';

    //  Optional chaining results in an error here
    const hasForbidAttribute =
      link && link.hasAttribute(this.elementAttrs.forbidPrefetch);

    //  Don’t preload hashed links, `page/#section`
    const isForSamePage = link?.pathname === window.location.pathname;

    //  Don’t preload links with query strings because they could
    //  trigger actions, e.g. `?logout` or `?add-to-cart`
    const hasQueryString = link?.search;

    return (
      link &&
      isHTTPS &&
      !hasForbidAttribute &&
      !isForSamePage &&
      !hasQueryString
    );
  }

  locationIsPermissibleForPrefetch(location) {
    return location && !this.prefetchedLocations.has(location);
  }

  popStateRouter() {
    const location = window.history.state?.path;

    //  Popstate events cannot be cancelled, so if multiple navigations are
    //  attempted, the history could become out of sync with the page. To avoid
    //  this, just load the page directly if PageLoader is disabled
    if (this.isEnabled() && location) {
      this.navigate(location, { fromPopState: true });
    } else {
      errorToLocation('Popstate', location);
    }
  }

  /*
   *  Navigate
   */

  async navigate(location, { fromPopState = false } = {}) {
    if (this.navigationIsPermissible(location, { fromPopState })) {
      this.disable();
      this.organizeCache();

      try {
        const visit = await this.getVisit(location);

        if (this.loadIsPermissible(visit, { fromPopState })) {
          this.cacheCurrentPage();

          await this.swapContent(visit);

          this.updatePageState(visit, { fromPopState });

          this.enable();
        }
      } catch (error) {
        errorToLocation(error, location);
      }
    }
  }

  navigationIsPermissible(location, { fromPopState = false } = {}) {
    return (
      this.isEnabled() &&
      applicationAllowsEvent('page-loader:before-navigation', {
        detail: { location },
        cancelable: !fromPopState,
      })
    );
  }

  organizeCache() {
    this.removeStaleVisitsFromCache();
    this.flagVisitsAsCached();
  }

  removeStaleVisitsFromCache() {
    this.visitCache = this.visitCache.filter(visit =>
      this.isVisitFresh(visit.timestamp)
    );
  }

  isVisitFresh(timestamp) {
    const currentTime = getTimestamp();
    return currentTime - timestamp < this.cacheTimeoutInMilliseconds();
  }

  cacheTimeoutInMilliseconds() {
    return this.cacheTimeoutInMinutes * 60 * 1000;
  }

  flagVisitsAsCached() {
    this.visitCache.forEach(visit => {
      visit.loadedFromCache = true;
    });
  }

  async getVisit(location) {
    const cachedVisit = this.findCachedVisitFromLocation(location);
    if (cachedVisit) return cachedVisit;

    const newVisit = await this.createVisit(location);
    return newVisit;
  }

  findCachedVisitFromLocation(location) {
    return this.visitCache.find(visit => visit.location === location);
  }

  async createVisit(location) {
    const DOM = await this.fetchNewDOM(location);

    if (this.trackedAssetsHaveChanged(await DOM)) {
      throw new Error('Tracked assets have changed');
    }

    const visit = {
      location,
      dom: await DOM,
      title: await DOM.title,
      scrollPosition: 0,
      timestamp: getTimestamp(),
      loadedFromCache: false,
    };

    this.addVisitToCache(visit);

    this.prefetchedLocations.add(location);

    return visit;
  }

  async fetchNewDOM(location) {
    const response = await fetchWithTimeout(location, {
      timeout: 8000,
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'text/html, application/xhtml+xml',
      },
    });

    const networkError = await !response.ok;
    if (networkError) {
      throw new Error('Network error');
    }

    const rawDOM = parseHTMLDocument(await response.text());
    const DOM = cleanDOM(rawDOM);

    return DOM;
  }

  trackedAssetsHaveChanged(newDOM) {
    const newTrackedAssets = this.getTrackedAssetsFromDOM(newDOM);

    const assetQuantityHasChanged =
      newTrackedAssets.length !== this.trackedAssets.length;

    const assetsAreMissing = newTrackedAssets.some(
      asset => !this.trackedAssets.includes(asset)
    );

    return assetQuantityHasChanged || assetsAreMissing;
  }

  addVisitToCache(visit) {
    if (this.cacheIsEnabled()) {
      this.visitCache.push(visit);
    }
  }

  loadIsPermissible(visit, { fromPopState = false } = {}) {
    return applicationAllowsEvent('page-loader:before-load', {
      detail: { visit },
      cancelable: !fromPopState,
    });
  }

  cacheCurrentPage() {
    if (
      this.cacheIsEnabled() &&
      this.currentPageAllowsCaching() &&
      applicationAllowsEvent('page-loader:before-cache')
    ) {
      //  Clone to create a separate copy, not linked to the document anymore
      const currentDOM = document.cloneNode(true);
      const DOM = cleanDOM(currentDOM);

      const visit = this.findCachedVisitFromLocation(this.currentLocation);

      if (visit) {
        visit.dom = DOM;
        visit.scrollPosition = window.scrollY;
      } else {
        this.addVisitToCache({
          location: this.currentLocation,
          dom: DOM,
          title: DOM.title,
          scrollPosition: window.scrollY,
          timestamp: getTimestamp(),
        });
      }
    }
  }

  currentPageAllowsCaching() {
    return !this.getPageContainerFromDOM(
      document.body,
      this.elementAttrs.noCache
    );
  }

  getPageContainerFromDOM(DOM, additionalAttribute = false) {
    const containerSelector = `[${this.elementAttrs.container}]`;
    const selector = additionalAttribute
      ? `${containerSelector}[${additionalAttribute}]`
      : containerSelector;

    return DOM.querySelector(`${selector}`);
  }

  /*
   *  Swap Content
   */

  async swapContent(visit) {
    const oldContent = this.getPageContainerFromDOM(document.body);
    const newContent = this.getPageContainerFromDOM(visit.dom)?.cloneNode(true);

    if (!oldContent) throw new Error('Old content not found');
    if (!newContent) throw new Error('New content not found');

    this.addNewContentToPage(newContent);
    await this.transitionOutOldContent(oldContent);
    oldContent.remove();
    await this.transitionInNewContent(newContent);
  }

  addNewContentToPage(newContent) {
    newContent.setAttribute(this.elementAttrs.newContainer, '');
    document.body.appendChild(newContent);
  }

  async transitionOutOldContent(oldContent) {
    oldContent.removeAttribute(this.elementAttrs.transitionIn);
    oldContent.setAttribute(this.elementAttrs.transitionOut, '');

    await transitionPromise({
      element: oldContent,
      property: 'opacity',
      timeout: 3000,
    });
  }

  async transitionInNewContent(newContent) {
    newContent.removeAttribute(this.elementAttrs.newContainer);
    newContent.setAttribute(this.elementAttrs.transitionIn, '');

    await transitionPromise({
      element: newContent,
      property: 'opacity',
      timeout: 3000,
    });

    newContent.removeAttribute(this.elementAttrs.transitionIn);
  }

  updatePageState(visit, { fromPopState = false }) {
    if (!fromPopState) updateHistory(visit.location);

    updateTitle(visit.title);

    this.setCurrentLocation();

    setScrollPosition({
      y: fromPopState ? visit.scrollPosition : 0,
    });

    notifyApplicationOfEvent('page-loader:load', {
      cancelable: false,
      detail: { visit },
    });
  }

  setCurrentLocation() {
    this.currentLocation = window.location.href;
  }
}
