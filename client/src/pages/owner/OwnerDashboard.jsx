import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import {
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2
} from 'lucide-react';

const OwnerDashboard = () => {
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const { data } = await api.get('/shops/my-shop');
        if (data.success) {
          setShop(data.shop);
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching shop dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-stone-200 rounded-3xl" />
          <div className="h-32 bg-stone-200 rounded-3xl" />
          <div className="h-32 bg-stone-200 rounded-3xl" />
          <div className="h-32 bg-stone-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const isApproved = shop?.approvalStatus === 'approved';
  const isPending = shop?.approvalStatus === 'pending';

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {shop?.name || 'Shop Operations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Independent store management, catalog control, and delivery partner dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/owner/products"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to={`/shops/${shop?._id}`}
            className="px-4 py-2 bg-white border border-stone-200 text-slate-700 hover:bg-stone-50 font-bold text-xs rounded-xl shadow-xs transition"
          >
            View Live Store
          </Link>
        </div>
      </div>

      {/* Approval Status Banner */}
      {isPending ? (
        <div className="p-5 rounded-3xl bg-amber-500 text-white flex items-start space-x-3 shadow-lg shadow-amber-500/20">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Shop Application is Under Super Admin Review</h3>
            <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
              Your registration details are currently pending verification. You can set up your product catalog and delivery partners right now. Once the Super Admin approves your shop, your menu will immediately become available in the public customer marketplace!
            </p>
          </div>
        </div>
      ) : isApproved ? (
        <div className="p-4 rounded-3xl bg-emerald-500 text-white flex items-center justify-between shadow-md shadow-emerald-500/10">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Your shop is officially Approved & Accepting Orders</span>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
            {shop?.isOperating ? 'Open for Orders' : 'Store is Closed'}
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-red-500 text-white flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-sm">Shop Status: {shop?.approvalStatus}</h3>
            <p className="text-xs text-red-100 mt-0.5">
              Reason: {shop?.rejectionReason || 'Please review your store settings.'}
            </p>
          </div>
        </div>
      )}

      {/* Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Shop Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatINR(stats?.totalRevenuePaise || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">From fulfilled orders</p>
        </div>

        {/* Orders Today & Pending */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.todayOrders || 0}</p>
          <div className="flex items-center space-x-2 text-[11px] font-semibold">
            <span className="text-amber-600 font-bold">{stats?.pendingOrders || 0} pending action</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{stats?.totalOrders || 0} lifetime</span>
          </div>
        </div>

        {/* Product Catalog Count */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalProducts || 0}</p>
          <Link to="/owner/products" className="text-[11px] text-brand-600 font-bold hover:underline block">
            Manage catalog →
          </Link>
        </div>

        {/* Fleet Count */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.deliveryPartnersCount || 0}</p>
          <Link to="/owner/delivery-partners" className="text-[11px] text-purple-600 font-bold hover:underline block">
            Manage drivers →
          </Link>
        </div>

      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/owner/orders"
          className="bg-white p-6 rounded-3xl border border-stone-200 hover:border-brand-300 shadow-xs hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Manage Incoming Orders</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Accept or reject new customer orders, update kitchen preparation status, and assign deliveries.
          </p>
        </Link>

        <Link
          to="/owner/products"
          className="bg-white p-6 rounded-3xl border border-stone-200 hover:border-brand-300 shadow-xs hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Product Pricing & Catalog</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Upload food or grocery photos, set your own selling price in ₹, discounts, and inventory stock.
          </p>
        </Link>

        <Link
          to="/owner/settings"
          className="bg-white p-6 rounded-3xl border border-stone-200 hover:border-brand-300 shadow-xs hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Delivery Rules & Fees</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Control your custom delivery fee in ₹, minimum order threshold, and free delivery qualification.
          </p>
        </Link>
      </div>

    </div>
  );
};

export default OwnerDashboard;
