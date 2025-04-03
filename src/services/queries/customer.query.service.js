const { PinoLogger, NotFoundError } = require('@papdaew/shared');

const Customer = require('#users/models/customer.model.js');

class CustomerQueryService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Customer Query Service',
    });
  }

  async findById(customerId, includeUser = false) {
    const query = Customer.findById(customerId);

    if (includeUser) {
      await query.populate('user');
    }

    const customer = await query;
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  async findByUserId(userId, includeUser = false) {
    const query = Customer.findOne({ userId });

    if (includeUser) {
      query.populate('user');
    }

    const customer = await query;
    if (!customer) {
      this.#logger.error(`Customer not found for userId: ${userId}`);
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  async getQueueHistory(customerId, options = {}) {
    const {
      limit = 10,
      skip = 0,
      status,
      sortBy = 'joinedAt',
      sortOrder = -1,
    } = options;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    let { queueHistory } = customer;

    // Filter by status if provided
    if (status) {
      queueHistory = queueHistory.filter(q => q.status === status);
    }

    // Sort the queue history
    queueHistory.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * Number(sortOrder);
      if (a[sortBy] > b[sortBy]) return 1 * Number(sortOrder);
      return 0;
    });

    // Apply pagination
    return queueHistory.slice(skip, skip + limit);
  }

  async getActiveQueues(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    return customer.activeQueues;
  }

  async getFavoriteVendors(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    return customer.favoriteVendors;
  }

  async getUpcomingReservations(customerId, includeExpired = false) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    let reservations = customer.upcomingReservations;

    // Filter out expired reservations if not requested
    if (!includeExpired) {
      const now = new Date();
      reservations = reservations.filter(
        r => new Date(r.reservationTime) > now || r.status === 'CANCELLED'
      );
    }

    // Sort by reservation time
    return reservations.sort(
      (a, b) => new Date(a.reservationTime) - new Date(b.reservationTime)
    );
  }

  async getStatistics(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      this.#logger.error(`Customer not found for id: ${customerId}`);
      throw new NotFoundError('Customer not found');
    }

    return customer.statistics;
  }

  async searchCustomers(filters = {}, options = {}) {
    const {
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1,
    } = options;

    // Build query
    const query = {};

    // Apply filters
    if (filters.membershipTier) {
      query.membershipTier = filters.membershipTier;
    }

    // Count total matching documents
    const total = await Customer.countDocuments(query);

    // Execute query with pagination and sorting
    const sort = { [sortBy]: sortOrder };
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();

    return {
      data: customers,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = CustomerQueryService;
