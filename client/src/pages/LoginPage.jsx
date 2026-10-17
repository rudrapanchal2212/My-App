import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, Store, Bike, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (result.role === 'admin') {
        navigate('/admin');
      } else if (result.role === 'shop_owner') {
        navigate('/owner');
      } else if (result.role === 'delivery_partner') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Quick<span className="text-brand-500">Bite</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered credentials or select a demo role below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 space-y-6">
        
        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-1"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Customer Account
            </Link>
            <br />
            <span className="block mt-1">
              Are you a merchant?{' '}
              <Link to="/partner-with-us" className="font-bold text-slate-700 hover:underline">
                Register Your Shop
              </Link>
            </span>
          </div>
        </div>

        {/* Quick Demo Role Switcher Card */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            🚀 1-Click Demo Accounts (Password: Password@123)
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@quickbite.com', 'Password@123')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center space-x-2 transition text-left"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[11px]">Super Admin</span>
                <span className="text-[9px] font-normal text-purple-600">Platform Owner</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('owner1@spicegarden.com', 'Password@123')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center space-x-2 transition text-left"
            >
              <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[11px]">Shop Owner</span>
                <span className="text-[9px] font-normal text-amber-600">Spice Garden</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@delivery.com', 'Password@123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-2 transition text-left"
            >
              <Bike className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[11px]">Delivery Partner</span>
                <span className="text-[9px] font-normal text-emerald-600">Rahul (Rider)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('customer@quickbite.com', 'Password@123')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold flex items-center space-x-2 transition text-left"
            >
              <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[11px]">Customer</span>
                <span className="text-[9px] font-normal text-blue-600">Priya Patel</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
