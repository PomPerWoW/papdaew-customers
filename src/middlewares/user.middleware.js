const { UnauthorizedError, ForbiddenError } = require('@papdaew/shared');

const Staff = require('#users/models/staff.model.js');

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

  /**
   * Middleware to check if staff has access to a branch
   * If staff is root, they can access any branch
   * If staff is not root, they can only access their assigned branch
   */
  checkBranchAccess = async (req, _res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      const userRole = req.headers['x-user-role'];

      // If user is not a staff, proceed (other middlewares will handle auth)
      if (!userId || userRole !== 'STAFF') {
        return next();
      }

      // Get the branch ID from request params or query
      const branchId = req.params.branchId || req.query.branchId;

      // If no branch ID is specified, proceed
      if (!branchId) {
        return next();
      }

      // Find the staff profile for this user
      const staff = await Staff.findOne({ userId });

      // If no staff profile found, throw error
      if (!staff) {
        throw new ForbiddenError('Staff profile not found');
      }

      // If staff is root, they can access any branch
      if (staff.isRoot) {
        return next();
      }

      // If staff is not root, check if the branch ID matches their assigned branch
      if (staff.branchId && staff.branchId.toString() === branchId) {
        return next();
      }

      // If branch doesn't match, deny access
      throw new ForbiddenError('You do not have access to this branch');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserMiddleware;
