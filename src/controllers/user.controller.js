const { StatusCodes } = require('http-status-codes');
const { asyncHandler, PinoLogger, NotFoundError } = require('@papdaew/shared');

const UserService = require('#users/services/user.service.js');

class UserController {
  #logger;
  #userService;

  constructor() {
    this.#userService = new UserService();
    this.#logger = new PinoLogger().child({ service: 'User Controller' });
  }

  getUser = asyncHandler(async (req, res) => {
    this.#logger.info(`GET: /users/${req.params.id}`);

    const userId = req.params.id;
    const user = await this.#userService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  });

  getCurrentUser = asyncHandler(async (req, res) => {
    this.#logger.info('GET: /users/me');

    this.#logger.info(
      `Getting user profile for ID: ${req.user.id}, Role: ${req.user.role}`
    );

    const user = await this.#userService.getUserById(req.user.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  });
}

module.exports = UserController;
