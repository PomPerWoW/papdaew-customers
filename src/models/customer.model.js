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
    favoriteVendors: [
      {
        vendorId: { type: String, required: true },
        vendorName: String,
        addedAt: { type: Date, default: Date.now },
        frequencyVisited: { type: Number, default: 0 },
        lastVisited: Date,
      },
    ],
    upcomingReservations: [
      {
        reservationId: { type: String, required: true },
        vendorId: { type: String, required: true },
        vendorName: String,
        serviceType: String,
        reservationTime: { type: Date, required: true },
        status: {
          type: String,
          enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
          default: 'CONFIRMED',
        },
        partySize: Number,
        notes: String,
        reminderSent: { type: Boolean, default: false },
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
      mostVisitedVendorId: String,
      mostVisitedVendorCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
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

    // Update favorite vendor statistics
    this._updateFavoriteVendorStats(queueData.vendorId, queueData.vendorName);

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

// Method to add a favorite vendor
customerSchema.methods.addFavoriteVendor = function (vendorData) {
  // Check if vendor already exists in favorites
  const existingIndex = this.favoriteVendors.findIndex(
    v => v.vendorId === vendorData.vendorId
  );

  if (existingIndex === -1) {
    this.favoriteVendors.push(vendorData);
  }

  return this.save();
};

// Method to remove a favorite vendor
customerSchema.methods.removeFavoriteVendor = function (vendorId) {
  this.favoriteVendors = this.favoriteVendors.filter(
    v => v.vendorId !== vendorId
  );

  return this.save();
};

// Method to add an upcoming reservation
customerSchema.methods.addReservation = function (reservationData) {
  this.upcomingReservations.push(reservationData);
  return this.save();
};

// Method to cancel a reservation
customerSchema.methods.cancelReservation = function (reservationId) {
  const reservationIndex = this.upcomingReservations.findIndex(
    r => r.reservationId === reservationId
  );

  if (reservationIndex !== -1) {
    this.upcomingReservations[reservationIndex].status = 'CANCELLED';
    return this.save();
  }

  return Promise.reject(new Error('Reservation not found'));
};

// Private method to update favorite vendor statistics
customerSchema.methods._updateFavoriteVendorStats = function (
  vendorId,
  vendorName
) {
  // Find the vendor in favorites
  const vendorIndex = this.favoriteVendors.findIndex(
    v => v.vendorId === vendorId
  );

  if (vendorIndex !== -1) {
    // Update existing vendor
    this.favoriteVendors[vendorIndex].frequencyVisited += 1;
    this.favoriteVendors[vendorIndex].lastVisited = new Date();
  } else {
    // Add new vendor to favorites if they've visited
    this.favoriteVendors.push({
      vendorId,
      vendorName,
      frequencyVisited: 1,
      lastVisited: new Date(),
    });
  }

  // Update most visited vendor statistics
  if (
    !this.statistics.mostVisitedVendorId ||
    this.favoriteVendors[vendorIndex]?.frequencyVisited >
      this.statistics.mostVisitedVendorCount
  ) {
    this.statistics.mostVisitedVendorId = vendorId;
    this.statistics.mostVisitedVendorCount =
      this.favoriteVendors[vendorIndex]?.frequencyVisited || 1;
  }
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
