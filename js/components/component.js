export class Component {
  constructor() {
    //  Bind event listeners
    this.beforePrefetch = this.beforePrefetch.bind(this);
    this.onClick = this.onClick.bind(this);
    this.beforeNavigation = this.beforeNavigation.bind(this);
    this.beforeLoad = this.beforeLoad.bind(this);
    this.beforeCache = this.beforeCache.bind(this);
    this.onLoad = this.onLoad.bind(this);
  }

  init() {
    this.listenForPageLoaderEvents();
  }

  listenForPageLoaderEvents() {
    document.addEventListener(
      'page-loader:before-prefetch',
      this.beforePrefetch
    );
    document.addEventListener('page-loader:click', this.onClick);
    document.addEventListener(
      'page-loader:before-navigation',
      this.beforeNavigation
    );
    document.addEventListener('page-loader:before-load', this.beforeLoad);
    document.addEventListener('page-loader:before-cache', this.beforeCache);
    document.addEventListener(
      'page-loader:between-content',
      this.betweenContent
    );
    document.addEventListener('page-loader:load', this.onLoad);
  }

  beforePrefetch(event) {
    console.log(event);
    // event.preventDefault();
  }

  onClick(event) {
    console.log(event);
    // event.preventDefault();
  }

  beforeNavigation(event) {
    console.log(event);
    // event.preventDefault(); // (unless popstate)
    //  Go into loading state
  }

  beforeLoad(event) {
    console.log(event);
    //  event.preventDefault(); // (unless popstate)
    //  Make changes to the incoming DOM
  }

  beforeCache(event) {
    console.log(event);
    //  Make changes to outgoing DOM before caching
  }

  betweenContent(event) {
    console.log(event);
    //  Make changes to the DOM before the new content is visible
  }

  onLoad(event) {
    console.log(event);
    //  Come out of loading state, refresh components
  }
}
