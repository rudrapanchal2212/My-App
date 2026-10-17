const mongoose = require('mongoose');

const productOptionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pricePaise: { type: Number, default: 0, min: 0 },
  isRequired: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    },
    // Selling price in paise (integer)
    pricePaise: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    // Original price in paise (integer) for discount calculations
    originalPricePaise: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stockQuantity: {
      type: Number,
      default: 50,
      min: [0, 'Stock cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    options: [productOptionSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying products of a specific shop
productSchema.index({ shop: 1, isAvailable: 1 });
productSchema.index({ shop: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
