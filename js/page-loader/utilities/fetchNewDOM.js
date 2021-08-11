import { cleanDOM } from './cleanDOM';
import { fetchWithTimeout } from './fetchWithTimeout';
import { parseHTMLDocument } from './parseHTMLDocument';

export async function fetchNewDOM(location) {
  const response = await fetchWithTimeout(location, {
    timeout: 8000,
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'text/html, application/xhtml+xml',
    },
  });

  const networkError = await !response.ok;
  if (networkError) {
    throw new Error('Network error');
  }

  const rawDOM = parseHTMLDocument(await response.text());
  const DOM = cleanDOM(rawDOM);

  return DOM;
}
