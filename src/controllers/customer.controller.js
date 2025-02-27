const { StatusCodes } = require('http-status-codes');
const {
  asyncHandler,
  PinoLogger,
  BadRequestError,
} = require('@papdaew/shared');

const CustomerQueryService = require('#users/services/queries/customer.query.service.js');
const CustomerCommandService = require('#users/services/commands/customer.command.service.js');

class CustomerController {
  #logger;
  #customerCommandService;
  #customerQueryService;

  constructor() {
    this.#customerCommandService = new CustomerCommandService();
    this.#customerQueryService = new CustomerQueryService();
    this.#logger = new PinoLogger().child({ service: 'Customer Controller' });
  }

  createCustomer = asyncHandler(async (req, res) => {
    this.#logger.info('POST: create customer');

    const { userData, customerData } = req.body;

    if (!userData || !userData.email || !userData.username) {
      throw new BadRequestError('Required user data is missing');
    }

    const customer = await this.#customerCommandService.createCustomer(
      userData,
      customerData || {}
    );

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Customer created successfully',
      data: customer,
    });
  });

  getCustomer = asyncHandler(async (req, res) => {
    this.#logger.info('GET: customer by id');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    const customer = await this.#customerQueryService.findById(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Customer fetched successfully',
      data: customer,
    });
  });

  getCustomerByUserId = asyncHandler(async (req, res) => {
    this.#logger.info('GET: customer by user id');

    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const customer = await this.#customerQueryService.findByUserId(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Customer fetched successfully',
      data: customer,
    });
  });

  updateCustomer = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update customer');

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    const updatedCustomer = await this.#customerCommandService.updateCustomer(
      id,
      updateData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  });

  updatePreferences = asyncHandler(async (req, res) => {
    this.#logger.info('PATCH: update customer preferences');

    const { id } = req.params;
    const preferencesData = req.body;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    const updatedCustomer =
      await this.#customerCommandService.updatePreferences(id, preferencesData);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Customer preferences updated successfully',
      data: updatedCustomer,
    });
  });

  addQueueToHistory = asyncHandler(async (req, res) => {
    this.#logger.info('POST: add queue to customer history');

    const { id } = req.params;
    const queueData = req.body;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    if (!queueData || !queueData.queueId || !queueData.vendorId) {
      throw new BadRequestError('Required queue data is missing');
    }

    const customer = await this.#customerCommandService.addQueueToHistory(
      id,
      queueData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Queue added to history successfully',
      data: customer,
    });
  });

  addActiveQueue = asyncHandler(async (req, res) => {
    this.#logger.info('POST: add active queue to customer');

    const { id } = req.params;
    const queueData = req.body;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    if (!queueData || !queueData.queueId || !queueData.vendorId) {
      throw new BadRequestError('Required queue data is missing');
    }

    const customer = await this.#customerCommandService.addActiveQueue(
      id,
      queueData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Active queue added successfully',
      data: customer,
    });
  });

  getQueueHistory = asyncHandler(async (req, res) => {
    this.#logger.info('GET: customer queue history');

    const { id } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || 10,
      skip: parseInt(req.query.skip) || 0,
      status: req.query.status,
      sortBy: req.query.sortBy || 'joinedAt',
      sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
    };

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    const queueHistory = await this.#customerQueryService.getQueueHistory(
      id,
      options
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Queue history fetched successfully',
      data: queueHistory,
    });
  });

  getActiveQueues = asyncHandler(async (req, res) => {
    this.#logger.info('GET: customer active queues');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Customer ID is required');
    }

    const activeQueues = await this.#customerQueryService.getActiveQueues(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Active queues fetched successfully',
      data: activeQueues,
    });
  });
}

module.exports = CustomerController;
