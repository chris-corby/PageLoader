# PageLoader

PageLoader is a small library for loading pages without needing full page refreshes.

Features:

- Adds data attributes for styling transitions
- Fires custom events to allow other components to tie in
- Keeps browser history up to date and respects the back button
- Keeps a cache of recently visited pages to avoid trips to the server
- Tracks when key assets have changed and forces a full reload
- Starts to preload pages as soon as links are pressed

## How to Install

1. Copy the `js/page-loader` folder into your JS folder.
1. Create a component like `js/components/PageLoading.js` that is going to start the PageLoader and manage loading states for your site.
1. Add `data-page-track` attribute to tracked assets, see `index.html`
1. Add `data-page-container` to each page, see `index.html`
1. Add transition styles from `style.css`

## Size

`bundle.js` weighs ~10kb when compressed and mangled through Terser. Gzipped this results in ~3kb.

## Options

`cacheTimeoutInMinutes`

Controls the number of minutes a page DOM can be kept in cache before being fetched across the network again.

This defaults to 10, but for sites with content that rarely changes this could be set much higher.

`usePrefetch`

Controls whether to try to add prefetch links in supporting browsers.

`useCache`

Controls whether visits will be cached or whether they will always be fetched across the network.

## Events

PageLoader dispatches several events throughout its processes that can be listened for in other components.

In this way, it is decoupled from the rest of the code and you shouldn’t need to import it directly in other components, or to important other components directly in to it.

Ideally, PageLoader should be _identical_ between projects, and customisation should be handled through events alone.

`page-loader:before-prefetch`

- Cancellable: Yes
- Details: `location`
- Fired before a prefetch link is added to the DOM.

`page-loader:click`

- Cancellable: Yes
- Details: `link`
- Fired after PageLoader has detected a click on a _valid_ link — it has passed all checks and is able to proceed. Cancelling this event doesn’t cancel the click itself, just the PageLoader process.

`page-loader:before-navigation`

- Cancellable: Yes (unless from popstate)
- Details: `location`
- Fired before any network requests are made. This is the time to go into a loading state.

`page-loader:before-load`

- Cancellable: Yes (unless from popstate)
- Details: `visit`
- Fired after network requests are made. `visit.dom` carries the new DOM, so make any changes to it here before it is transitioned in.

`page-loader:before-cache`

- Cancellable: Yes
- Details: -
- Fired before the current page is cached. Make changes needed before it could be shown again, e.g. clear forms.

`page-loader:transition`

- Cancellable: Yes
- Details: `visit`, `fromPopState`, `oldContent`, `newContent`
- Fired before the transition takes place. To run a custom transition on some/all pages, listen for this event and cancel it, then handle the swap of content yourself.

`page-loader:between-content`

- Cancellable: No
- Details: `visit`
- Fired after the old content has transitioned out but before the new content has transitioned in. Make changes that should be invisible, or should apply to the new content before it comes in e.g. changing body classes, updating colors.
- This event will only fire if the default transition is being used and `page-loader:transition` has not been cancelled.

`page-loader:load`

- Cancellable: No
- Details: `visit`
- Fired after load is complete. Run all post page load functions and come out of loading state. The `visit` detail contains the whole visit object, including whether the page was loaded from cache, and its original timestamp.

## Caching

### Opt out of caching

To opt out of caching on a single page, add the attribute `data-page-no-cache` to the container. This would be important for pages that load dynamic content, or whose content is likely to change often, e.g. a shopping cart.

### Clearing the cache

To clear the cache, run `PageLoader.clearCache()`. This might be necessary if an action renders the cache outdated, for example if a user logs out.

### Tracked Assets

To force a full page reload if critical assets change (e.g. global stylesheets or scripts), add the `data-page-track` attribute to them. This stops the DOM from being out of sync and incompatible.

For this to work, the `src` attribute must have changed, so make sure it contains a cachebusting feature like a timestamp, e.g. `/style.css?ver=1618228629529`. They must also be present on all pages you intend to use PageLoader with.

### Cache Refresher

The CacheRefresher simplifies refreshing classes for elements on cached pages when they are re-rendered.

This is helpful in situations where classes are modified during interaction with a page, but on a new load of the page you need the original classes back. A good example of this is lazy loading through a library like [lazysizes](https://github.com/aFarkas/lazysizes);

This works by setting a unique flag on the elements with the classes, and swapping out the stale classes for the fresh ones when the page is reloaded.

The inclusion of this is optional and is not needed if you have caching turned off.

## Prefetching

To speed up page loads even further, PageLoader will trigger prefetches on the requested pages.

This functionality is largely inspired by [instant.page](https://instant.page/).

To respect user data, it tries to check whether the user is on a slow connection or has shown a preference for a low data mode. Furthermore, it is only triggered on `mousedown` and `touchstart` — both actions which are highly likely to result in a click — rather than more speculative events like hover.

Note that prefetch links don’t have wide browser support as of April 2021: https://caniuse.com/?search=prefetch, neither do the checks on user data preferences: https://caniuse.com/?search=navigator.connection, so is only progressive enhancement.

## Useful functions

`disable()`

Stops visits from being planned and executed. This is automatically run when a visit starts.

`enable()`

Allows visits to be planned and executed again, run when a visit has completed. PageLoader is enabled by default once started.

`destroy()`

Removes all event listeners so PageLoader will no longer perform. Be aware that history could still be altered, so the back/forward buttons may not work correctly after this.

## Navigating directly

To trigger a visit manually, run `PageLoader.navigate(URL)`. This allows you to take full advantage of caching and transitions.

## Link Opt-Out

To stop PageLoader from trying to operate on a link, add the `data-page-no-load` attribute to it.

## Browser support

PageLoader uses modern JavaScript and out of the box it only supports new-ish browsers.

To work further back (e.g. IE11), it will need polyfilling with something like [Core JS](https://github.com/zloirock/core-js).

Particular things to look out for:

- Fetch, `fetch()`
- Optional chaining, `?.`
- Remove, `remove()`
- ES6 features, e.g. arrow functions `() => {}`

## Possible future improvements

### Do more merging of style and script tags?

At the moment, if a style tag exists on another page that is fetched but not the original, it will not be included — only the content will be loaded. In Turbo, new style/script tags do get merged.

This may complicate things too much here and instead things like this could be managed by each site when needed.

### Removing individual pages from cache

May be useful if only one cached page should be invalidated, rather than just clearing the whole cache.

## References

- [Turbo Drive](https://github.com/hotwired/turbo/tree/8bce5f17cd697716600d3b34836365ebcdc04b3f/src/core/drive)
- [instant.page](https://github.com/instantpage/instant.page/blob/master/instantpage.js)
- [Timing out a fetch request](https://dmitripavlutin.com/timeout-fetch-request/)

## Copyright and license

© 2021–present Chris Corby. All rights reserved.
