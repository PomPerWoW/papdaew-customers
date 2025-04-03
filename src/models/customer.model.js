const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      unique: true,
    },
    queueHistory: [
      {
        queueId: { type: String, required: true },
        vendorId: { type: String, required: true },
        vendorName: String,
        serviceType: String,
        status: {
          type: String,
          enum: [
            'JOINED',
            'WAITING',
            'PROCESSING',
            'COMPLETED',
            'CANCELLED',
            'NO_SHOW',
            'RESCHEDULED',
          ],
          default: 'JOINED',
        },
        queueNumber: Number,
        queueType: {
          type: String,
          enum: ['STANDARD', 'FAST_TRACK', 'RESERVATION'],
          default: 'STANDARD',
        },
        joinedAt: { type: Date, default: Date.now },
        estimatedWaitTime: Number, // in minutes
        actualWaitTime: Number, // in minutes
        notifiedAt: Date,
        startedAt: Date,
        completedAt: Date,
        rating: { type: Number, min: 1, max: 5 },
        feedback: String,
        notes: String,
      },
    ],
    activeQueues: [
      {
        queueId: { type: String, required: true },
        vendorId: { type: String, required: true },
        vendorName: String,
        queueNumber: Number,
        position: Number,
        estimatedWaitTime: Number, // in minutes
        joinedAt: { type: Date, default: Date.now },
        queueType: {
          type: String,
          enum: ['STANDARD', 'FAST_TRACK', 'RESERVATION'],
          default: 'STANDARD',
        },
        status: {
          type: String,
          enum: ['JOINED', 'WAITING', 'PROCESSING'],
          default: 'JOINED',
        },
      },
    ],
    statistics: {
      totalQueuesJoined: { type: Number, default: 0 },
      totalWaitTime: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 },
      cancelledQueues: { type: Number, default: 0 },
      completedQueues: { type: Number, default: 0 },
      noShowCount: { type: Number, default: 0 },
      fastTrackUsed: { type: Number, default: 0 },
      reservationsUsed: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
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

// Virtual to get the user details
customerSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Method to add a queue to history
customerSchema.methods.addQueueToHistory = function (queueData) {
  // First check if this queue is in activeQueues and remove it
  this.activeQueues = this.activeQueues.filter(
    q => q.queueId !== queueData.queueId
  );

  // Add to history
  this.queueHistory.push(queueData);
  this.statistics.totalQueuesJoined += 1;

  // Update statistics based on queue status
  if (queueData.status === 'COMPLETED') {
    this.statistics.completedQueues += 1;
    if (queueData.actualWaitTime) {
      this.statistics.totalWaitTime += queueData.actualWaitTime;
      this.statistics.averageWaitTime =
        this.statistics.totalWaitTime / this.statistics.completedQueues;
    }

    // Update rating statistics if provided
    if (queueData.rating) {
      const totalRatings =
        this.statistics.averageRating * (this.statistics.completedQueues - 1);
      this.statistics.averageRating =
        (totalRatings + queueData.rating) / this.statistics.completedQueues;
    }
  } else if (queueData.status === 'CANCELLED') {
    this.statistics.cancelledQueues += 1;
  } else if (queueData.status === 'NO_SHOW') {
    this.statistics.noShowCount += 1;
  }

  // Update queue type statistics
  if (queueData.queueType === 'FAST_TRACK') {
    this.statistics.fastTrackUsed += 1;
  } else if (queueData.queueType === 'RESERVATION') {
    this.statistics.reservationsUsed += 1;
  }

  return this.save();
};

// Method to add an active queue
customerSchema.methods.addActiveQueue = function (queueData) {
  // Check if already in active queues
  const existingIndex = this.activeQueues.findIndex(
    q => q.queueId === queueData.queueId
  );

  if (existingIndex === -1) {
    this.activeQueues.push(queueData);
  } else {
    // Update existing queue data
    this.activeQueues[existingIndex] = {
      ...this.activeQueues[existingIndex],
      ...queueData,
    };
  }

  return this.save();
};

// Method to update an active queue
customerSchema.methods.updateActiveQueue = function (queueId, updateData) {
  const queueIndex = this.activeQueues.findIndex(q => q.queueId === queueId);

  if (queueIndex !== -1) {
    this.activeQueues[queueIndex] = {
      ...this.activeQueues[queueIndex],
      ...updateData,
    };
    return this.save();
  }

  return Promise.reject(new Error('Active queue not found'));
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
