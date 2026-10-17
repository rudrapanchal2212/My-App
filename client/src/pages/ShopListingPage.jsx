import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ShopCard from '../components/ShopCard';
import { ShopCardSkeleton } from '../components/LoadingSkeleton';
import { Search, Filter, Store } from 'lucide-react';

const categories = [
  'All',
  'Restaurant',
  'Grocery',
  'Bakery',
  'Fruits and Vegetables',
  'Fast Food',
  'Other',
];

const ShopListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category !== 'All') params.category = category;
        if (search.trim()) params.search = search.trim();
        if (city.trim()) params.city = city.trim();

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
  }, [category, search, city]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 mb-2">
            <span>📍 Exclusively in Fatepura, Gujarat (389172)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Local Shops</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all verified restaurants, bakeries, and grocery shops serving Fatepura.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shops by name, category, or specialties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500 text-xs sm:text-sm"
              />
            </div>
            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="Filter by locality / road in Fatepura..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-stone-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  category === cat
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shops Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No shops match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the category filters.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
              <span>Showing {shops.length} verified {shops.length === 1 ? 'shop' : 'shops'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <ShopCard key={shop._id} shop={shop} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopListingPage;
