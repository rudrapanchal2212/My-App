const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop owner is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Restaurant',
        'Fast Food',
        'Grocery',
        'Bakery',
        'Fruits and Vegetables',
        'Other',
      ],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
    },
    address: {
      street: { type: String, required: [true, 'Street address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    documents: [
      {
        name: { type: String, default: 'Registration Doc' },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    isOperating: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
    estimatedDeliveryTime: {
      type: String,
      default: '25-35 mins',
    },
    // Monetary values stored in integer paise:
    minOrderAmountPaise: {
      type: Number,
      default: 0, // e.g. 15000 = ₹150
      min: 0,
    },
    deliveryChargePaise: {
      type: Number,
      default: 4000, // 4000 paise = ₹40
      min: 0,
    },
    freeDeliveryThresholdPaise: {
      type: Number,
      default: 50000, // 50000 paise = ₹500 (0 means disabled)
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
shopSchema.index({ approvalStatus: 1, isOperating: 1 });
shopSchema.index({ name: 'text', description: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Shop', shopSchema);
