const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    lastLoginAt: Date,
    role: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN'],
      default: 'CUSTOMER',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
