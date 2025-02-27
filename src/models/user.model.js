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
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN'],
      default: 'CUSTOMER',
      required: true,
    },
    profileImage: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
      default: 'ACTIVE',
    },
    preferences: {
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      theme: { type: String, default: 'light' },
      timezone: { type: String, default: 'UTC' },
    },
    metadata: {
      registrationSource: String,
      registrationDate: { type: Date, default: Date.now },
      verifiedEmail: { type: Boolean, default: false },
      verifiedPhone: { type: Boolean, default: false },
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
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual to get the full name
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Method to check if user has a specific role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Method to update user preferences
userSchema.methods.updatePreferences = function (preferences) {
  Object.assign(this.preferences, preferences);
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
