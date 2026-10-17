import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  Bike,
  CheckCircle2,
  MapPin,
  Phone,
  Store,
  User,
  ShoppingBag,
  RefreshCw,
  Coins,
  ArrowRight
} from 'lucide-react';

const DeliveryDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const { data } = await api.get('/delivery-partners/my-deliveries');
      if (data.success) {
        setProfile(data.profile);
        setStats(data.stats);
        setActiveOrders(data.activeOrders || []);
        setCompletedOrders(data.completedOrders || []);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkPickedUp = async (orderId) => {
    setActionId(orderId);
    try {
      const { data } = await api.put(`/delivery-partners/orders/${orderId}/pickup`);
      if (data.success) {
        toast.success('Order marked as Picked Up! Head to customer.');
        fetchDeliveries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status.');
    } finally {
      setActionId(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setActionId(orderId);
    try {
      const { data } = await api.put(`/delivery-partners/orders/${orderId}/deliver`);
      if (data.success) {
        toast.success('Order marked as Delivered & Cash collected! Great job! 🎉');
        fetchDeliveries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark delivered.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-xs text-slate-400">Loading delivery run...</p>;
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Active Delivery Runs</h1>
          <p className="text-xs text-slate-500">Pick up from store and deliver hot & fresh to customers.</p>
        </div>

        <button
          onClick={fetchDeliveries}
          className="p-2 rounded-xl bg-white border border-stone-200 text-slate-700 hover:bg-stone-50 transition shadow-2xs"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Run</span>
          <p className="text-xl font-black text-brand-600 mt-1">{stats?.activeCount || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Today's Drops</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{stats?.todayDeliveries || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Cash Collected</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats?.formattedCashToday || '₹0'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Completed</span>
          <p className="text-xl font-black text-purple-600 mt-1">{stats?.totalCompleted || 0}</p>
        </div>
      </div>

      {/* Active Run Card */}
      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No active deliveries assigned</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You are active and ready. Orders assigned to you by {profile?.shop?.name || 'your store'} will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((ord) => {
            const isPickedUp = ord.status === 'out_for_delivery';
            return (
              <div
                key={ord._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500 shadow-xl space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      Current Task
                    </span>
                    <h2 className="text-xl font-black text-slate-900">Order #{ord.orderNumber}</h2>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Cash to Collect (COD)</span>
                    <p className="text-2xl font-black text-slate-900">{formatINR(ord.totalPaise)}</p>
                  </div>
                </div>

                {/* 2-Stop Waypoints */}
                <div className="space-y-4 relative">
                  
                  {/* STOP 1: Store Pickup */}
                  <div className={`p-4 rounded-2xl border ${!isPickedUp ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1">
                      <Store className="w-4 h-4 text-brand-500" />
                      <span className="uppercase tracking-wider">STOP 1: Pickup from Store</span>
                      {isPickedUp && <span className="text-emerald-600 font-bold ml-2">✓ Picked Up</span>}
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-1">{ord.shop?.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{ord.shop?.address?.street}, {ord.shop?.address?.city}</p>
                    {ord.shop?.phone && (
                      <p className="text-xs text-slate-500 mt-1">Store Phone: <span className="font-semibold text-slate-800">{ord.shop?.phone}</span></p>
                    )}
                  </div>

                  {/* STOP 2: Customer Dropoff */}
                  <div className={`p-4 rounded-2xl border ${isPickedUp ? 'border-brand-500 bg-brand-50/40' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="uppercase tracking-wider">STOP 2: Customer Delivery</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-1">{ord.customer?.name}</p>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">{ord.deliveryAddress?.street} {ord.deliveryAddress?.apartment}</p>
                    <p className="text-xs text-slate-500">{ord.deliveryAddress?.city} - {ord.deliveryAddress?.postalCode}</p>
                    
                    <div className="mt-3 flex items-center space-x-3">
                      <a
                        href={`tel:${ord.deliveryAddress?.contactPhone || ord.customer?.phone}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl border border-brand-200"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer ({ord.deliveryAddress?.contactPhone || ord.customer?.phone})</span>
                      </a>
                    </div>
                  </div>

                </div>

                {/* Items Summary */}
                <div className="bg-stone-50 p-4 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-slate-700 block mb-1">Package Contents:</span>
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>{it.quantity}x {it.name}</span>
                      <span>{formatINR(it.totalPricePaise)}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div>
                  {!isPickedUp ? (
                    <button
                      onClick={() => handleMarkPickedUp(ord._id)}
                      disabled={actionId === ord._id}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 transition cursor-pointer"
                    >
                      {actionId === ord._id ? 'Updating...' : 'Step 1: Confirm Food Picked Up from Store'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkDelivered(ord._id)}
                      disabled={actionId === ord._id}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                    >
                      {actionId === ord._id ? 'Completing...' : `Step 2: Collect ${formatINR(ord.totalPaise)} & Mark Delivered`}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Completed Deliveries History */}
      {completedOrders.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-stone-100 pb-3">
            Completed Deliveries History ({completedOrders.length})
          </h3>

          <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
            {completedOrders.map((co) => (
              <div key={co._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">#{co.orderNumber}</span>
                  <p className="text-[11px] text-slate-400">{co.customer?.name} • {co.shop?.name}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatINR(co.totalPaise)}</span>
                  <span className="block text-[10px] text-emerald-600 font-bold uppercase">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryDashboard;
