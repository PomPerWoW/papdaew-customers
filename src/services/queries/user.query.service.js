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

  getUserById = async id => {
    try {
      const user = await User.findById(id);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      this.#logger.error(`Failed to get user ${id}`, error);
      throw error;
    }
  };

  getUserByEmail = async email => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      this.#logger.error(`Failed to get user by email ${email}`, error);
      throw error;
    }
  };

  getUserByUsername = async username => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      this.#logger.error(`Failed to get user by username ${username}`, error);
      throw error;
    }
  };
}

module.exports = UserQueryService;
