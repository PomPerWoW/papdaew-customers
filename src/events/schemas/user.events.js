const USER_CREATED = {
  type: 'object',
  required: ['id', 'email', 'username', 'role'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    role: { type: 'string', enum: ['CUSTOMER', 'VENDOR', 'ADMIN', 'STAFF'] },
    vendorId: { type: 'string' },
    isRoot: { type: 'boolean' },
    position: { type: 'string' },
    branchId: { type: 'string' },
  },
};

const USER_UPDATED = {
  type: 'object',
  required: ['id', 'changes'],
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
  },
};

const USER_DELETED = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
};

module.exports = {
  USER_CREATED,
  USER_UPDATED,
  USER_DELETED,
};
