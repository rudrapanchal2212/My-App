import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, Store } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 3 Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Independent Local Shops</h4>
              <p className="text-xs text-slate-400">Discover trusted neighborhood food & grocery merchants.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-fresh-500/10 text-fresh-500 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Dedicated Fleet Delivery</h4>
              <p className="text-xs text-slate-400">Store-managed delivery partners ensuring hot & fresh orders.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Super Admin Verified</h4>
              <p className="text-xs text-slate-400">Every shop is vetted and approved for quality & hygiene.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center space-x-2 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Quick<span className="text-brand-500">Bite</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The next-generation multi-vendor marketplace connecting customers to local kitchens, bakeries, and fresh grocery stores.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Categories</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/shops?category=Restaurant" className="hover:text-white transition">Restaurants</Link></li>
              <li><Link to="/shops?category=Grocery" className="hover:text-white transition">Groceries & Organics</Link></li>
              <li><Link to="/shops?category=Bakery" className="hover:text-white transition">Artisan Bakeries</Link></li>
              <li><Link to="/shops?category=Fruits and Vegetables" className="hover:text-white transition">Fresh Fruits & Greens</Link></li>
              <li><Link to="/shops?category=Fast Food" className="hover:text-white transition">Fast Food & Snacks</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Shop Owners & Fleet</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/partner-with-us" className="text-brand-400 hover:text-brand-300 font-semibold transition">Register Your Shop</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Shop Owner Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Delivery Partner Login</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Super Admin Console</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/help" className="hover:text-white transition">Help Center & FAQs</Link></li>
              <li><Link to="/my-orders" className="hover:text-white transition">Order Tracking</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Submit a Complaint</Link></li>
              <li><span className="text-slate-500">Delivery Hotline: 1800-QUICK-BITE</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QuickBite Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Built with modern full-stack MERN & secure integer paise currency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
