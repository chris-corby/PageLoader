//  Sync elements in the <head> to ensure the meta data is correct when
//  the page is shared

export function updateHead(dom) {
  //  Use a Map here so the key can be a string with special characters
  const properties = new Map();
  properties.set('link[rel="canonical"]', 'href');
  properties.set('meta[property="og:title"]', 'content');
  properties.set('meta[property="og:description"]', 'content');
  properties.set('meta[property="og:type"]', 'content');
  properties.set('meta[property="og:url"]', 'content');
  properties.set('meta[property="og:locale"]', 'content');
  properties.set('meta[property="og:image"]', 'content');

  properties.forEach((attribute, selector) => {
    const current = document.querySelector(`${selector}`);
    const replacement = dom.querySelector(`${selector}`);

    //  Change
    if (current && replacement) {
      current.setAttribute(attribute, replacement.getAttribute(attribute));
    }

    //  Remove
    if (current && !replacement) {
      current.remove();
    }

    //  Add
    if (replacement && !current) {
      document.head.appendChild(replacement);
    }
  });
}
