import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rupeesToPaise } from '../utils/currency';
import { Store, User, Mail, Phone, Lock, MapPin, Tag, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

const categories = [
  'Restaurant',
  'Fast Food',
  'Grocery',
  'Bakery',
  'Fruits and Vegetables',
  'Other',
];

const RegisterShopOwnerPage = () => {
  const { registerShopOwner } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    shopName: '',
    category: 'Restaurant',
    description: '',
    street: '',
    city: 'Fatepura',
    state: 'Gujarat',
    postalCode: '389172',
    deliveryChargeRupees: '40',
    minOrderRupees: '150',
    freeDeliveryThresholdRupees: '500',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      shopName: formData.shopName,
      category: formData.category,
      description: formData.description,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      // Convert rupees input to integer paise for backend:
      deliveryChargePaise: rupeesToPaise(Number(formData.deliveryChargeRupees) || 40),
      minOrderAmountPaise: rupeesToPaise(Number(formData.minOrderRupees) || 0),
      freeDeliveryThresholdPaise: rupeesToPaise(Number(formData.freeDeliveryThresholdRupees) || 0),
    };

    const result = await registerShopOwner(payload);
    setSubmitting(false);

    if (result.success) {
      navigate('/owner');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Quick<span className="text-brand-500">Bite</span>
            </span>
          </Link>
          <h1 className="mt-4 text-3xl font-black text-slate-900 tracking-tight">
            Register Your Shop & Kitchen
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Take full control of your catalog, prices, and delivery partner fleet. All new registrations undergo quick Super Admin review.
          </p>
        </div>

        {/* Pending Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Admin Verification Notice:</span> Upon submission, your shop will receive a <span className="font-semibold underline">Pending Approval</span> status. Once the Super Admin reviews your business details, your shop will go live on the customer marketplace.
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-stone-200/50 border border-stone-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Owner Credentials */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 text-brand-600">
                1. Owner Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Chef Rajesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="owner@mykitchen.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Step 2: Shop Profile */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 text-brand-600">
                2. Shop & Business Profile
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                      placeholder="e.g. The Spice Garden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shop Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="Describe your specialties, cuisine style, fresh produce sources..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shop Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                    placeholder="Shop #, Street name, Landmark"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City (Locked)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.city}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">State (Locked)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.state}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code (Locked)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.postalCode}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-700 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Step 3: Owner-Configured Pricing & Delivery Rules */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-brand-600">
                  3. Your Delivery & Order Pricing Rules (In ₹)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                You independently control these charges. The Super Admin cannot override them.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryChargeRupees}
                    onChange={(e) => setFormData({ ...formData, deliveryChargeRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  />
                  <span className="text-[10px] text-slate-400">Stored as integer paise</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderRupees}
                    onChange={(e) => setFormData({ ...formData, minOrderRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  />
                  <span className="text-[10px] text-slate-400">0 for no minimum</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.freeDeliveryThresholdRupees}
                    onChange={(e) => setFormData({ ...formData, freeDeliveryThresholdRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  />
                  <span className="text-[10px] text-slate-400">0 to disable free delivery</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-500/25 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Shop Registration For Review</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RegisterShopOwnerPage;
