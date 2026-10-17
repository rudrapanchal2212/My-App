const { z } = require('zod');

// Customer Registration
const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Shop Owner + Initial Shop Registration
const registerShopOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name is required').max(120),
  category: z.enum([
    'Restaurant',
    'Fast Food',
    'Grocery',
    'Bakery',
    'Fruits and Vegetables',
    'Other',
  ]),
  description: z.string().max(1000).optional().default(''),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional().default(''),
  postalCode: z.string().min(3, 'Postal code is required'),
  deliveryChargePaise: z.number().int().min(0).optional().default(4000), // Default ₹40
  minOrderAmountPaise: z.number().int().min(0).optional().default(0),
  freeDeliveryThresholdPaise: z.number().int().min(0).optional().default(50000), // Default ₹500
});

// Login
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Product Creation/Update
const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(120),
  description: z.string().max(1000).optional().default(''),
  category: z.string().min(1, 'Product category is required'),
  image: z.string().url().optional(),
  pricePaise: z.number().int().min(0, 'Price must be a positive integer in paise'),
  originalPricePaise: z.number().int().min(0).optional().default(0),
  stockQuantity: z.number().int().min(0).optional().default(50),
  isAvailable: z.boolean().optional().default(true),
  options: z
    .array(
      z.object({
        name: z.string(),
        pricePaise: z.number().int().min(0).default(0),
        isRequired: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
});

// Shop Settings Update
const updateShopSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  category: z
    .enum(['Restaurant', 'Fast Food', 'Grocery', 'Bakery', 'Fruits and Vegetables', 'Other'])
    .optional(),
  description: z.string().max(1000).optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  street: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  postalCode: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isOperating: z.boolean().optional(),
  operatingHours: z
    .object({
      open: z.string(),
      close: z.string(),
    })
    .optional(),
  estimatedDeliveryTime: z.string().optional(),
  minOrderAmountPaise: z.number().int().min(0).optional(),
  deliveryChargePaise: z.number().int().min(0).optional(),
  freeDeliveryThresholdPaise: z.number().int().min(0).optional(),
});

// Add Delivery Partner
const createDeliveryPartnerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required').toLowerCase(),
  phone: z.string().min(7, 'Phone number required').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  vehicleType: z.enum(['Bike', 'Scooter', 'Bicycle', 'Car', 'Van', 'Other']).default('Bike'),
  vehicleNumber: z.string().optional().default(''),
  drivingLicenseNumber: z.string().optional().default(''),
  photoUrl: z.string().url().optional(),
});

// Address Schema strictly restricted to Fatepura, Gujarat (389172)
const createAddressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  street: z.string().min(3, 'House number, society, faliyu or street address is required'),
  apartment: z.string().optional().default(''),
  city: z.string().default('Fatepura'),
  state: z.string().default('Gujarat'),
  postalCode: z
    .string()
    .trim()
    .refine((val) => val === '389172', {
      message: 'Service area restricted: Delivery is available only in Fatepura (PIN: 389172), Gujarat.',
    }),
  contactPhone: z.string().min(7, 'Contact phone is required'),
  isDefault: z.boolean().optional().default(false),
});

// Order Placement Schema with strict Fatepura delivery restriction
const createOrderSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        selectedOptions: z.array(z.any()).optional().default([]),
      })
    )
    .min(1, 'At least one item is required in the cart'),
  addressId: z.string().optional(),
  deliveryAddress: z
    .object({
      street: z.string().min(1, 'House number and street details required'),
      apartment: z.string().optional(),
      city: z.string().default('Fatepura'),
      state: z.string().default('Gujarat'),
      postalCode: z
        .string()
        .trim()
        .refine((val) => val === '389172', {
          message: 'Delivery is available only in Fatepura (PIN: 389172), Gujarat.',
        }),
      contactPhone: z.string().min(1),
      label: z.string().optional(),
    })
    .optional(),
  paymentMethod: z.enum(['cash_on_delivery', 'online_card', 'upi', 'wallet']).default('cash_on_delivery'),
  specialInstructions: z.string().max(500).optional().default(''),
});

// Middleware generator for Zod validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Use sanitized & parsed data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = {
  registerCustomerSchema,
  registerShopOwnerSchema,
  loginSchema,
  productSchema,
  updateShopSchema,
  createDeliveryPartnerSchema,
  createAddressSchema,
  createOrderSchema,
  validateRequest,
};
