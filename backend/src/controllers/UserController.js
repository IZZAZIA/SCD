class UserController {
  constructor(userService) { this.users = userService; }
  list = async (_req, res) => res.json(await this.users.list());
  create = async (req, res) => res.status(201).json(await this.users.create(req.body));
  update = async (req, res) => res.json(await this.users.update(req.user, req.params.id, req.body));
  deactivate = async (req, res) => res.json(await this.users.deactivate(req.user, req.params.id));
  remove = async (req, res) => res.json(await this.users.remove(req.user, req.params.id));
}
module.exports = UserController;
