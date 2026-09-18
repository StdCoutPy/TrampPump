class EventBus {
  constructor() {
    this.subscribers = {};
  }

  subscribe(topic, handler) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(handler);
  }

  unsubscribe(topic, handler) {
    if (this.subscribers[topic]) {
      this.subscribers[topic] = this.subscribers[topic].filter(sub => sub !== handler);
    }
  }

  publish(topic, payload) {
    if (this.subscribers[topic]) {
      this.subscribers[topic].forEach(handler => handler(payload));
    }
  }
}

export default new EventBus();
