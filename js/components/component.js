//
//  Component.js

const Component = (function() {
  function init() {
    listenForPageLoaderEvents();
  }

  function listenForPageLoaderEvents() {
    document.addEventListener('page-loader:before-prefetch', beforePrefetch);
    document.addEventListener('page-loader:click', onClick);
    document.addEventListener(
      'page-loader:before-navigation',
      beforeNavigation
    );
    document.addEventListener('page-loader:before-load', beforeLoad);
    document.addEventListener('page-loader:before-cache', beforeCache);
    document.addEventListener('page-loader:load', onLoad);
  }

  function beforePrefetch(event) {
    console.log(event);
    // event.preventDefault();
  }

  function onClick(event) {
    console.log(event);
    // event.preventDefault();
  }

  function beforeNavigation(event) {
    console.log(event);
    // event.preventDefault(); // (unless popstate)
    //  Go into loading state
  }

  function beforeLoad(event) {
    console.log(event);
    //  event.preventDefault(); // (unless popstate)
    //  Make changes to the incoming DOM
  }

  function beforeCache(event) {
    console.log(event);
    //  Make changes to outgoing DOM before caching
  }

  function onLoad(event) {
    console.log(event);
    //  Come out of loading state, refresh components
  }

  return {
    init,
  };
})();

export { Component as default };
