const { Router } = require('express');

const CustomerController = require('#customers/controllers/customer.controller.js');

class CustomerRoutes {
  #router;
  #customerController;

  constructor() {
    this.#router = Router();
    this.#customerController = new CustomerController();
  }

  setup() {
    this.#router.get('/customers/:id', this.#customerController.getCustomer);
    return this.#router;
  }
}

module.exports = CustomerRoutes;
