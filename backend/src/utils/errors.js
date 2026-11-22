class AppError extends Error {
  constructor(message, status = 500, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
  }
}
class ValidationError extends AppError { constructor(m, d) { super(m, 400, d); } }
class AuthenticationError extends AppError { constructor(m = 'Please sign in to continue.') { super(m, 401); } }
class ForbiddenError extends AppError { constructor(m = 'You do not have permission to do this.') { super(m, 403); } }
class NotFoundError extends AppError { constructor(m = 'Not found.') { super(m, 404); } }
class ConflictError extends AppError { constructor(m, d) { super(m, 409, d); } }

module.exports = { AppError, ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError };
