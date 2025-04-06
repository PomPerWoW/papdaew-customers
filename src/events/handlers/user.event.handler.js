const { PinoLogger } = require('@papdaew/shared');

const UserCommandService = require('#users/services/commands/user.command.service.js');
const StaffCommandService = require('#users/services/commands/staff.command.service.js');
const CustomerCommandService = require('#users/services/commands/customer.command.service.js');

class UserEventHandler {
  #logger;
  #userCommandService;
  #customerCommandService;
  #staffCommandService;

  constructor() {
    this.#userCommandService = new UserCommandService();
    this.#customerCommandService = new CustomerCommandService();
    this.#staffCommandService = new StaffCommandService();
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
        case 'STAFF': {
          const staffData = {
            userId: user._id,
            userData,
          };
          await this.#staffCommandService.createStaff(staffData);
          break;
        }
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
