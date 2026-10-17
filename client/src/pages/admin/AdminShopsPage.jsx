import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Power
} from 'lucide-react';

const AdminShopsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [selectedShop, setSelectedShop] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/admin/shops', { params });
      if (data.success) {
        setShops(data.shops);
      }
    } catch (err) {
      console.error('Error fetching admin shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [statusFilter, search]);

  const handleApprove = async (shopId) => {
    setActionLoading(true);
    try {
      const { data } = await api.put(`/admin/shops/${shopId}/approve`);
      if (data.success) {
        toast.success(`Shop "${data.shop.name}" approved successfully!`);
        fetchShops();
        setSelectedShop(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve shop.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await api.put(`/admin/shops/${selectedShop._id}/reject`, {
        reason: rejectionReason.trim(),
      });
      if (data.success) {
        toast.success('Shop application rejected.');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedShop(null);
        fetchShops();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject shop.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (shopId) => {
    try {
      const { data } = await api.put(`/admin/shops/${shopId}/toggle-status`);
      if (data.success) {
        toast.success(data.message);
        fetchShops();
      }
    } catch (err) {
      toast.error('Failed to change shop status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shop Approvals & Fleet</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review vendor applications, verify business addresses, approve or suspend shops.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by shop name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading shops...</p>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold">No shops match the selected status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Shop</th>
                  <th className="py-3.5 px-4">Owner Info</th>
                  <th className="py-3.5 px-4">Category & City</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Delivery Setup</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={shop.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80'}
                          alt={shop.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{shop.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{shop.address?.street}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{shop.owner?.name}</p>
                      <p className="text-[11px] text-slate-500">{shop.owner?.email}</p>
                      <p className="text-[11px] text-slate-400">{shop.phone || shop.owner?.phone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700">{shop.category}</span>
                      <p className="text-[11px] text-slate-400">{shop.address?.city}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          shop.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : shop.approvalStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : shop.approvalStatus === 'suspended'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shop.approvalStatus}
                      </span>
                      {shop.rejectionReason && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-xs italic line-clamp-1">
                          Reason: {shop.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">
                        Fee: {formatINR(shop.deliveryChargePaise)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Threshold: {formatINR(shop.freeDeliveryThresholdPaise)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {shop.approvalStatus === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(shop._id)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition"
                              title="Approve Shop"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedShop(shop);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition"
                              title="Reject Shop"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(shop._id)}
                            className={`p-2 rounded-xl transition ${
                              shop.approvalStatus === 'suspended'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600'
                            }`}
                            title={shop.approvalStatus === 'suspended' ? 'Reactivate Shop' : 'Suspend Shop'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedShop(shop)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shop Details Modal */}
      {selectedShop && !showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedShop.logo}
                  alt={selectedShop.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedShop.name}</h3>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {selectedShop.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedShop.description}</p>

            <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs text-slate-700 border border-stone-200">
              <p className="font-bold text-slate-900">Owner & Location Information</p>
              <p>Owner: <span className="font-semibold">{selectedShop.owner?.name}</span></p>
              <p>Email: <span className="font-semibold">{selectedShop.owner?.email}</span></p>
              <p>Phone: <span className="font-semibold">{selectedShop.phone || selectedShop.owner?.phone}</span></p>
              <p>Address: <span className="font-semibold">{selectedShop.address?.street}, {selectedShop.address?.city} ({selectedShop.address?.postalCode})</span></p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {selectedShop.approvalStatus === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-700 font-bold text-xs rounded-xl hover:bg-red-100"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedShop._id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Approve Shop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Reject Shop Registration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Please specify the rejection reason for {selectedShop?.name}. The owner will receive this note.
            </p>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Incomplete business address or unverifiable contact phone..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminShopsPage;
