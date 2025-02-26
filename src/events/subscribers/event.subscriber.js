const { PinoLogger } = require('@papdaew/shared');

const UserEventHandler = require('#users/events/handlers/user.event.handler.js');
const MessageBroker = require('#users/configs/messageBroker.config.js');

class EventSubscriber {
  #logger;
  #messageBroker;
  #userEventHandler;

  constructor() {
    this.#messageBroker = new MessageBroker();
    this.#userEventHandler = new UserEventHandler();
    this.#logger = new PinoLogger().child({
      service: 'Event Subscriber',
    });
  }

  setupSubscriptions = async () => {
    try {
      await this.#messageBroker.subscribeDirect(
        'user_creation',
        this.#userEventHandler.handleUserCreatedFromAuth
      );

      this.#logger.info('Event subscriptions set up successfully');
    } catch (error) {
      this.#logger.error('Failed to set up event subscriptions', error);
      throw error;
    }
  };
}

module.exports = EventSubscriber;
