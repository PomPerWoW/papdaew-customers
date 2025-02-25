const { NotFoundError } = require('@papdaew/shared');

const User = require('#users/models/user.model.js');

class UserService {
  createUser = async userData => {
    const user = new User({
      _id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
    });

    const savedUser = await user.save();

    return savedUser;
  };

  getUserById = async id => {
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  };
}

module.exports = UserService;
