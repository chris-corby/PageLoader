export function parseHTMLDocument(text) {
  const parsedDocument = new DOMParser().parseFromString(text, 'text/html');

  if (!parsedDocument) {
    throw new Error('DOM could not be parsed');
  }

  return parsedDocument;
}
