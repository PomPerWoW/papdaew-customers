const User = require('#users/models/user.model');

class UserService {
  createUser = async userData => {
    const user = new User(userData);
    return await user.save();
  };

  getUserById = async id => {
    const user = await User.findById(id).lean();
    return user;
  };
}

module.exports = UserService;
