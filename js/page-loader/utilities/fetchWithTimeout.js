//  See: https://dmitripavlutin.com/timeout-fetch-request/

export async function fetchWithTimeout(url, options) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(timer);

  return response;
}
