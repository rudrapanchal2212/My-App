import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import {
  ShoppingBag,
  User,
  LogOut,
  MapPin,
  Search,
  Store,
  ShieldAlert,
  Bike,
  Menu,
  X,
  ChevronDown,
  Clock,
  HelpCircle,
  Bell,
  Smartphone
} from 'lucide-react';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { notifications, unreadCount, markAllAsRead, sendTestNotification } = useNotifications();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Brand Logo & Location */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Quick<span className="text-brand-500">Bite</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                  Food & Grocery
                </span>
              </div>
            </Link>

            {/* Exclusive Location indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-700 bg-brand-50 border border-brand-200/80 px-3 py-1.5 rounded-full shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span className="font-bold text-slate-800">Fatepura, Gujarat</span>
              <span className="text-[10px] font-extrabold bg-brand-500 text-white px-1.5 py-0.5 rounded-md">389172</span>
            </div>
          </div>

          {/* Center: Search trigger & Browse Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/shops"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Explore Shops
            </Link>
            <Link
              to="/shops?category=Restaurant"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              Restaurants
            </Link>
            <Link
              to="/shops?category=Grocery"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              Grocery & Fruits
            </Link>
            <Link
              to="/shops?category=Bakery"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              Bakeries
            </Link>
          </div>

          {/* Right: Role Badges, Cart & User Menu */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Quick role dashboard link badge if logged in with special role */}
            {isAuthenticated && role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Admin Panel
              </Link>
            )}

            {isAuthenticated && role === 'shop_owner' && (
              <Link
                to="/owner"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-sm"
              >
                <Store className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Shop Dashboard
              </Link>
            )}

            {isAuthenticated && role === 'delivery_partner' && (
              <Link
                to="/delivery"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
              >
                <Bike className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                My Deliveries
              </Link>
            )}

            {/* Notification Bell Button */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition flex items-center justify-center shadow-sm"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setNotifOpen(false)}
                  >
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-stone-100">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-brand-500" />
                        <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification items */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 text-xs hover:bg-stone-50 transition ${
                              !n.isRead ? 'bg-brand-50/40 font-medium' : ''
                            }`}
                          >
                            <p className="font-bold text-slate-900">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Test notification button */}
                    <div className="px-3 pt-2 border-t border-stone-100">
                      <button
                        onClick={sendTestNotification}
                        className="w-full py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Send Test Alert to Phone</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-stone-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition flex items-center justify-center shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Sign in buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="hidden md:inline-block font-semibold text-xs text-slate-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-slate-600">
                        {role?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Role Specific Shortcuts */}
                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition"
                      >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    {role === 'shop_owner' && (
                      <Link
                        to="/owner"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Shop Dashboard
                      </Link>
                    )}
                    {role === 'delivery_partner' && (
                      <Link
                        to="/delivery"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <Bike className="w-4 h-4 mr-2" />
                        Delivery Panel
                      </Link>
                    )}

                    <Link
                      to="/my-orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition"
                    >
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition"
                    >
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      Saved Addresses & Profile
                    </Link>

                    <Link
                      to="/help"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50 transition"
                    >
                      <HelpCircle className="w-4 h-4 mr-2 text-slate-400" />
                      Help & Support
                    </Link>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm shadow-brand-500/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-stone-100"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav dropdown */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-800 font-semibold mb-2">
            <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>Exclusively Delivering in Fatepura (389172)</span>
          </div>
          <Link
            to="/shops"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800"
          >
            Explore All Shops
          </Link>
          <Link
            to="/shops?category=Restaurant"
            onClick={() => setMobileNavOpen(false)}
            className="block py-1 text-sm text-slate-600"
          >
            Restaurants & Food
          </Link>
          <Link
            to="/shops?category=Grocery"
            onClick={() => setMobileNavOpen(false)}
            className="block py-1 text-sm text-slate-600"
          >
            Grocery & Fresh Fruits
          </Link>
          <Link
            to="/shops?category=Bakery"
            onClick={() => setMobileNavOpen(false)}
            className="block py-1 text-sm text-slate-600"
          >
            Bakery & Confectionery
          </Link>
          <Link
            to="/partner-with-us"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 text-sm font-semibold text-brand-600"
          >
            Register Your Shop (Vendor)
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
