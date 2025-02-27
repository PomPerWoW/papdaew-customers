const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    businessDescription: String,
    businessType: {
      type: String,
      enum: [
        'RESTAURANT',
        'RETAIL',
        'HEALTHCARE',
        'GOVERNMENT',
        'FINANCIAL',
        'EDUCATION',
        'BEAUTY',
        'FITNESS',
        'ENTERTAINMENT',
        'OTHER',
      ],
      required: true,
    },
    contactEmail: String,
    contactPhone: String,
    website: String,
    logo: String,
    bannerImage: String,
    businessHours: [
      {
        day: { type: Number, min: 0, max: 6 }, // 0 = Sunday, 6 = Saturday
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      line: String,
    },
    services: [
      {
        serviceId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        estimatedDuration: Number, // in minutes
        price: Number,
        currency: { type: String, default: 'THB' },
        isActive: { type: Boolean, default: true },
        category: String,
        image: String,
      },
    ],
    activeQueues: [
      {
        queueId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        serviceType: String,
        isActive: { type: Boolean, default: true },
        currentNumber: { type: Number, default: 0 },
        lastCalledNumber: { type: Number, default: 0 },
        totalWaiting: { type: Number, default: 0 },
        estimatedWaitTime: { type: Number, default: 0 }, // in minutes
        startTime: Date,
        endTime: Date,
        status: {
          type: String,
          enum: ['OPEN', 'CLOSED', 'PAUSED'],
          default: 'OPEN',
        },
        customSettings: {
          maxCapacity: Number,
          serviceTime: Number, // in minutes
          allowFastTrack: Boolean,
          allowReservations: Boolean,
        },
      },
    ],
    queueSettings: {
      maxConcurrentQueues: { type: Number, default: 1 },
      allowReservations: { type: Boolean, default: true },
      allowFastTrack: { type: Boolean, default: false },
      defaultEstimatedServiceTime: { type: Number, default: 15 }, // in minutes
      notificationLeadTime: { type: Number, default: 10 }, // in minutes
      autoCloseQueueTime: String,
      maxDailyCapacity: Number,
      customerNoShowTimeout: { type: Number, default: 10 }, // in minutes
      fastTrackPriority: { type: Number, default: 2 }, // How many positions ahead fast track customers are placed
    },
    statistics: {
      totalCustomersServed: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 },
      averageServiceTime: { type: Number, default: 0 },
      customerSatisfaction: { type: Number, min: 1, max: 5, default: 0 },
      totalReservations: { type: Number, default: 0 },
      totalFastTrackUsed: { type: Number, default: 0 },
      mostPopularService: String,
      mostPopularServiceCount: { type: Number, default: 0 },
      repeatCustomerRate: { type: Number, default: 0 }, // Percentage
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      queueThresholdAlert: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
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

// Virtual to get the user details
vendorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Method to add a new queue
vendorSchema.methods.addQueue = function (queueData) {
  // Ensure queueId is set
  if (!queueData.queueId) {
    queueData.queueId = new mongoose.Types.ObjectId().toString();
  }

  this.activeQueues.push(queueData);
  return this.save();
};

// Method to update a queue
vendorSchema.methods.updateQueue = function (queueId, updateData) {
  const queueIndex = this.activeQueues.findIndex(q => q.queueId === queueId);

  if (queueIndex !== -1) {
    Object.assign(this.activeQueues[queueIndex], updateData);
    return this.save();
  }

  return Promise.reject(new Error('Queue not found'));
};

// Method to add a service
vendorSchema.methods.addService = function (serviceData) {
  // Ensure serviceId is set
  if (!serviceData.serviceId) {
    serviceData.serviceId = new mongoose.Types.ObjectId().toString();
  }

  this.services.push(serviceData);
  return this.save();
};

// Method to update a service
vendorSchema.methods.updateService = function (serviceId, updateData) {
  const serviceIndex = this.services.findIndex(s => s.serviceId === serviceId);

  if (serviceIndex !== -1) {
    Object.assign(this.services[serviceIndex], updateData);
    return this.save();
  }

  return Promise.reject(new Error('Service not found'));
};

// Method to update queue settings
vendorSchema.methods.updateQueueSettings = function (queueSettings) {
  Object.assign(this.queueSettings, queueSettings);
  return this.save();
};

// Method to update statistics
vendorSchema.methods.updateStatistics = function (statsData) {
  // Update total customers served
  if (statsData.customersServed) {
    this.statistics.totalCustomersServed += statsData.customersServed;
  }

  // Update wait time statistics
  if (statsData.waitTime) {
    const currentTotal =
      this.statistics.averageWaitTime *
      (this.statistics.totalCustomersServed - statsData.customersServed || 1);
    const newTotal =
      currentTotal + statsData.waitTime * statsData.customersServed;
    this.statistics.averageWaitTime =
      newTotal / this.statistics.totalCustomersServed;
  }

  // Update service time statistics
  if (statsData.serviceTime) {
    const currentTotal =
      this.statistics.averageServiceTime *
      (this.statistics.totalCustomersServed - statsData.customersServed || 1);
    const newTotal =
      currentTotal + statsData.serviceTime * statsData.customersServed;
    this.statistics.averageServiceTime =
      newTotal / this.statistics.totalCustomersServed;
  }

  // Update customer satisfaction
  if (statsData.satisfaction) {
    // Weighted average for customer satisfaction
    const currentSatisfaction = this.statistics.customerSatisfaction || 0;
    const currentCount =
      this.statistics.totalCustomersServed - statsData.customersServed || 1;
    const newSatisfaction = statsData.satisfaction;
    const satisfactionCount =
      statsData.satisfactionCount || statsData.customersServed || 1;

    this.statistics.customerSatisfaction =
      (currentSatisfaction * currentCount +
        newSatisfaction * satisfactionCount) /
      (currentCount + satisfactionCount);
  }

  // Update reservation and fast track counts
  if (statsData.reservations) {
    this.statistics.totalReservations += statsData.reservations;
  }

  if (statsData.fastTrack) {
    this.statistics.totalFastTrackUsed += statsData.fastTrack;
  }

  // Update popular service stats
  if (statsData.serviceId && statsData.serviceCount) {
    if (statsData.serviceCount > this.statistics.mostPopularServiceCount) {
      this.statistics.mostPopularService = statsData.serviceId;
      this.statistics.mostPopularServiceCount = statsData.serviceCount;
    }
  }

  // Update repeat customer rate if provided
  if (statsData.repeatCustomerRate !== undefined) {
    this.statistics.repeatCustomerRate = statsData.repeatCustomerRate;
  }

  return this.save();
};

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
