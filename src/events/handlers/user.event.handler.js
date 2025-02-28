const { PinoLogger } = require('@papdaew/shared');

const VendorCommandService = require('#users/services/commands/vendor.command.service.js');
const UserCommandService = require('#users/services/commands/user.command.service.js');
const CustomerCommandService = require('#users/services/commands/customer.command.service.js');

class UserEventHandler {
  #logger;
  #userCommandService;
  #customerCommandService;
  #vendorCommandService;

  constructor() {
    this.#userCommandService = new UserCommandService();
    this.#customerCommandService = new CustomerCommandService();
    this.#vendorCommandService = new VendorCommandService();
    this.#logger = new PinoLogger().child({
      service: 'User Event Handler',
    });
  }

  handleUserCreated = async event => {
    try {
      this.#logger.info('Received user creation event');

      const userData = event.data || event;

      if (!userData.id || !userData.email) {
        this.#logger.error({ event }, 'Invalid user data in event');
        return;
      }

      const user = await this.#userCommandService.createUser(userData);

      switch (userData.role) {
        case 'CUSTOMER':
          await this.#customerCommandService.createCustomer(user._id);
          break;
        case 'VENDOR':
          await this.#vendorCommandService.createVendor(user._id);
          break;
        default:
          this.#logger.error({ event }, 'Invalid user role in event');
          break;
      }

      this.#logger.info(
        `Successfully created user from auth event: ${userData.id}`
      );
    } catch (error) {
      this.#logger.error(error, 'Error handling user created event');
      throw error;
    }
  };
}

module.exports = UserEventHandler;
