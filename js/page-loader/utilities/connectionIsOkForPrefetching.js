export function connectionIsOkForPrefetching() {
  const isSavingData = navigator.connection?.saveData;
  const hasSlowConnection = navigator.connection?.effectiveType?.includes('2g');

  return !(isSavingData || hasSlowConnection);
}
