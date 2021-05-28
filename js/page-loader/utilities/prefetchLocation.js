export function prefetchLocation(location) {
  const element = document.createElement('link');
  element.rel = 'prefetch';
  element.href = location;
  document.head.appendChild(element);
}
