const mongoose = require('mongoose');

const deliveryPartnerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Scooter', 'Bicycle', 'Car', 'Van', 'Other'],
      default: 'Bike',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    drivingLicenseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    // Configurable approval: 'pending', 'approved', 'rejected', 'suspended'
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved', // owner-created default is active/approved unless platform policy enforces admin verification
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

deliveryPartnerProfileSchema.index({ shop: 1, approvalStatus: 1, isAvailable: 1 });

module.exports = mongoose.model('DeliveryPartnerProfile', deliveryPartnerProfileSchema);
