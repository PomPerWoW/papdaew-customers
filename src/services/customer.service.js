const { NotFoundError } = require('@papdaew/shared');

const Customer = require('#customers/models/customer.model.js');

class CustomerService {
  createCustomer = async customerData => {
    const customer = new Customer({
      _id: customerData.id,
      username: customerData.username,
      email: customerData.email,
      role: customerData.role,
    });

    const savedCustomer = await customer.save();

    return savedCustomer;
  };

  getCustomerById = async id => {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  };
}

module.exports = CustomerService;
