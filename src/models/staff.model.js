const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      enum: ['ROOT', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'OTHER'],
      default: 'OTHER',
    },
    permissions: {
      canManageQueue: { type: Boolean, default: false },
      canManageMenu: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
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
        // If staff is root, ensure all permissions are granted
        if (ret.isRoot) {
          ret.permissions = {
            canManageQueue: true,
            canManageMenu: true,
            canManageStaff: true,
            canViewReports: true,
            canManageSettings: true,
          };
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual to get the user details
staffSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
