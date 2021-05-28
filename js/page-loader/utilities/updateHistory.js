export function updateHistory(url) {
  const locationIsIdentical = url === window.location.href;
  if (locationIsIdentical) return;

  window.history.pushState({ path: url }, '', url);
}
