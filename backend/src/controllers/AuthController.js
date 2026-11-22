// MVC - Controller: translates HTTP into service calls and service results into JSON (the View of the API).
class AuthController {
  constructor(authService) { this.auth = authService; }
  register = async (req, res) => res.status(201).json(await this.auth.register(req.body));
  login = async (req, res) => res.json(await this.auth.login(req.body));
  me = async (req, res) => res.json({ user: req.user });
  updateMe = async (req, res) => res.json({ user: await this.auth.updateProfile(req.user, req.body) });
  changePassword = async (req, res) => res.json(await this.auth.changePassword(req.user, req.body));
}
module.exports = AuthController;
