const { PinoLogger } = require('@papdaew/shared');

const Vendor = require('#users/models/vendor.model.js');

class VendorCommandService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Vendor Command Service',
    });
  }

  async createVendor(userId, vendorData = {}) {
    try {
      // Create vendor with reference to user
      const vendor = new Vendor({
        userId,
        ...vendorData,
      });
      await vendor.save();

      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to create vendor');
      throw error;
    }
  }

  async updateVendor(vendorId, vendorData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      // Update vendor fields
      Object.keys(vendorData).forEach(key => {
        if (
          key !== 'userId' &&
          key !== '_id' &&
          key !== 'services' &&
          key !== 'activeQueues'
        ) {
          vendor[key] = vendorData[key];
        }
      });

      await vendor.save();
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update vendor');
      throw error;
    }
  }

  async addQueue(vendorId, queueData) {
    try {
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.addQueue(queueData);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to add queue');
      throw error;
    }
  }

  async updateQueue(vendorId, queueId, updateData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.updateQueue(queueId, updateData);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update queue');
      throw error;
    }
  }

  async addService(vendorId, serviceData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.addService(serviceData);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to add service');
      throw error;
    }
  }

  async updateService(vendorId, serviceId, updateData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.updateService(serviceId, updateData);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update service');
      throw error;
    }
  }

  async updateQueueSettings(vendorId, queueSettings) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.updateQueueSettings(queueSettings);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update queue settings');
      throw error;
    }
  }

  async updateStatistics(vendorId, statsData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        this.#logger.error(`Vendor not found for id: ${vendorId}`);
        throw new Error('Vendor not found');
      }

      await vendor.updateStatistics(statsData);
      return vendor;
    } catch (error) {
      this.#logger.error(error, 'Failed to update statistics');
      throw error;
    }
  }
}

module.exports = VendorCommandService;
