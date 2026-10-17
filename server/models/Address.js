const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      default: 'Fatepura',
      trim: true,
    },
    state: {
      type: String,
      default: 'Gujarat',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '389172',
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ customer: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);
