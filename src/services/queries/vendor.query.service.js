const { PinoLogger } = require('@papdaew/shared');

const Vendor = require('#users/models/vendor.model.js');
const User = require('#users/models/user.model.js');

class VendorQueryService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Vendor Query Service',
    });
  }

  async findById(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }
    return vendor;
  }

  async findByUserId(userId) {
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      this.#logger.error(`Vendor not found for userId: ${userId}`);
      throw new Error('Vendor not found');
    }
    return vendor;
  }

  async getServices(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }
    return vendor.services || [];
  }

  async getActiveQueues(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }
    return vendor.activeQueues || [];
  }

  async getQueueSettings(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }
    return vendor.queueSettings || {};
  }

  async getStatistics(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }
    return vendor.statistics || {};
  }

  async searchVendors(filters = {}, pagination = { page: 1, limit: 10 }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    if (filters.businessName) {
      query.businessName = { $regex: filters.businessName, $options: 'i' };
    }
    if (filters.businessType) {
      query.businessType = filters.businessType;
    }
    // Add more filters as needed

    const vendors = await Vendor.find(query).skip(skip).limit(limit).lean();

    const total = await Vendor.countDocuments(query);

    return {
      vendors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getVendorWithUserDetails(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      this.#logger.error(`Vendor not found for id: ${vendorId}`);
      throw new Error('Vendor not found');
    }

    const user = await User.findById(vendor.userId);
    if (!user) {
      this.#logger.error(`User not found for vendor id: ${vendorId}`);
      throw new Error('User not found for this vendor');
    }

    return {
      ...vendor.toObject(),
      user: user.toObject(),
    };
  }
}

module.exports = VendorQueryService;
