const mongoose = require('mongoose');
const { PinoLogger } = require('@papdaew/shared');

const Config = require('#users/configs/config.js');

class Database {
  #logger;
  #config;
  static #instance;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.#config = new Config();
    this.#logger = new PinoLogger().child({ service: 'Database' });
    Database.#instance = this;
  }

  connect = async () => {
    try {
      await mongoose.connect(this.#config.MONGODB_URI);
      this.#logger.info('Successfully connected to MongoDB');
    } catch (error) {
      this.#logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  };

  disconnect = async () => {
    await mongoose.disconnect();
  };
}

module.exports = Database;
