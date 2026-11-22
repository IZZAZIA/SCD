class EventController {
  constructor(eventService) { this.events = eventService; }
  list = async (req, res) => res.json(await this.events.list(req.query));
  mine = async (req, res) => res.json(await this.events.listByOrganizer(req.user));
  get = async (req, res) => res.json(await this.events.get(req.params.id));
  create = async (req, res) => res.status(201).json(await this.events.create(req.user, req.body));
  update = async (req, res) => res.json(await this.events.update(req.user, req.params.id, req.body));
  cancel = async (req, res) => res.json(await this.events.cancel(req.user, req.params.id));
}
module.exports = EventController;
