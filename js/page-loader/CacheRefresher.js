export class CacheRefresher {
  constructor(refreshers = []) {
    this.refreshers = refreshers;
  }

  init() {
    this.listenForPageLoaderEvents();
  }

  listenForPageLoaderEvents() {
    document.addEventListener('page-loader:before-cache', this);
    document.addEventListener('page-loader:load', this);
  }

  handleEvent(event) {
    const { type } = event;

    if (type === 'page-loader:before-cache') {
      this.beforeCache();
    } else if (type === 'page-loader:load') {
      this.postLoad(event);
    }
  }

  beforeCache() {
    this.refreshers.forEach(({ stale: staleClasses, flag }) => {
      CacheRefresher.removeStale(staleClasses, flag);
    });
  }

  static removeStale(staleClasses, flag) {
    //  Find the elements with stale classes
    const elements = Array.from(
      document.querySelectorAll(staleClasses.map((item) => `.${item}`))
    );

    //  Loop through them
    elements.forEach((element) => {
      //  Remove the classes
      element.classList.remove(...staleClasses);

      //  Add a flag
      element.setAttribute(flag, '');
    });
  }

  postLoad(event) {
    //  We are only looking for pages loaded from the PageLoader cache
    const { loadedFromCache } = event.detail.visit;
    if (!loadedFromCache) return;

    this.refreshers.forEach(({ fresh: freshClasses, flag }) => {
      CacheRefresher.addFresh(freshClasses, flag);
    });
  }

  static addFresh(freshClasses, flag) {
    //  Find the flagged elements
    const elements = Array.from(document.querySelectorAll(`[${flag}]`));

    //  Loop through and add the fresh classes back
    elements.forEach((element) => {
      element.classList.add(...freshClasses);
      element.removeAttribute(flag);
    });
  }

  destroy() {
    document.removeEventListener('page-loader:before-cache', this);
    document.removeEventListener('page-loader:load', this);
  }
}
