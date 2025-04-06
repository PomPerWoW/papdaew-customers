const { Router } = require('express');

const UserMiddleware = require('#users/middlewares/user.middleware.js');
const UserController = require('#users/controllers/user.controller.js');

class UserRoutes {
  #router;
  #userController;
  #userMiddleware;

  constructor() {
    this.#router = Router();
    this.#userController = new UserController();
    this.#userMiddleware = new UserMiddleware();
  }

  setup() {
    this.#router
      .route('/me')
      .get(
        this.#userMiddleware.internalAuthMiddleware,
        this.#userController.getCurrentUser
      );
    this.#router.route('/').post(this.#userController.createUser);
    this.#router.route('/').get(this.#userController.getUsers);
    this.#router.route('/:id').get(this.#userController.getUser);
    return this.#router;
  }
}

module.exports = UserRoutes;
