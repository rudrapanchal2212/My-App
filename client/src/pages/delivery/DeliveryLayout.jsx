import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bike, LogOut, ShieldCheck, Home } from 'lucide-react';

const DeliveryLayout = () => {
  const { user, deliveryProfile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      
      {/* Top Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm block">Rider Dispatch Console</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {deliveryProfile?.vehicleType || 'Bike'} Fleet • {deliveryProfile?.shop?.name || 'Local Store'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        <Outlet />
      </main>

    </div>
  );
};

export default DeliveryLayout;
