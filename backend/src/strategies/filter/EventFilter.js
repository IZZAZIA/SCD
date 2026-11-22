// DESIGN PATTERN: STRATEGY (context)
// Picks the strategy for every criterion present in the query and applies them in turn.
const { DateFilterStrategy, CategoryFilterStrategy, SocietyFilterStrategy, SearchFilterStrategy, WeekFilterStrategy } = require('./EventFilterStrategies');

class EventFilter {
  constructor(strategies = {
    date: new DateFilterStrategy(),
    category: new CategoryFilterStrategy(),
    society: new SocietyFilterStrategy(),
    search: new SearchFilterStrategy(),
    week: new WeekFilterStrategy(), // ?week=current -> events happening this week
  }) {
    this.strategies = strategies;
  }
  apply(events, criteria = {}) {
    return Object.entries(criteria).reduce((result, [key, value]) => {
      const strategy = this.strategies[key];
      return strategy && value ? strategy.apply(result, value) : result;
    }, events);
  }
}
module.exports = EventFilter;
