const { StatusCodes } = require('http-status-codes');
const { asyncHandler, PinoLogger, NotFoundError } = require('@papdaew/shared');

const UserService = require('#users/services/user.service.js');

class UserController {
  #logger;
  #userService;

  constructor() {
    this.#logger = new PinoLogger().child({ service: 'User Controller' });
    this.#userService = new UserService();
  }

  getUser = asyncHandler(async (req, res) => {
    this.#logger.info(`GET: /users/${req.params.id}`);

    const userId = req.params.id;
    const user = await this.#userService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json(user);
  });
}

module.exports = UserController;
