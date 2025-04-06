const { PinoLogger, NotFoundError } = require('@papdaew/shared');

const Staff = require('#users/models/staff.model.js');

class StaffQueryService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Staff Query Service',
    });
  }

  async getStaff(options = {}) {
    try {
      const { limit = 10, offset = 0, vendorId, branchId } = options;

      const query = Staff.find();

      // Apply filters if provided
      if (vendorId) {
        query.where('vendorId').equals(vendorId);
      }

      if (branchId) {
        query.where('branchId').equals(branchId);
      }

      // Apply pagination
      query.skip(offset).limit(limit);

      // Populate relations
      query.populate('user');

      const staff = await query.exec();

      // Count based on same filters for total
      const countQuery = Staff.find();
      if (vendorId) countQuery.where('vendorId').equals(vendorId);
      if (branchId) countQuery.where('branchId').equals(branchId);

      const total = await countQuery.countDocuments();

      return { staff, total };
    } catch (error) {
      this.#logger.error(error, 'Failed to get staff');
      throw error;
    }
  }

  async getStaffById(staffId) {
    try {
      const staff = await Staff.findById(staffId)
        .populate('user')
        .populate('vendor');

      if (!staff) {
        throw new NotFoundError(`Staff with ID ${staffId} not found`);
      }

      return staff;
    } catch (error) {
      this.#logger.error(error, `Failed to get staff with ID ${staffId}`);
      throw error;
    }
  }

  async getStaffByUserId(userId) {
    try {
      const staff = await Staff.findOne({ userId })
        .populate('user')
        .populate('vendor');

      if (!staff) {
        throw new NotFoundError(`Staff with user ID ${userId} not found`);
      }

      return staff;
    } catch (error) {
      this.#logger.error(error, `Failed to get staff with user ID ${userId}`);
      throw error;
    }
  }

  async getStaffByVendorId(vendorId, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      const query = Staff.find({ vendorId })
        .skip(offset)
        .limit(limit)
        .populate('user');

      const staff = await query.exec();
      const total = await Staff.countDocuments({ vendorId });

      return { staff, total };
    } catch (error) {
      this.#logger.error(
        error,
        `Failed to get staff for vendor ID ${vendorId}`
      );
      throw error;
    }
  }

  async getStaffByBranchId(branchId, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      const query = Staff.find({ branchId })
        .skip(offset)
        .limit(limit)
        .populate('user');

      const staff = await query.exec();
      const total = await Staff.countDocuments({ branchId });

      return { staff, total };
    } catch (error) {
      this.#logger.error(
        error,
        `Failed to get staff for branch ID ${branchId}`
      );
      throw error;
    }
  }
}

module.exports = StaffQueryService;
