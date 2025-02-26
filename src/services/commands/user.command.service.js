const { NotFoundError } = require('@papdaew/shared');
const { PinoLogger } = require('@papdaew/shared');

const User = require('#users/models/user.model.js');

class UserCommandService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'User Command Service',
    });
  }

  createUser = async userData => {
    try {
      const user = new User({
        _id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
      });

      const savedUser = await user.save();

      return savedUser;
    } catch (error) {
      this.#logger.error('Failed to create user', error);
      throw error;
    }
  };

  updateUser = async (id, updateData) => {
    try {
      const existingUser = await User.findById(id);

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return updatedUser;
    } catch (error) {
      this.#logger.error(`Failed to update user ${id}`, error);
      throw error;
    }
  };

  deleteUser = async id => {
    try {
      const existingUser = await User.findById(id);

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      await User.findByIdAndDelete(id);

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      this.#logger.error(`Failed to delete user ${id}`, error);
      throw error;
    }
  };
}

module.exports = UserCommandService;
