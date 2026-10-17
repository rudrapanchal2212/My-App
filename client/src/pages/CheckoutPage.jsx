import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';
import {
  MapPin,
  Plus,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Truck
} from 'lucide-react';

const CheckoutPage = () => {
  const { cartItems, currentShop, subtotalPaise, deliveryChargePaise, totalPaise, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New address form state (Restricted strictly to Fatepura 389172)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    apartment: '',
    city: 'Fatepura',
    state: 'Gujarat',
    postalCode: '389172',
    contactPhone: user?.phone || '',
    isDefault: true,
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shops');
    }
  }, [cartItems, navigate]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await api.get('/addresses');
        if (data.success && data.addresses.length > 0) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setShowAddAddress(true); // Open form if user has no addresses yet
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.contactPhone) {
      toast.error('Please fill in your house/street address and contact phone.');
      return;
    }

    if (newAddress.postalCode !== '389172') {
      toast.error('Delivery is strictly restricted to Fatepura, PIN: 389172.');
      return;
    }

    try {
      const { data } = await api.post('/addresses', newAddress);
      if (data.success) {
        setAddresses([data.address, ...addresses]);
        setSelectedAddressId(data.address._id);
        setShowAddAddress(false);
        toast.success('Address saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showAddAddress) {
      toast.error('Please select or add a delivery address.');
      return;
    }

    if (currentShop?.minOrderAmountPaise > 0 && subtotalPaise < currentShop.minOrderAmountPaise) {
      toast.error(`Minimum order amount for ${currentShop.name} is ${formatINR(currentShop.minOrderAmountPaise)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        shopId: currentShop._id,
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedOptions: [],
        })),
        addressId: selectedAddressId,
        specialInstructions,
        paymentMethod: 'cash_on_delivery',
      };

      const { data } = await api.post('/orders', orderPayload);
      if (data.success) {
        clearCart();
        toast.success('Order placed successfully! 🎉');
        navigate(`/order-tracking/${data.order._id}`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit order. Please check item availability.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentShop) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ordering from <span className="font-bold text-slate-800">{currentShop.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Delivery Address</h3>
                </div>

                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
              {!showAddAddress && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`block p-4 rounded-2xl border cursor-pointer transition ${
                        selectedAddressId === addr._id
                          ? 'border-brand-500 bg-brand-50/40'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="delivery_address"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1 text-brand-500 focus:ring-brand-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded-md bg-stone-100">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-semibold text-brand-600 uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-700">
                            {addr.street} {addr.apartment && `, ${addr.apartment}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Contact Phone: <span className="font-semibold">{addr.contactPhone}</span>
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add New Address Inline Form */}
              {showAddAddress && (
                <form onSubmit={handleSaveAddress} className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">New Address Details</span>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Exclusive Fatepura delivery banner */}
                  <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-[11px] flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span><strong>Exclusive Delivery:</strong> We only deliver to Fatepura (389172), Gujarat. Please specify your exact house, flat, or faliyu details below.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Label</label>
                      <select
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={newAddress.contactPhone}
                        onChange={(e) => setNewAddress({ ...newAddress, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      House / Flat / Society / Faliyu / Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. House No. 24, Patel Faliyu, Near Station Road"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">City (Locked)</label>
                      <input
                        type="text"
                        readOnly
                        value={newAddress.city}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">State (Locked)</label>
                      <input
                        type="text"
                        readOnly
                        value={newAddress.state}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Code (Locked)</label>
                      <input
                        type="text"
                        readOnly
                        value={newAddress.postalCode}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-700 font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Save & Use Address
                  </button>
                </form>
              )}
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-fresh-500/10 text-fresh-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900">Payment Option</h3>
              </div>

              <div className="p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/20 flex items-start space-x-3">
                <input type="radio" checked readOnly className="mt-1 text-brand-500" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay with physical cash or scan rider's UPI QR upon arrival at your doorstep.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-slate-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Secure payment gateway integration ready for future card & net banking expansion.</span>
              </div>
            </div>

            {/* 3. Special Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Delivery Instructions (Optional)</h3>
              <textarea
                rows={2}
                placeholder="e.g. Please do not ring doorbell, leave at front security gate..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
              />
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 sticky top-28">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            {/* Items Snapshot */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
              {cartItems.map((item) => (
                <div key={item.product._id} className="pt-2 flex justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">{item.quantity}x</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatINR(item.product.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryChargePaise === 0 ? (
                    <span className="text-fresh-600 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="font-semibold text-slate-800">{formatINR(deliveryChargePaise)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-brand-600">{formatINR(totalPaise)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || (!selectedAddressId && !showAddAddress)}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order • {formatINR(totalPaise)}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              By clicking Place Order, you confirm your cash on delivery agreement with {currentShop.name}.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
