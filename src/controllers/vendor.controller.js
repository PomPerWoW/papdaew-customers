const { StatusCodes } = require('http-status-codes');
const {
  asyncHandler,
  PinoLogger,
  BadRequestError,
} = require('@papdaew/shared');

const VendorQueryService = require('#users/services/queries/vendor.query.service');
const VendorCommandService = require('#users/services/commands/vendor.command.service');

class VendorController {
  #logger;
  #vendorCommandService;
  #vendorQueryService;

  constructor() {
    this.#vendorCommandService = new VendorCommandService();
    this.#vendorQueryService = new VendorQueryService();
    this.#logger = new PinoLogger().child({ service: 'Vendor Controller' });
  }

  createVendor = asyncHandler(async (req, res) => {
    this.#logger.info('POST: create vendor');

    const { userId, vendorData } = req.body;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (!vendorData || !vendorData.businessName || !vendorData.businessType) {
      throw new BadRequestError('Required vendor data is missing');
    }

    const vendor = await this.#vendorCommandService.createVendor(
      userId,
      vendorData
    );

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Vendor created successfully',
      data: vendor,
    });
  });

  getVendor = asyncHandler(async (req, res) => {
    this.#logger.info('GET: vendor by id');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const vendor = await this.#vendorQueryService.findById(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendor fetched successfully',
      data: vendor,
    });
  });

  getVendorByUserId = asyncHandler(async (req, res) => {
    this.#logger.info('GET: vendor by user id');

    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const vendor = await this.#vendorQueryService.findByUserId(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendor fetched successfully',
      data: vendor,
    });
  });

  updateVendor = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update vendor');

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const updatedVendor = await this.#vendorCommandService.updateVendor(
      id,
      updateData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendor updated successfully',
      data: updatedVendor,
    });
  });

  addQueue = asyncHandler(async (req, res) => {
    this.#logger.info('POST: add queue to vendor');

    const { id } = req.params;
    const queueData = req.body;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    if (!queueData || !queueData.name) {
      throw new BadRequestError('Required queue data is missing');
    }

    const vendor = await this.#vendorCommandService.addQueue(id, queueData);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Queue added successfully',
      data: vendor,
    });
  });

  updateQueue = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update vendor queue');

    const { id, queueId } = req.params;
    const updateData = req.body;

    if (!id || !queueId) {
      throw new BadRequestError('Vendor ID and Queue ID are required');
    }

    const vendor = await this.#vendorCommandService.updateQueue(
      id,
      queueId,
      updateData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Queue updated successfully',
      data: vendor,
    });
  });

  addService = asyncHandler(async (req, res) => {
    this.#logger.info('POST: add service to vendor');

    const { id } = req.params;
    const serviceData = req.body;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    if (!serviceData || !serviceData.name) {
      throw new BadRequestError('Required service data is missing');
    }

    const vendor = await this.#vendorCommandService.addService(id, serviceData);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Service added successfully',
      data: vendor,
    });
  });

  updateService = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update vendor service');

    const { id, serviceId } = req.params;
    const updateData = req.body;

    if (!id || !serviceId) {
      throw new BadRequestError('Vendor ID and Service ID are required');
    }

    const vendor = await this.#vendorCommandService.updateService(
      id,
      serviceId,
      updateData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Service updated successfully',
      data: vendor,
    });
  });

  updateQueueSettings = asyncHandler(async (req, res) => {
    this.#logger.info('PATCH: update vendor queue settings');

    const { id } = req.params;
    const queueSettings = req.body;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const vendor = await this.#vendorCommandService.updateQueueSettings(
      id,
      queueSettings
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Queue settings updated successfully',
      data: vendor,
    });
  });

  updateStatistics = asyncHandler(async (req, res) => {
    this.#logger.info('PATCH: update vendor statistics');

    const { id } = req.params;
    const statsData = req.body;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const vendor = await this.#vendorCommandService.updateStatistics(
      id,
      statsData
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Statistics updated successfully',
      data: vendor,
    });
  });

  getServices = asyncHandler(async (req, res) => {
    this.#logger.info('GET: vendor services');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const services = await this.#vendorQueryService.getServices(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Services fetched successfully',
      data: services,
    });
  });

  getActiveQueues = asyncHandler(async (req, res) => {
    this.#logger.info('GET: vendor active queues');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const activeQueues = await this.#vendorQueryService.getActiveQueues(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Active queues fetched successfully',
      data: activeQueues,
    });
  });

  getStatistics = asyncHandler(async (req, res) => {
    this.#logger.info('GET: vendor statistics');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Vendor ID is required');
    }

    const statistics = await this.#vendorQueryService.getStatistics(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Statistics fetched successfully',
      data: statistics,
    });
  });

  searchVendors = asyncHandler(async (req, res) => {
    this.#logger.info('GET: search vendors');

    const filters = {
      businessName: req.query.businessName,
      businessType: req.query.businessType,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await this.#vendorQueryService.searchVendors(
      filters,
      pagination
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Vendors fetched successfully',
      data: result.vendors,
      pagination: result.pagination,
    });
  });
}

module.exports = new VendorController();
