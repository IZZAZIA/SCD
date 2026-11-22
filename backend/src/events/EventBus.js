// DESIGN PATTERNS: OBSERVER (the subject) + SINGLETON (one shared bus).
// Services publish facts ("booking.approved"); observers subscribe and react. Services never
// know who is listening, so new reactions (email, SMS...) are added without editing services.
class EventBus {
  constructor() {
    if (EventBus._instance) return EventBus._instance;
    this.observers = new Map();
    EventBus._instance = this;
  }
  static getInstance() {
    if (!EventBus._instance) new EventBus();
    return EventBus._instance;
  }

  // observer = any object with update(topic, payload). Returns an unsubscribe function.
  subscribe(topics, observer) {
    [].concat(topics).forEach((t) => {
      if (!this.observers.has(t)) this.observers.set(t, new Set());
      this.observers.get(t).add(observer);
    });
    return () => this.unsubscribe(topics, observer);
  }
  unsubscribe(topics, observer) {
    [].concat(topics).forEach((t) => this.observers.get(t)?.delete(observer));
  }

  async publish(topic, payload) {
    for (const observer of [...(this.observers.get(topic) || [])]) {
      try {
        await observer.update(topic, payload);
      } catch (err) {
        // One failing observer must never break the action that triggered it.
        console.error(`[EventBus] observer failed on "${topic}":`, err.message);
      }
    }
  }
  clear() { this.observers.clear(); }
}
EventBus._instance = null;

module.exports = EventBus;
