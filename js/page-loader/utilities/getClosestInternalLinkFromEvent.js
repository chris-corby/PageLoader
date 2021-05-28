export function getClosestInternalLinkFromEvent(event) {
  const exceptions = ':not([target^=_]):not([download])';

  const link = event.target.closest(`a[href]${exceptions}`);
  if (!link) return false;

  const siteHost = window.location.host;
  const linkIsExternal = link.host !== siteHost;
  if (linkIsExternal) return false;

  return link;
}
