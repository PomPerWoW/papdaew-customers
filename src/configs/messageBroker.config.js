const amqp = require('amqplib');
const { PinoLogger } = require('@papdaew/shared');

const CustomerService = require('#customers/services/customer.service.js');
const Config = require('#customers/configs/config.js');

class MessageBroker {
  #logger;
  #config;
  #connection;
  #channel;
  #customerService;
  static #instance;

  constructor() {
    if (MessageBroker.#instance) {
      return MessageBroker.#instance;
    }
    this.#config = new Config();
    this.#customerService = new CustomerService();
    this.#logger = new PinoLogger().child({
      service: 'Message Broker',
    });
    MessageBroker.#instance = this;
  }

  connect = async () => {
    try {
      this.#connection = await amqp.connect(this.#config.RABBITMQ_URL);
      this.#channel = await this.#connection.createChannel();
      this.#logger.info('Successfully connected to RabbitMQ');
      await this.setupUserCreationConsumer();
    } catch (error) {
      this.#logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  };

  disconnect = async () => {
    await this.#channel?.close();
    await this.#connection?.close();
  };

  publishDirect = async (queue, message, logMessage) => {
    try {
      await this.#channel.assertQueue(queue, { durable: true });
      await this.#channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });

      this.#logger.info(logMessage);
    } catch (error) {
      this.#logger.error(
        `Failed to publish direct message to queue: ${queue}`,
        error
      );
      throw error;
    }
  };

  publishFanout = async (exchange, message, logMessage) => {
    try {
      await this.#channel.assertExchange(exchange, 'fanout', { durable: true });

      await this.#channel.publish(
        exchange,
        '',
        Buffer.from(JSON.stringify(message))
      );

      this.#logger.info(logMessage);
    } catch (error) {
      this.#logger.error(
        `Failed to publish fanout message to exchange: ${exchange}`,
        error
      );
      throw error;
    }
  };

  setupUserCreationConsumer = async () => {
    const queue = 'user_creation';

    try {
      await this.#channel.assertQueue(queue, { durable: true });
      this.#logger.info(`Starting to consume messages from queue: ${queue}`);

      await this.#channel.consume(queue, async message => {
        if (!message) {
          return;
        }

        try {
          const content = JSON.parse(message.content.toString());

          if (content.type === 'USER_CREATED') {
            const customerData = content.data;

            await this.#customerService.createCustomer(customerData);

            this.#logger.info(
              `Successfully created customer with ID: ${customerData.id}`
            );
          }

          this.#channel.ack(message);
        } catch (error) {
          this.#logger.error('Error processing message', error);
          // Reject the message and requeue
          this.#channel.nack(message, false, true);
        }
      });
    } catch (error) {
      this.#logger.error('Failed to setup user creation consumer', error);
      throw error;
    }
  };
}

module.exports = MessageBroker;
