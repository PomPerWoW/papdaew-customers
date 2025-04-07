const { NotFoundError } = require('@papdaew/shared');
const { PinoLogger } = require('@papdaew/shared');

const User = require('#users/models/user.model.js');

class UserQueryService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'User Query Service',
    });
  }

  async getUsers(options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      const query = {};

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await User.countDocuments(query);

      this.#logger.info({ count: users.length, total }, 'Retrieved users');

      return { users, total };
    } catch (error) {
      this.#logger.error(error, 'Failed to get users');
      throw error;
    }
  }

  getUserById = async id => {
    try {
      const user = await User.findById(id);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.role === 'CUSTOMER') {
        await user.populate('customer');
      } else if (user.role === 'STAFF') {
        await user.populate('staff');
      }

      return user;
    } catch (error) {
      this.#logger.error(error, `Failed to get user by id: '${id}'`);
      throw error;
    }
  };

  getUserByEmail = async email => {
    const user = await User.findOne({ email });

    if (!user) {
      this.#logger.error(`User not found for email: ${email}`);
      throw new NotFoundError('User not found');
    }

    return user;
  };

  getUserByUsername = async username => {
    const user = await User.findOne({ username });

    if (!user) {
      this.#logger.error(`User not found for username: ${username}`);
      throw new NotFoundError('User not found');
    }

    return user;
  };
}

module.exports = UserQueryService;
