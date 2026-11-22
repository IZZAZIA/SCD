class ResourceController {
  constructor(resourceService) { this.resources = resourceService; }
  list = async (_req, res) => res.json(await this.resources.list());
  availability = async (req, res) => res.json(await this.resources.getAvailability(req.params.id, req.query.date));
  create = async (req, res) => res.status(201).json(await this.resources.create(req.body));
  update = async (req, res) => res.json(await this.resources.update(req.params.id, req.body));
  remove = async (req, res) => res.json(await this.resources.remove(req.params.id));
}
module.exports = ResourceController;
