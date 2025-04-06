const { Router } = require('express');

const UserMiddleware = require('#users/middlewares/user.middleware.js');
const StaffController = require('#users/controllers/staff.controller.js');

class StaffRoutes {
  #router;
  #staffController;
  #userMiddleware;

  constructor() {
    this.#router = Router();
    this.#staffController = new StaffController();
    this.#userMiddleware = new UserMiddleware();
  }

  setup() {
    // Create staff and get all staff
    this.#router
      .route('/')
      .post(
        this.#userMiddleware.internalAuthMiddleware,
        this.#staffController.createStaff
      )
      .get(this.#staffController.getStaff);

    // Get staff by user ID
    this.#router
      .route('/user/:userId')
      .get(this.#staffController.getStaffByUserId);

    // Get staff by vendor ID
    this.#router
      .route('/vendor/:vendorId')
      .get(this.#staffController.getStaffByVendorId);

    // Get staff by branch ID
    this.#router
      .route('/branch/:branchId')
      .get(this.#staffController.getStaffByBranchId);

    // Get, update, delete staff by ID
    this.#router
      .route('/:id')
      .get(this.#staffController.getStaffById)
      .put(
        this.#userMiddleware.internalAuthMiddleware,
        this.#staffController.updateStaff
      )
      .delete(
        this.#userMiddleware.internalAuthMiddleware,
        this.#staffController.deleteStaff
      );

    return this.#router;
  }
}

module.exports = StaffRoutes;
