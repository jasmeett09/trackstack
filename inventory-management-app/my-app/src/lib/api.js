const trimTrailingSlash = (value = '') => value.replace(/\/$/, '');

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');

export const buildApiUrl = (url) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
};

const request = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(buildApiUrl(url), {
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || payload?.errors?.join(' ') || 'Request failed');
  }

  return payload;
};

export const api = {
  get: (url) => request(url),
  post: (url, body) =>
    request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  postForm: (url, body) =>
    request(url, {
      method: 'POST',
      body
    }),
  put: (url, body) =>
    request(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  putForm: (url, body) =>
    request(url, {
      method: 'PUT',
      body
    }),
  patch: (url, body = {}) =>
    request(url, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  delete: (url) =>
    request(url, {
      method: 'DELETE'
    })
};
