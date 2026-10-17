import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', path: '/owner', icon: LayoutDashboard, exact: true },
  { name: 'Product Catalog', path: '/owner/products', icon: UtensilsCrossed },
  { name: 'Orders Management', path: '/owner/orders', icon: ShoppingBag },
  { name: 'Delivery Partners', path: '/owner/delivery-partners', icon: Bike },
  { name: 'Shop & Delivery Settings', path: '/owner/settings', icon: Settings },
];

const OwnerLayout = () => {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isApproved = shop?.approvalStatus === 'approved';
  const isPending = shop?.approvalStatus === 'pending';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-amber-500" />
          <span className="font-extrabold text-sm tracking-wide truncate max-w-[200px]">
            {shop?.name || 'Shop Dashboard'}
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 md:min-h-screen p-5 flex flex-col justify-between z-30`}
      >
        <div className="space-y-6">
          {/* Header & Status Indicator */}
          <div className="hidden md:flex flex-col px-2 py-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h2 className="font-black text-sm text-white truncate">{shop?.name || 'My Shop'}</h2>
                <span className="text-[10px] text-amber-400 font-bold uppercase">{shop?.category}</span>
              </div>
            </div>

            {/* Shop Approval Status Pill */}
            <div className="mt-3">
              {isApproved ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved & Live</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Pending Admin Review</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                  <span>{shop?.approvalStatus}</span>
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Sign out */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Link
              to="/"
              className="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl transition"
            >
              Public Site
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default OwnerLayout;
