const { StatusCodes } = require('http-status-codes');
const {
  asyncHandler,
  PinoLogger,
  BadRequestError,
} = require('@papdaew/shared');

const StaffQueryService = require('#users/services/queries/staff.query.service.js');
const StaffCommandService = require('#users/services/commands/staff.command.service.js');

class StaffController {
  #logger;
  #staffCommandService;
  #staffQueryService;

  constructor() {
    this.#staffCommandService = new StaffCommandService();
    this.#staffQueryService = new StaffQueryService();
    this.#logger = new PinoLogger().child({ service: 'Staff Controller' });
  }

  createStaff = asyncHandler(async (req, res) => {
    this.#logger.info('POST: create staff');

    const staffData = req.body;

    if (!staffData.userId || !staffData.vendorId || !staffData.branchId) {
      throw new BadRequestError(
        'User ID, Vendor ID, and Branch ID are required'
      );
    }

    const staff = await this.#staffCommandService.createStaff(staffData);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Staff created successfully',
      data: staff,
    });
  });

  getStaff = asyncHandler(async (req, res) => {
    this.#logger.info('GET: get all staff');

    const { limit, offset, vendorId, branchId } = req.query;

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
      vendorId,
      branchId,
    };

    const { staff, total } = await this.#staffQueryService.getStaff(options);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: staff,
      meta: {
        total,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  getStaffById = asyncHandler(async (req, res) => {
    this.#logger.info('GET: get staff by id');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Staff ID is required');
    }

    const staff = await this.#staffQueryService.getStaffById(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: staff,
    });
  });

  getStaffByUserId = asyncHandler(async (req, res) => {
    this.#logger.info('GET: get staff by user id');

    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const staff = await this.#staffQueryService.getStaffByUserId(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: staff,
    });
  });

  getStaffByVendorId = asyncHandler(async (req, res) => {
    this.#logger.info('GET: get staff by vendor id');

    const { vendorId } = req.params;
    const { limit, offset } = req.query;

    if (!vendorId) {
      throw new BadRequestError('Vendor ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const { staff, total } = await this.#staffQueryService.getStaffByVendorId(
      vendorId,
      options
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: staff,
      meta: {
        total,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  getStaffByBranchId = asyncHandler(async (req, res) => {
    this.#logger.info('GET: get staff by branch id');

    const { branchId } = req.params;
    const { limit, offset } = req.query;

    if (!branchId) {
      throw new BadRequestError('Branch ID is required');
    }

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const { staff, total } = await this.#staffQueryService.getStaffByBranchId(
      branchId,
      options
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: staff,
      meta: {
        total,
        limit: options.limit,
        offset: options.offset,
      },
    });
  });

  updateStaff = asyncHandler(async (req, res) => {
    this.#logger.info('PUT: update staff');

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Staff ID is required');
    }

    const staff = await this.#staffCommandService.updateStaff(id, updateData);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Staff updated successfully',
      data: staff,
    });
  });

  deleteStaff = asyncHandler(async (req, res) => {
    this.#logger.info('DELETE: delete staff');

    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Staff ID is required');
    }

    await this.#staffCommandService.deleteStaff(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Staff deleted successfully',
    });
  });
}

module.exports = StaffController;
