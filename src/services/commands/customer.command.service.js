const { PinoLogger } = require('@papdaew/shared');

const Customer = require('#users/models/customer.model.js');

class CustomerCommandService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Customer Command Service',
    });
  }

  async createCustomer(userId, customerData = {}) {
    try {
      // Create customer with reference to user
      const customer = new Customer({
        userId,
        ...customerData,
      });
      await customer.save();

      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to create customer');
      throw error;
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      // Update customer fields
      Object.keys(customerData).forEach(key => {
        if (key !== 'userId' && key !== '_id') {
          customer[key] = customerData[key];
        }
      });

      await customer.save();
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to update customer');
      throw error;
    }
  }

  async addQueueToHistory(customerId, queueData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.addQueueToHistory(queueData);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to add queue to history');
      throw error;
    }
  }

  async addActiveQueue(customerId, queueData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.addActiveQueue(queueData);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to add active queue');
      throw error;
    }
  }

  async updateActiveQueue(customerId, queueId, updateData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.updateActiveQueue(queueId, updateData);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to update active queue');
      throw error;
    }
  }

  async addFavoriteVendor(customerId, vendorData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.addFavoriteVendor(vendorData);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to add favorite vendor');
      throw error;
    }
  }

  async removeFavoriteVendor(customerId, vendorId) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      await customer.removeFavoriteVendor(vendorId);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to remove favorite vendor');
      throw error;
    }
  }

  async addReservation(customerId, reservationData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.addReservation(reservationData);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to add reservation');
      throw error;
    }
  }

  async cancelReservation(customerId, reservationId) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        this.#logger.error(`Customer not found for id: ${customerId}`);
        throw new Error('Customer not found');
      }

      await customer.cancelReservation(reservationId);
      return customer;
    } catch (error) {
      this.#logger.error(error, 'Failed to cancel reservation');
      throw error;
    }
  }
}

module.exports = CustomerCommandService;
