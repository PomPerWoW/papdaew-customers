const { PinoLogger } = require('@papdaew/shared');

const CustomerServer = require('#customers/server.js');
const MessageBroker = require('#customers/configs/messageBroker.config.js');
const Database = require('#customers/configs/database.config.js');
const Config = require('#customers/configs/config.js');

class Application {
  constructor() {
    this.config = new Config();
    this.appLogger = new PinoLogger({
      name: 'Customer Application',
      level: this.config.LOG_LEVEL,
      serviceVersion: this.config.SERVICE_VERSION,
      environment: this.config.NODE_ENV,
    });
    this.server = new CustomerServer();
    this.database = new Database();
    this.messageBroker = new MessageBroker();
  }

  initialize = () => {
    this.appLogger.info('Initializing Customer Application');
    this.setupUncaughtException();
    this.database.connect();
    this.messageBroker.connect();
    this.server.start();
    this.setupUnhandledRejection();
    this.setupShutdown();
  };

  setupUncaughtException = () => {
    process.once('uncaughtException', error => {
      this.appLogger.error(`Uncaught Exception: ${error.name}`, error);
      process.exit(1);
    });
  };

  setupUnhandledRejection = () => {
    process.once('unhandledRejection', error => {
      this.appLogger.error(`Unhandled Rejection: ${error.name}`, error);
      this.server.close();
      process.exit(1);
    });
  };

  setupShutdown = () => {
    const shutdown = async () => {
      try {
        await this.database.disconnect();
        await this.messageBroker.disconnect();
        await this.server.close();
        process.exit(0);
      } catch (error) {
        this.appLogger.error(`Error during shutdown: ${error.name}`, error);
        process.exit(1);
      }
    };

    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  };
}

const application = new Application();

application.initialize();
