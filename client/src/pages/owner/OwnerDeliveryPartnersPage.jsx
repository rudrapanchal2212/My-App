import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Bike, Plus, User, Phone, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

const OwnerDeliveryPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    drivingLicenseNumber: '',
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shops/my-shop/delivery-partners');
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.error('Error fetching delivery partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/shops/my-shop/delivery-partners', formData);
      if (data.success) {
        toast.success('Delivery partner registered & linked to your shop fleet!');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          vehicleType: 'Bike',
          vehicleNumber: '',
          drivingLicenseNumber: '',
        });
        fetchPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register delivery partner.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Delivery Fleet</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register and manage your dedicated drivers to deliver customer orders fast.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Partner</span>
        </button>
      </div>

      {/* Fleet Cards Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading fleet drivers...</p>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold">No delivery partners registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your delivery staff so you can assign outgoing deliveries.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {partners.map((p) => (
              <div key={p._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center text-sm uppercase">
                    {p.user?.name?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{p.user?.name}</h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {p.approvalStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vehicle: <span className="font-semibold text-slate-800">{p.vehicleType}</span> ({p.vehicleNumber || 'No plate'})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {p.user?.email} • {p.user?.phone}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <p className="font-bold text-slate-900">{p.totalDeliveries} Deliveries Completed</p>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {p.isAvailable ? '● Ready for dispatch' : '○ Busy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Add New Fleet Partner</h3>
            <p className="text-xs text-slate-500 mt-1">
              Creates a dedicated delivery login linked directly to your shop.
            </p>

            <form onSubmit={handleCreatePartner} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200"
                    placeholder="rider@delivery.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200"
                    placeholder="+91 9800000010"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Bike">Bike / Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate #</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200"
                    placeholder="MH-01-AB-1234"
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
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  {submitting ? 'Creating...' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDeliveryPartnersPage;
