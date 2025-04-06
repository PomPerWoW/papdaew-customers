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

const UserRoutes = require('#users/routes/user.route.js');
const StaffRoutes = require('#users/routes/staff.route.js');
const CustomerRoutes = require('#users/routes/customer.route.js');
const Config = require('#users/configs/config.js');

class UserServer {
  #app;
  #server;
  #logger;
  #config;
  #userRoutes;
  #customerRoutes;
  #staffRoutes;

  constructor() {
    this.#app = express();
    this.#config = new Config();
    this.#userRoutes = new UserRoutes();
    this.#customerRoutes = new CustomerRoutes();
    this.#staffRoutes = new StaffRoutes();
    this.#logger = new PinoLogger().child({
      service: 'User Server',
    });
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
    app.use('/api/v1/users', this.#userRoutes.setup());
    app.use('/api/v1/customers', this.#customerRoutes.setup());
    app.use('/api/v1/staff', this.#staffRoutes.setup());
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
    this.#server = http.createServer(app);

    this.#server.listen(this.#config.PORT, () => {
      this.#logger.info(`User service is running on port ${this.#config.PORT}`);
    });
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

module.exports = UserServer;
