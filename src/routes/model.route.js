const { Router } = require('express');

const UserController = require('#users/controllers/user.controller.js');

class UserRoutes {
  #router;
  #userController;

  constructor() {
    this.#router = Router();
    this.#userController = new UserController();
  }

  setup() {
    this.#router.route('/:id').get(this.#userController.getUser);
    return this.#router;
  }
}

module.exports = UserRoutes;
