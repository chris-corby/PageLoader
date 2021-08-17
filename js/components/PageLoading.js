import { PageLoader } from '../page-loader/PageLoader';

export class PageLoading {
  constructor() {
    this.instance = false;
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
  }

  listenForEvents() {
    document.addEventListener(
      'page-loader:before-navigation',
      this.addLoadingState
    );
    document.addEventListener('page-loader:load', this.removeLoadingState);
  }

  addLoadingState() {
    document.body.setAttribute(this.attributes.loading, '');
  }

  removeLoadingState() {
    document.body.removeAttribute(this.attributes.loading);
  }

  destroy() {
    if (this.instance) this.instance.destroy();

    document.removeEventListener(
      'page-loader:before-navigation',
      this.addLoadingState
    );
    document.removeEventListener('page-loader:load', this.removeLoadingState);
  }
}
