// DESIGN PATTERN: STRATEGY
// One small strategy per filter a student can use (FR-6): date, category (event type), society, keyword.
const { weekBounds } = require('../../utils/time');

class EventFilterStrategy {
  apply() { throw new Error('EventFilterStrategy.apply() must be implemented'); }
}

class DateFilterStrategy extends EventFilterStrategy {
  apply(events, date) { return events.filter((e) => e.date === date); }
}
class CategoryFilterStrategy extends EventFilterStrategy {
  apply(events, category) { return events.filter((e) => e.type.toLowerCase() === String(category).toLowerCase()); }
}
class SocietyFilterStrategy extends EventFilterStrategy {
  apply(events, society) { return events.filter((e) => e.society.toLowerCase().includes(String(society).toLowerCase())); }
}
class WeekFilterStrategy extends EventFilterStrategy {
  apply(events) {
    const { start, end } = weekBounds();
    return events.filter((e) => e.date >= start && e.date <= end);
  }
}
class SearchFilterStrategy extends EventFilterStrategy {
  apply(events, text) {
    const q = String(text).toLowerCase();
    return events.filter((e) => `${e.title} ${e.description} ${e.venue} ${e.society}`.toLowerCase().includes(q));
  }
}

module.exports = { EventFilterStrategy, DateFilterStrategy, CategoryFilterStrategy, SocietyFilterStrategy, SearchFilterStrategy, WeekFilterStrategy };
