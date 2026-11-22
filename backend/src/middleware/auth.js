// FR-2: role-based access control. authenticate() loads the user; authorize() checks permissions.
const asyncHandler = require('./asyncHandler');
const { ForbiddenError } = require('../utils/errors');

function createAuth(authService) {
  const authenticate = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || '';
    req.user = await authService.authenticate(header.startsWith('Bearer ') ? header.slice(7) : null);
    next();
  });

  // Allows the request if the user holds ANY of the listed permissions.
  const authorize = (...permissions) => (req, _res, next) =>
    permissions.some((p) => req.user.can(p)) ? next() : next(new ForbiddenError('Your role cannot use this feature.'));

  return { authenticate, authorize };
}
module.exports = createAuth;
