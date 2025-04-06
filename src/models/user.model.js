const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, index: true, required: true, unique: true },
    email: { type: String, index: true, required: true, unique: true },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    role: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN', 'STAFF'],
      default: 'CUSTOMER',
      required: true,
    },
    profileImage: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual to get the full name
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Add virtual for customer data
userSchema.virtual('customer', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Add virtual for staff data
userSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Method to check if user has a specific role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
