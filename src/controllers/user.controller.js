const { StatusCodes } = require('http-status-codes');
const {
  asyncHandler,
  PinoLogger,
  BadRequestError,
} = require('@papdaew/shared');

const UserQueryService = require('#users/services/queries/user.query.service.js');
const UserCommandService = require('#users/services/commands/user.command.service.js');

class UserController {
  #logger;
  #userCommandService;
  #userQueryService;

  constructor() {
    this.#userCommandService = new UserCommandService();
    this.#userQueryService = new UserQueryService();
    this.#logger = new PinoLogger().child({ service: 'User Controller' });
  }

  createUser = asyncHandler(async (req, res) => {
    this.#logger.info('POST: create user');

    const user = await this.#userCommandService.createUser(req.body);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'User created successfully',
      data: user,
    });
  });

  getUser = asyncHandler(async (req, res) => {
    this.#logger.info('GET: user by id');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.#userQueryService.getUserById(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  });

  getCurrentUser = asyncHandler(async (req, res) => {
    this.#logger.info('GET: current user profile');

    const user = await this.#userQueryService.getUserById(req.user.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Current user fetched successfully',
      data: user,
    });
  });

  updateUser = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update user');

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const updatedUser = await this.#userCommandService.updateUser(
      id,
      updateData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser,
    });
  });

  deleteUser = asyncHandler(async (req, res) => {
    this.#logger.info('DELETE: delete user');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    await this.#userCommandService.deleteUser(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  });
}

module.exports = UserController;
