const { Router } = require('express');

const CustomerController = require('#users/controllers/customer.controller.js');

class CustomerRoutes {
  #router;
  #customerController;

  constructor() {
    this.#router = Router();
    this.#customerController = new CustomerController();
  }

  setup() {
    this.#router.route('/').post(this.#customerController.createCustomer);
    this.#router.route('/:id').get(this.#customerController.getCustomer);
    return this.#router;
  }
}

module.exports = CustomerRoutes;
