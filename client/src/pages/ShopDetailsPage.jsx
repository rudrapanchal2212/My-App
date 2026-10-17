import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import { formatINR } from '../utils/currency';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

const ShopDetailsPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/shops/public/${id}`);
        if (data.success) {
          setShop(data.shop);
          setProducts(data.products || []);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching shop details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-64 bg-stone-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Shop Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            This shop may be pending approval or no longer active on the platform.
          </p>
          <Link
            to="/shops"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Browse Other Shops
          </Link>
        </div>
      </div>
    );
  }

  // Extract unique product categories for this shop
  const productCategories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Top Banner & Header */}
      <div className="relative bg-slate-900 text-white">
        <div className="h-56 sm:h-72 w-full overflow-hidden relative">
          <img
            src={shop.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'}
            alt={shop.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Back Link */}
        <Link
          to="/shops"
          className="absolute top-6 left-6 z-10 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition flex items-center text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Shops
        </Link>

        {/* Floating Info Box */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-8">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex items-start space-x-4">
                <img
                  src={shop.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120'}
                  alt={shop.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-100 shadow-md flex-shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
                      {shop.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        shop.isOperating
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {shop.isOperating ? 'Open' : 'Currently Closed'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {shop.name}
                  </h1>

                  <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">
                    {shop.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{shop.address?.street}, {shop.address?.city}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery & Rating Snapshot */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-8 gap-3">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 rounded-xl text-amber-700 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{shop.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-xs font-normal text-slate-400">({shop.ratingCount || 0} reviews)</span>
                </div>

                <div className="text-right text-xs">
                  <div className="flex items-center space-x-1 font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.estimatedDeliveryTime || '25-35 mins'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600 mt-1">
                    <Bike className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-semibold">{formatINR(shop.deliveryChargePaise)} Delivery</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Threshold alerts banner */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              {shop.freeDeliveryThresholdPaise > 0 && (
                <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free delivery on orders above {formatINR(shop.freeDeliveryThresholdPaise)}!</span>
                </div>
              )}
              {shop.minOrderAmountPaise > 0 && (
                <div className="text-slate-500 font-medium">
                  Min. order required: <span className="font-bold text-slate-700">{formatINR(shop.minOrderAmountPaise)}</span>
                </div>
              )}
              <div className="text-slate-500 font-medium">
                Operating Hours: <span className="font-bold text-slate-700">{shop.operatingHours?.open || '08:00'} - {shop.operatingHours?.close || '22:00'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Catalog & Menu Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <p className="text-sm font-bold text-slate-800">No items available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} shop={shop} />
            ))}
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mt-16 pt-10 border-t border-stone-200">
            <div className="flex items-center space-x-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
              <span className="text-xs bg-stone-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                        {rev.customer?.name?.charAt(0) || 'C'}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{rev.customer?.name}</span>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      <span>{rev.rating}/5</span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  );
};

export default ShopDetailsPage;
