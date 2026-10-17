import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ShopCard from '../components/ShopCard';
import { ShopCardSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Apple,
  Cake,
  Flame,
  ShieldCheck,
  Clock,
  Sparkles,
  Bike
} from 'lucide-react';

const categories = [
  { name: 'All', icon: Sparkles, color: 'bg-brand-500 text-white' },
  { name: 'Restaurant', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { name: 'Grocery', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Bakery', icon: Cake, color: 'bg-pink-100 text-pink-600' },
  { name: 'Fruits and Vegetables', icon: Apple, color: 'bg-green-100 text-green-600' },
  { name: 'Fast Food', icon: Flame, color: 'bg-red-100 text-red-600' },
];

const HomePage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        const { data } = await api.get('/shops/public', { params });
        if (data.success) {
          setShops(data.shops);
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shops?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shops');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-stone-50 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 text-brand-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Exclusively Delivering in Fatepura, Gujarat (389172)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Order from your favorite <br />
                <span className="text-brand-500 underline decoration-amber-300 decoration-wavy decoration-2">
                  local shops
                </span>{' '}
                today.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover independent restaurants, bakeries, and grocery markets delivering exclusively across Fatepura (PIN: 389172). Freshly packed and delivered straight to your exact doorstep.
              </p>

              {/* Search Bar Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl mx-auto lg:mx-0 flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-brand-500/10 border border-stone-200"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5 text-brand-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search restaurants, fresh milk, sweets, grocery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <span>Find Food</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>

              {/* Quick stats pills */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-1.5 text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  <span>📍 Fatepura 389172 Exclusive</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Admin Verified Shops</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>Live Preparation Status</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1.5">
                  <Bike className="w-4 h-4 text-purple-500" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
                    alt="Delicious multi-vendor dishes"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating promo card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center space-x-3 max-w-xs animate-soft-pulse">
                  <div className="w-12 h-12 rounded-xl bg-fresh-500/10 text-fresh-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Zero Commission Bias</p>
                    <p className="text-[11px] text-slate-500">Shop owners set their own prices & delivery rules.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-3 shadow-lg border border-stone-200/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition shadow-2xs ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-brand-500/25'
                    : 'bg-stone-50 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Approved Shops Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {selectedCategory === 'All' ? 'Popular Approved Shops' : `${selectedCategory} Shops`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hand-picked local stores ready to accept and prepare your order
            </p>
          </div>
          <Link
            to="/shops"
            className="mt-3 sm:mt-0 text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View all shops</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No shops found in this category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try selecting another category or check back shortly as new vendors are approved!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* Multi-Vendor Business Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              For Independent Merchants & Kitchens
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Grow your local business with full operational autonomy.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Set your own product prices, configure custom delivery charges, and manage your own trusted delivery riders. Sign up today and get vetted by our Super Admin.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/partner-with-us"
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 transition"
              >
                Register as a Shop Owner
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Existing Vendor Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
