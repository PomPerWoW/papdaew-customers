const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    lastLoginAt: Date,
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

const User = mongoose.model('User', userSchema);

module.exports = User;
