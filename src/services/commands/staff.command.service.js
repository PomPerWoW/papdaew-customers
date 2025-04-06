const {
  PinoLogger,
  NotFoundError,
  BadRequestError,
} = require('@papdaew/shared');

const User = require('#users/models/user.model.js');
const Staff = require('#users/models/staff.model.js');

class StaffCommandService {
  #logger;

  constructor() {
    this.#logger = new PinoLogger().child({
      service: 'Staff Command Service',
    });
  }

  async createStaff(staffData) {
    try {
      const { userId, userData } = staffData;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }

      // Check if staff already exists for this user
      const existingStaff = await Staff.findOne({ userId });
      if (existingStaff) {
        throw new BadRequestError(`Staff with userId ${userId} already exists`);
      }

      // Update user role to STAFF
      user.role = 'STAFF';
      await user.save();

      // Create staff
      const staff = new Staff({
        userId,
        vendorId: userData.vendorId,
        branchId: userData.branchId || null,
        isRoot: userData.isRoot || false,
        position: userData.position,
        permissions: userData.permissions,
        status: 'ACTIVE',
      });

      await staff.save();

      return staff;
    } catch (error) {
      this.#logger.error(error, 'Failed to create staff');
      throw error;
    }
  }

  async updateStaff(staffId, updateData) {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new NotFoundError(`Staff with ID ${staffId} not found`);
      }

      // Update staff fields
      const allowedFields = [
        'branchId',
        'position',
        'permissions',
        'status',
        'isRoot',
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (
            field === 'permissions' &&
            typeof updateData[field] === 'object'
          ) {
            // Handle permissions object updates
            Object.keys(updateData.permissions).forEach(permission => {
              if (
                Object.prototype.hasOwnProperty.call(
                  staff.permissions,
                  permission
                )
              ) {
                staff.permissions[permission] =
                  updateData.permissions[permission];
              }
            });
          } else {
            staff[field] = updateData[field];
          }
        }
      });

      await staff.save();
      return staff;
    } catch (error) {
      this.#logger.error(error, `Failed to update staff with ID ${staffId}`);
      throw error;
    }
  }

  async deleteStaff(staffId) {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new NotFoundError(`Staff with ID ${staffId} not found`);
      }

      // Get the user associated with this staff
      const user = await User.findById(staff.userId);

      // Delete the staff
      await Staff.findByIdAndDelete(staffId);

      // Update user role if the user exists
      if (user) {
        user.role = 'CUSTOMER'; // Reset role to customer
        await user.save();
      }

      return { success: true };
    } catch (error) {
      this.#logger.error(error, `Failed to delete staff with ID ${staffId}`);
      throw error;
    }
  }
}

module.exports = StaffCommandService;
