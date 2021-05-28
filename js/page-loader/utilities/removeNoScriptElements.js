export function removeNoScriptElements(DOM) {
  const noScriptEls = Array.from(DOM.querySelectorAll('noscript'));

  noScriptEls.forEach(el => {
    el.remove();
  });

  return DOM;
}
