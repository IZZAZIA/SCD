// DESIGN PATTERN: SINGLETON
// One HTTP client for the whole app. It holds the sign-in token so every API module shares it.
import { API_URL } from '../config/api';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  static instance = null;

  static getInstance() {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }

  constructor() {
    this.token = null;
    this.onUnauthorized = null;
  }

  setToken(token) { this.token = token; }
  setUnauthorizedHandler(fn) { this.onUnauthorized = fn; }

  async request(method, path, { body, query } = {}) {
    const parts = Object.entries(query || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    const url = `${API_URL}${path}${parts.length ? `?${parts.join('&')}` : ''}`;

    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('Cannot reach the server. Check your connection and the API address.', 0);
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401 && this.token && this.onUnauthorized) this.onUnauthorized();
      throw new ApiError(data?.error?.message || 'The request failed.', res.status, data?.error?.details);
    }
    return data;
  }

  get(path, query) { return this.request('GET', path, { query }); }
  post(path, body) { return this.request('POST', path, { body: body ?? {} }); }
  put(path, body) { return this.request('PUT', path, { body }); }
  patch(path, body) { return this.request('PATCH', path, { body: body ?? {} }); }
  del(path) { return this.request('DELETE', path); }
}

export default ApiClient;
