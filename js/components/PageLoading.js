//
//  PageLoading.js

import { PageLoader } from '../page-loader/PageLoader';

const PageLoading = (function() {
  let instance = false;
  const loadingAttr = 'data-loading';

  function init() {
    start();
    listenForEvents();
  }

  function start() {
    instance = new PageLoader();
    instance.start();

    //  Example with options
    // instance = new PageLoader({
    //   cacheTimeoutInMinutes: 30,
    //   usePrefetch: false,
    // });
  }

  function listenForEvents() {
    document.addEventListener('page-loader:before-navigation', addLoadingState);
    document.addEventListener('page-loader:load', removeLoadingState);
  }

  function addLoadingState() {
    document.body.setAttribute(loadingAttr, '');
  }

  function removeLoadingState() {
    document.body.removeAttribute(loadingAttr);
  }

  function destroy() {
    if (instance) instance.destroy();

    document.removeEventListener(
      'page-loader:before-navigation',
      addLoadingState
    );
    document.removeEventListener('page-loader:load', removeLoadingState);
  }

  return {
    init,
    destroy,
  };
})();

export { PageLoading as default };
