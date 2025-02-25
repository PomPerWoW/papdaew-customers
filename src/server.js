const http = require('http');

const hpp = require('hpp');
const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const {
  globalErrorHandler,
  NotFoundError,
  PinoLogger,
} = require('@papdaew/shared');

const CustomerRoutes = require('#customers/routes/customer.route.js');
const Config = require('#customers/configs/config.js');

class CustomerServer {
  #app;
  #server;
  #logger;
  #config;
  #customerRoutes;

  constructor() {
    this.#app = express();
    this.#config = new Config();
    this.#logger = new PinoLogger().child({
      service: 'Customer Server',
    });
    this.#customerRoutes = new CustomerRoutes();
  }

  setup = () => {
    this.#setupSecurityMiddleware(this.#app);
    this.#setupMiddleware(this.#app);
    this.#setupRoutes(this.#app);
    this.#setupErrorHandlers(this.#app);
    return this.#app;
  };

  start = () => {
    this.setup();
    this.#startServer(this.#app);
  };

  #setupSecurityMiddleware = app => {
    app.set('trust proxy', true);
    app.use(cors());
    app.use(helmet());
    app.use(hpp());
  };

  #setupMiddleware = app => {
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  };

  #setupRoutes = app => {
    app.use('/api/v1/customers', this.#customerRoutes.setup());
  };

  #setupErrorHandlers = app => {
    app.all('*', (req, _res, next) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.#logger.error(`${fullUrl} endpoint does not exist.`);
      next(
        new NotFoundError(
          `Can't find ${req.method}:${req.originalUrl} on this server!`
        )
      );
    });

    app.use(globalErrorHandler);
  };

  #startServer = app => {
    try {
      this.#server = http.createServer(app);
      this.#server.listen(this.#config.PORT, () => {
        this.#logger.info(
          `Customer service is running on port ${this.#config.PORT}`
        );
      });
    } catch (error) {
      this.#logger.error('Failed to start server', error);
      process.exit(1);
    }
  };

  close = () =>
    new Promise((resolve, reject) => {
      this.#server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
}

module.exports = CustomerServer;
