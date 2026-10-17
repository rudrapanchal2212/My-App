import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentShops, setRecentShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard-stats');
        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setRecentShops(data.recentShops || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Command Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          High-level overview of multi-vendor merchants, customer orders, and system health.
        </p>
      </div>

      {/* Pending Approvals Alert Banner */}
      {stats?.shops?.pending > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/20">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">
                {stats.shops.pending} Shop {stats.shops.pending === 1 ? 'Application' : 'Applications'} Awaiting Approval
              </h3>
              <p className="text-xs text-amber-100">
                New merchants have submitted business details and are waiting for your verification.
              </p>
            </div>
          </div>
          <Link
            to="/admin/shops?status=pending"
            className="px-4 py-2 bg-white text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:bg-amber-50 transition"
          >
            Review Requests
          </Link>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Gross Sales */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatINR(stats?.orders?.totalRevenuePaise || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">From completed deliveries</p>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Orders</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.orders?.total || 0}</p>
          <div className="flex items-center space-x-2 text-[11px] font-semibold">
            <span className="text-amber-600">{stats?.orders?.inProgress || 0} active</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600">{stats?.orders?.completed || 0} completed</span>
          </div>
        </div>

        {/* Card 3: Total Shops */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Shops</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.shops?.total || 0}</p>
          <div className="flex items-center space-x-2 text-[11px] font-semibold">
            <span className="text-emerald-600">{stats?.shops?.approved || 0} live</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600">{stats?.shops?.pending || 0} pending</span>
          </div>
        </div>

        {/* Card 4: Customers & Fleet */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers & Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.customers?.total || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium">
            Across {stats?.deliveryPartners?.total || 0} store delivery partners
          </p>
        </div>

      </div>

      {/* 2-Column: Recent Orders & Recent Shops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900">Recent Platform Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-purple-600 hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentOrders.map((ord) => (
                <div key={ord._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">#{ord.orderNumber}</span>
                    <p className="text-[11px] text-slate-500">
                      {ord.customer?.name} • {ord.shop?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{formatINR(ord.totalPaise)}</span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Shop Registrations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900">Recent Shop Applications</h3>
            <Link to="/admin/shops" className="text-xs font-bold text-purple-600 hover:underline">
              Manage
            </Link>
          </div>

          {recentShops.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No shops registered yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentShops.map((shp) => (
                <div key={shp._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{shp.name}</span>
                    <p className="text-[11px] text-slate-500">
                      {shp.category} • {shp.address?.city}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      shp.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : shp.approvalStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shp.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
