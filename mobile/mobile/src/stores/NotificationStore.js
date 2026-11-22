// DESIGN PATTERNS: OBSERVER + SINGLETON (client side)
// One shared store holds notifications. Any screen or the tab bar badge subscribes and is told
// whenever the data changes, so the unread count stays in sync everywhere.
import * as notificationApi from '../api/notificationApi';

class NotificationStore {
  static instance = null;

  static getInstance() {
    if (!NotificationStore.instance) NotificationStore.instance = new NotificationStore();
    return NotificationStore.instance;
  }

  constructor() {
    this.state = { items: [], unread: 0 };
    this.listeners = new Set();
    this.timer = null;
  }

  // Observer registration: returns an unsubscribe function.
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => { this.listeners.delete(listener); };
  }

  _set(next) {
    this.state = next;
    this.listeners.forEach((listener) => listener(this.state));
  }

  async refresh() {
    try {
      const { items, unread } = await notificationApi.list();
      this._set({ items, unread });
    } catch {
      /* keep the last known state when offline */
    }
  }

  async markRead(id) { await notificationApi.markRead(id); await this.refresh(); }
  async markAllRead() { await notificationApi.markAllRead(); await this.refresh(); }

  startPolling(intervalMs = 30000) {
    this.stopPolling();
    this.refresh();
    this.timer = setInterval(() => this.refresh(), intervalMs);
  }
  stopPolling() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  reset() { this._set({ items: [], unread: 0 }); }
}

export default NotificationStore;
