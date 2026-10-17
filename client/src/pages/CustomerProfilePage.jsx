import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, MapPin, Plus, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';

const CustomerProfilePage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    street: '',
    apartment: '',
    city: 'Fatepura',
    state: 'Gujarat',
    postalCode: '389172',
    contactPhone: user?.phone || '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.contactPhone) {
      toast.error('Please enter your house/street address and contact phone.');
      return;
    }
    if (newAddr.postalCode !== '389172') {
      toast.error('Delivery is strictly restricted to Fatepura, PIN: 389172.');
      return;
    }
    try {
      const { data } = await api.post('/addresses', newAddr);
      if (data.success) {
        toast.success('Address saved!');
        setShowAddModal(false);
        fetchAddresses();
        setNewAddr({
          label: 'Home',
          street: '',
          apartment: '',
          city: 'Fatepura',
          state: 'Gujarat',
          postalCode: '389172',
          contactPhone: user?.phone || '',
          isDefault: false,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/addresses/${id}`);
      if (data.success) {
        toast.success('Address deleted.');
        setAddresses((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      toast.error('Could not delete address.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account & Addresses</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal profile and saved delivery destinations.
          </p>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-md shadow-brand-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-slate-600 uppercase">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-3 bg-stone-50 rounded-2xl flex items-center space-x-3">
              <Mail className="w-4 h-4 text-brand-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</p>
                <p className="font-bold text-slate-800">{user?.email}</p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl flex items-center space-x-3">
              <Phone className="w-4 h-4 text-brand-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</p>
                <p className="font-bold text-slate-800">{user?.phone || 'Not added'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-slate-500">Pick or edit addresses for 1-click checkout.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No saved delivery addresses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 rounded-2xl border border-stone-200 hover:border-brand-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 font-semibold mt-2">
                      {addr.street} {addr.apartment && `, ${addr.apartment}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Phone: {addr.contactPhone}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Add New Delivery Address</h3>

            {/* Exclusive Fatepura delivery banner */}
            <div className="mt-3 p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-[11px] flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span><strong>Exclusive Delivery:</strong> We only deliver to Fatepura (389172), Gujarat. Please specify your exact house, flat, or faliyu details.</span>
            </div>

            <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Label</label>
                  <select
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
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
                    value={newAddr.contactPhone}
                    onChange={(e) => setNewAddr({ ...newAddr, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  House / Flat / Faliyu / Street / Society <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                  placeholder="e.g. House No. 18, Sardar Patel Society, College Road"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City (Locked)</label>
                  <input
                    type="text"
                    readOnly
                    value={newAddr.city}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State (Locked)</label>
                  <input
                    type="text"
                    readOnly
                    value={newAddr.state}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Code (Locked)</label>
                  <input
                    type="text"
                    readOnly
                    value={newAddr.postalCode}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-slate-700 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerProfilePage;
