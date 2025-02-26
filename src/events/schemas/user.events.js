const USER_CREATED = {
  type: 'object',
  required: ['id', 'email', 'username', 'role', 'timestamp', 'version'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    role: { type: 'string', enum: ['CUSTOMER', 'VENDOR', 'ADMIN'] },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phoneNumber: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'integer', minimum: 1 },
  },
};

const USER_UPDATED = {
  type: 'object',
  required: ['id', 'changes', 'timestamp', 'version'],
  properties: {
    id: { type: 'string' },
    changes: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phoneNumber: { type: 'string' },
        role: { type: 'string', enum: ['CUSTOMER', 'VENDOR', 'ADMIN'] },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'integer', minimum: 1 },
  },
};

const USER_DELETED = {
  type: 'object',
  required: ['id', 'timestamp', 'version'],
  properties: {
    id: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'integer', minimum: 1 },
  },
};

module.exports = {
  USER_CREATED,
  USER_UPDATED,
  USER_DELETED,
};
