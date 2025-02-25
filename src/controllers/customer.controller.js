const { StatusCodes } = require('http-status-codes');
const { asyncHandler, PinoLogger, NotFoundError } = require('@papdaew/shared');

const CustomerService = require('#customers/services/customer.service.js');

class CustomerController {
  #logger;
  #customerService;

  constructor() {
    this.#logger = new PinoLogger().child({ service: 'Customer Controller' });
    this.#customerService = new CustomerService();
  }

  getCustomer = asyncHandler(async (req, res) => {
    this.#logger.info(`GET: /customers/${req.params.id}`);

    const customerId = req.params.id;
    const customer = await this.#customerService.getCustomerById(customerId);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.status(StatusCodes.OK).json(customer);
  });
}

module.exports = CustomerController;
