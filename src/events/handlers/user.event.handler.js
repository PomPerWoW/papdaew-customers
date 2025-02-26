const { PinoLogger } = require('@papdaew/shared');

const UserCommandService = require('#users/services/commands/user.command.service.js');

class UserEventHandler {
  #logger;
  #userCommandService;

  constructor() {
    this.#userCommandService = new UserCommandService();
    this.#logger = new PinoLogger().child({
      service: 'User Event Handler',
    });
  }

  handleUserCreatedFromAuth = async event => {
    try {
      this.#logger.info('Received user creation event');

      const userData = event.data || event;

      if (!userData.id || !userData.email) {
        this.#logger.error('Invalid user data in event', { event });
        return;
      }

      await this.#userCommandService.createUser(userData);

      this.#logger.info(
        `Successfully created user from auth event: ${userData.id}`
      );
    } catch (error) {
      this.#logger.error('Error handling user created event', error);
      throw error;
    }
  };
}

module.exports = UserEventHandler;
