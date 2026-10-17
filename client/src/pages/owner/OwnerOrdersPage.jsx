import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bike,
  Clock,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const OwnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrdersAndPartners = async () => {
    try {
      const [ordersRes, partnersRes] = await Promise.all([
        api.get('/shops/my-shop/orders', {
          params: statusFilter !== 'all' ? { status: statusFilter } : {},
        }),
        api.get('/shops/my-shop/delivery-partners'),
      ]);

      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }
      if (partnersRes.data.success) {
        setDeliveryPartners(partnersRes.data.partners);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndPartners();
    const interval = setInterval(fetchOrdersAndPartners, 12000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleAcceptOrder = async (orderId) => {
    try {
      const { data } = await api.put(`/shops/my-shop/orders/${orderId}/accept`);
      if (data.success) {
        toast.success('Order accepted! Send to preparation.');
        fetchOrdersAndPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept order.');
    }
  };

  const handleRejectOrder = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data } = await api.put(`/shops/my-shop/orders/${selectedOrder._id}/reject`, {
        reason: rejectReason,
      });
      if (data.success) {
        toast.success('Order rejected and inventory stock restored.');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedOrder(null);
        fetchOrdersAndPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/shops/my-shop/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
        fetchOrdersAndPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleAssignPartner = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      toast.error('Please choose a delivery rider.');
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await api.put(`/shops/my-shop/orders/${selectedOrder._id}/assign-partner`, {
        partnerId: selectedPartnerId,
      });
      if (data.success) {
        toast.success('Order assigned to delivery rider!');
        setShowAssignModal(false);
        setSelectedOrder(null);
        fetchOrdersAndPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Operations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accept incoming orders, update kitchen preparation, and assign riders.
          </p>
        </div>

        <button
          onClick={fetchOrdersAndPartners}
          className="px-3.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-50 transition shadow-2xs flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Orders List Cards */}
      {loading ? (
        <p className="text-xs text-slate-400 p-8 text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No orders currently in this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-amber-300 transition space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-base text-slate-900">#{ord.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : ord.status === 'cancelled' || ord.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{formatINR(ord.totalPaise)}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    {ord.paymentMethod.replace(/_/g, ' ')} ({ord.paymentStatus})
                  </span>
                </div>
              </div>

              {/* Items Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs text-slate-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="font-bold text-slate-900 mb-1">Purchased Snapshot:</p>
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-semibold text-slate-900">{formatINR(it.totalPricePaise)}</span>
                    </div>
                  ))}
                  {ord.specialInstructions && (
                    <p className="pt-2 text-[11px] text-amber-700 italic border-t border-stone-200">
                      Note: "{ord.specialInstructions}"
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="font-bold text-slate-900 mb-1">Customer & Destination:</p>
                  <p className="font-semibold text-slate-800">{ord.customer?.name} ({ord.customer?.phone})</p>
                  <p>{ord.deliveryAddress?.street}, {ord.deliveryAddress?.city}</p>
                  <p className="pt-2 text-[11px] text-slate-500 border-t border-stone-200">
                    Delivery Partner:{' '}
                    <span className="font-bold text-slate-800">
                      {ord.deliveryPartner ? ord.deliveryPartner.name : 'Not yet assigned'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Workflow Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {ord.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
                    >
                      Reject Order
                    </button>
                    <button
                      onClick={() => handleAcceptOrder(ord._id)}
                      className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      Accept Order
                    </button>
                  </>
                )}

                {ord.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'preparing')}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
                  >
                    <ChefHat className="w-4 h-4 mr-1" />
                    <span>Start Kitchen Preparation</span>
                  </button>
                )}

                {ord.status === 'preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(ord._id, 'ready_for_pickup')}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {['accepted', 'preparing', 'ready_for_pickup'].includes(ord.status) && (
                  <button
                    onClick={() => {
                      setSelectedOrder(ord);
                      setShowAssignModal(true);
                    }}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <Bike className="w-4 h-4 mr-1" />
                    <span>{ord.deliveryPartner ? 'Reassign Rider' : 'Assign Delivery Partner'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Delivery Partner Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">
              Assign Rider for Order #{selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select one of your store's approved delivery partners.
            </p>

            {deliveryPartners.length === 0 ? (
              <div className="my-6 p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs text-center">
                <p className="font-bold">No Delivery Partners Registered</p>
                <p className="mt-1">Add your riders in the Delivery Partners tab first.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignPartner} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Choose Rider</label>
                  <select
                    required
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="">-- Select Active Driver --</option>
                    {deliveryPartners.map((dp) => (
                      <option key={dp._id} value={dp._id}>
                        {dp.user?.name} ({dp.vehicleType} - {dp.vehicleNumber || 'No plate'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                  >
                    {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Decline Incoming Order</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide a reason to the customer. Item stock will be immediately restored.
            </p>

            <form onSubmit={handleRejectOrder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Kitchen is at maximum capacity / Item out of stock"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
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
                  {actionLoading ? 'Declining...' : 'Decline Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerOrdersPage;
