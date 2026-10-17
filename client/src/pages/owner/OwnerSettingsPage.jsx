import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../utils/currency';
import toast from 'react-hot-toast';
import { Settings, Save, Store, Clock, Bike, ShieldCheck, Sparkles } from 'lucide-react';

const categories = [
  'Restaurant',
  'Fast Food',
  'Grocery',
  'Bakery',
  'Fruits and Vegetables',
  'Other',
];

const OwnerSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    name: '',
    category: 'Restaurant',
    description: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    isOperating: true,
    estimatedDeliveryTime: '25-35 mins',
    operatingOpen: '08:00',
    operatingClose: '22:00',
    deliveryChargeRupees: '40',
    minOrderRupees: '150',
    freeDeliveryThresholdRupees: '500',
  });

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await api.get('/shops/my-shop');
        if (data.success && data.shop) {
          const s = data.shop;
          setSettings({
            name: s.name,
            category: s.category,
            description: s.description || '',
            street: s.address?.street || '',
            city: s.address?.city || '',
            state: s.address?.state || '',
            postalCode: s.address?.postalCode || '',
            phone: s.phone || '',
            email: s.email || '',
            isOperating: s.isOperating,
            estimatedDeliveryTime: s.estimatedDeliveryTime || '25-35 mins',
            operatingOpen: s.operatingHours?.open || '08:00',
            operatingClose: s.operatingHours?.close || '22:00',
            deliveryChargeRupees: paiseToRupees(s.deliveryChargePaise).toString(),
            minOrderRupees: paiseToRupees(s.minOrderAmountPaise).toString(),
            freeDeliveryThresholdRupees: paiseToRupees(s.freeDeliveryThresholdPaise).toString(),
          });
        }
      } catch (err) {
        console.error('Error fetching shop settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: settings.name,
        category: settings.category,
        description: settings.description,
        street: settings.street,
        city: settings.city || 'Fatepura',
        state: settings.state || 'Gujarat',
        postalCode: '389172',
        phone: settings.phone,
        email: settings.email,
        isOperating: settings.isOperating,
        estimatedDeliveryTime: settings.estimatedDeliveryTime,
        operatingHours: {
          open: settings.operatingOpen,
          close: settings.operatingClose,
        },
        deliveryChargePaise: rupeesToPaise(Number(settings.deliveryChargeRupees) || 0),
        minOrderAmountPaise: rupeesToPaise(Number(settings.minOrderRupees) || 0),
        freeDeliveryThresholdPaise: rupeesToPaise(Number(settings.freeDeliveryThresholdRupees) || 0),
      };

      const { data } = await api.put('/shops/my-shop', payload);
      if (data.success) {
        toast.success('Shop settings and delivery fee rules updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-xs text-slate-400">Loading shop settings...</p>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shop & Delivery Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure operating hours, store details, and independent delivery pricing rules in ₹.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Operating Toggle & Delivery Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Store Operating Status</h3>
              <p className="text-xs text-slate-500">Toggle whether your shop is currently accepting orders.</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, isOperating: !settings.isOperating })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                settings.isOperating
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-red-500 text-white shadow-sm shadow-red-500/20'
              }`}
            >
              {settings.isOperating ? 'Currently Open' : 'Store Closed'}
            </button>
          </div>

          <div className="pt-2">
            <div className="flex items-center space-x-2 mb-1">
              <Bike className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-brand-600">
                Independent Delivery Charges & Rules (In ₹)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Stored in database as integer paise. Super Admin cannot override your values.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={settings.deliveryChargeRupees}
                  onChange={(e) => setSettings({ ...settings, deliveryChargeRupees: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={settings.minOrderRupees}
                  onChange={(e) => setSettings({ ...settings, minOrderRupees: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Free Delivery Above (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={settings.freeDeliveryThresholdRupees}
                  onChange={(e) => setSettings({ ...settings, freeDeliveryThresholdRupees: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Operating Hours & Logistics */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Operating Schedule & Dispatch Time</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={settings.operatingOpen}
                onChange={(e) => setSettings({ ...settings, operatingOpen: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={settings.operatingClose}
                onChange={(e) => setSettings({ ...settings, operatingClose: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Delivery Time</label>
              <input
                type="text"
                value={settings.estimatedDeliveryTime}
                onChange={(e) => setSettings({ ...settings, estimatedDeliveryTime: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                placeholder="e.g. 25-35 mins"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Business Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Business Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={settings.category}
                onChange={(e) => setSettings({ ...settings, category: e.target.value })}
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
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={settings.street}
              onChange={(e) => setSettings({ ...settings, street: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">City (Locked)</label>
              <input
                type="text"
                readOnly
                value={settings.city || 'Fatepura'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">State (Locked)</label>
              <input
                type="text"
                readOnly
                value={settings.state || 'Gujarat'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code (Locked)</label>
              <input
                type="text"
                readOnly
                value={settings.postalCode || '389172'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-500/25 transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>

      </form>

    </div>
  );
};

export default OwnerSettingsPage;
