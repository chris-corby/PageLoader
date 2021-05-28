//  See: https://gist.github.com/davej/44e3bbec414ed4665220

export function transitionPromise({ element, property, timeout = 3000 }) {
  return new Promise(resolve => {
    const timer = setTimeout(() => finish(), timeout);

    function onTransitionEnd(event) {
      const isTarget = event.target === element;
      const isProperty = event.propertyName === property;
      if (!isTarget || !isProperty) return;

      clearTimeout(timer);
      finish();
    }

    function finish() {
      element.removeEventListener('transitionend', onTransitionEnd);
      resolve();
    }

    element.addEventListener('transitionend', onTransitionEnd);
  });
}
