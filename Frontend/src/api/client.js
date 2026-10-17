/**
 * The only place that talks to the Laravel API (/api/v1).
 * - Adds JSON + Bearer token headers
 * - Unwraps API Resource responses ({ data: ... })
 * - Turns 401 / 404 / 422 into readable messages
 */
const BASE = '/api/v1';
const TOKEN_KEY = 'statusping_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(value) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked: the user simply stays logged out.
  }
}

export class ApiError extends Error {
  constructor(status, body, method, path) {
    super(`${method} ${path} failed with ${status}`);
    this.status = status;
    this.body = body;
    this.method = method;
    this.path = path;
  }
}

async function request(method, path, body) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, null, method, path);
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Empty or non-JSON body.
  }

  if (!res.ok) throw new ApiError(res.status, data, method, path);
  return data;
}

/** API Resources wrap payloads in { data: ... }. */
export function unwrap(response) {
  if (response && typeof response === 'object' && 'data' in response) return response.data;
  return response;
}

export const api = {
  get: (path) => request('GET', path).then(unwrap),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body).then(unwrap),
  patch: (path, body = {}) => request('PATCH', path, body).then(unwrap),
  delete: (path) => request('DELETE', path),
};

export function errorMessage(err) {
  if (!(err instanceof ApiError)) return err?.message || 'Something went wrong. Check the browser console.';
  const where = `${err.method} /api/v1${err.path}`;
  switch (err.status) {
    case 0:
      return 'Could not reach the server. Is Docker running, and is VITE_API_TARGET correct?';
    case 401:
      return 'You need to log in first.';
    case 403:
      return 'You are not allowed to do this.';
    case 404:
      return `${where} returned 404. Either this endpoint is not built yet, or the record does not exist.`;
    case 405:
      return `${where} returned 405. The route exists but not for this HTTP method.`;
    case 422:
      return Object.values(err.body?.errors || {}).flat().join(' ') || err.body?.message || 'Please check the form.';
    case 429:
      return 'Too many requests. Wait a minute and try again.';
    default:
      return err.body?.message || `${where} failed (${err.status}). Check storage/logs/laravel.log.`;
  }
}

/** Field errors from a 422 response, shaped { field: ['message'] }. */
export function fieldErrors(err) {
  return err instanceof ApiError && err.status === 422 ? err.body?.errors || {} : {};
}
