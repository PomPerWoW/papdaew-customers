const { UnauthorizedError } = require('@papdaew/shared');

class UserMiddleware {
  internalAuthMiddleware = (req, _res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      throw new UnauthorizedError('Missing user authentication headers');
    }

    req.user = {
      id: userId,
      role: userRole,
    };

    next();
  };
}

module.exports = UserMiddleware;
