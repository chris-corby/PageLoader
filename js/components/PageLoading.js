import { PageLoader } from '../page-loader/PageLoader';
import { CacheRefresher } from '../page-loader/CacheRefresher';

export class PageLoading {
  constructor() {
    this.instance = false;
    this.cacheRefresher = false;
    this.attributes = {
      loading: `data-loading`,
    };

    //  Bind event listeners
    this.addLoadingState = this.addLoadingState.bind(this);
    this.removeLoadingState = this.removeLoadingState.bind(this);
  }

  init() {
    this.start();
    this.listenForEvents();
  }

  start() {
    this.instance = new PageLoader();
    this.instance.start();

    //  Example with options
    // this.instance = new PageLoader({
    //   cacheTimeoutInMinutes: 30,
    //   usePrefetch: false,
    // });

    //  Example of refreshing lazysizes classes on cached pages
    // this.cacheRefresher = new CacheRefresher([
    //   {
    //     fresh: ['lazyload'],
    //     stale: ['lazyloading', 'lazyloaded'],
    //     flag: 'data-lazyload-refresher',
    //   },
    // ]);
    // this.cacheRefresher.init();
  }

  listenForEvents() {
    document.addEventListener(
      'page-loader:before-navigation',
      this.addLoadingState
    );
    document.addEventListener('page-loader:transition', this.customTransition);
    document.addEventListener('page-loader:load', this.removeLoadingState);
  }

  addLoadingState() {
    document.body.setAttribute(this.attributes.loading, '');
  }

  customTransition(event) {
    const { visit, fromPopState, oldContent, newContent } = event.detail;

    //  Cancel the default transition
    // event.preventDefault();

    //  Manage your own transition...
  }

  removeLoadingState() {
    document.body.removeAttribute(this.attributes.loading);
  }

  destroy() {
    if (this.instance) this.instance.destroy();
    if (this.cacheRefresher) this.cacheRefresher.destroy();

    document.removeEventListener(
      'page-loader:before-navigation',
      this.addLoadingState
    );
    document.removeEventListener('page-loader:load', this.removeLoadingState);
  }
}
