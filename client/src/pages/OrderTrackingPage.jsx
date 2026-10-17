import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Home,
  MapPin,
  Phone,
  Star,
  RefreshCw,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  ShieldCheck
} from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Order Placed', desc: 'Sent to shop for confirmation' },
  { key: 'preparing', label: 'Preparing', desc: 'Shop is preparing your items' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { key: 'delivered', label: 'Delivered', desc: 'Order completed' },
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      if (data.success) {
        setOrder(data.order);
        setCancelModalOpen(false);
        toast.success('Order cancelled successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/orders/reviews', {
        orderId: order._id,
        rating,
        comment: reviewComment,
      });
      if (data.success) {
        toast.success('Review submitted! Thank you.');
        setReviewModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading order timeline...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-base text-slate-800">Order not found</h3>
          <Link to="/my-orders" className="mt-4 inline-block text-xs font-bold text-brand-600">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Determine active step index
  const getStepStatus = (stepKey) => {
    if (order.status === 'cancelled' || order.status === 'rejected') return 'cancelled';
    const statusOrder = ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);

    if (stepKey === 'pending') return currentIdx >= 0 ? 'completed' : 'upcoming';
    if (stepKey === 'preparing') return currentIdx >= 2 ? 'completed' : currentIdx === 1 ? 'active' : 'upcoming';
    if (stepKey === 'out_for_delivery') return currentIdx >= 4 ? 'completed' : currentIdx === 3 ? 'active' : 'upcoming';
    if (stepKey === 'delivered') return currentIdx === 5 ? 'completed' : 'upcoming';
    return 'upcoming';
  };

  // Customer can cancel ONLY while order is pending shop acceptance
  const isCancelable = order?.status === 'pending';
  const isAcceptedOrBeyond = ['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order?.status);

  return (
    <div className="min-h-screen bg-stone-50 py-10 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navigation & Refresh */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/my-orders"
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-brand-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Orders
          </Link>

          <button
            onClick={() => fetchOrder(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-50 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-500' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Order Tracking
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">#{order.orderNumber}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Current Status Badge & Action */}
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'cancelled' || order.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-brand-100 text-brand-800 animate-pulse'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>

              {isCancelable && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}

              {isAcceptedOrBeyond && (
                <span
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-slate-600 text-xs font-semibold"
                  title="Once accepted by the shop, customer cancellation is not permitted."
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Non-Cancellable (Accepted)</span>
                </span>
              )}

              {order.status === 'delivered' && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition flex items-center space-x-1"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.status === 'cancelled' || order.status === 'rejected' ? (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-red-800">Order {order.status}</h4>
                <p className="text-xs text-red-600 mt-0.5">
                  {order.cancellationReason || order.rejectionReason || 'This order was stopped.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((st, idx) => {
                  const state = getStepStatus(st.key);
                  const isDone = state === 'completed';
                  const isActive = state === 'active';
                  return (
                    <div key={st.key} className="flex flex-col items-start space-y-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isActive
                            ? 'bg-brand-500 text-white ring-4 ring-brand-100 animate-pulse'
                            : 'bg-stone-100 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isActive ? 'text-brand-600' : 'text-slate-900'}`}>
                          {st.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Info: Delivery Fleet & Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Shop & Rider Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Partner Card */}
            {order.deliveryPartner ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <Bike className="w-4 h-4 text-brand-500" />
                  <span>Assigned Fleet Partner</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-black text-sm flex items-center justify-center">
                      {order.deliveryPartner.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{order.deliveryPartner.name}</h4>
                      <p className="text-xs text-slate-500">Official Store Delivery Rider</p>
                    </div>
                  </div>
                  {order.deliveryPartner.phone && (
                    <a
                      href={`tel:${order.deliveryPartner.phone}`}
                      className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-slate-700 transition"
                      aria-label="Call Rider"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center space-x-3 text-xs text-slate-500">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>Delivery rider will be assigned once kitchen begins preparation.</span>
              </div>
            )}

            {/* Shop Details Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Shop Information
              </span>
              <div className="mt-2 flex items-start space-x-3">
                <img
                  src={order.shop?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
                  alt={order.shop?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{order.shop?.name}</h4>
                  <p className="text-xs text-slate-500">{order.shop?.address?.street}, {order.shop?.address?.city}</p>
                  {order.shop?.phone && (
                    <p className="text-xs text-brand-600 font-semibold mt-1">Phone: {order.shop.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address Snapshot */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Delivering To
              </span>
              <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                <p className="font-bold">{order.deliveryAddress?.label || 'Address'}</p>
                <p>{order.deliveryAddress?.street} {order.deliveryAddress?.apartment}</p>
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.postalCode}</p>
                <p className="text-slate-500 pt-1">Phone: <span className="font-semibold text-slate-800">{order.deliveryAddress?.contactPhone}</span></p>
              </div>
            </div>

          </div>

          {/* Right Column: Immutable Item Snapshot & Total */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-stone-100 pb-3">
              Order Receipt ({order.items.length} items)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-stone-100 pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="pt-2 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500 w-5">{it.quantity}x</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{it.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatINR(it.totalPricePaise)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {order.deliveryChargePaise === 0 ? (
                    <span className="text-fresh-600 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="font-semibold text-slate-800">{formatINR(order.deliveryChargePaise)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-black text-slate-900">
                <span>Total Paid / COD Due</span>
                <span className="text-brand-600">{formatINR(order.totalPaise)}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-[11px] text-slate-500">
              Payment Method: <span className="font-bold text-slate-800 uppercase">{order.paymentMethod.replace(/_/g, ' ')}</span>
              <br />
              Payment Status: <span className="font-bold text-slate-800 uppercase">{order.paymentStatus}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Cancel Order Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel This Pending Order?"
        message="Are you sure you want to cancel this order? Once the shop accepts your order, cancellation will be strictly disabled as food preparation begins."
        confirmText="Confirm Cancellation"
        isDestructive={true}
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
      />

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Rate your experience with {order.shop?.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback helps local shop owners and fellow customers.
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-500' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Comments</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How was the food quality, packaging, and delivery speed?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderTrackingPage;
