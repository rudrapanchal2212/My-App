import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike, MapPin } from 'lucide-react';
import { formatINR } from '../utils/currency';

const ShopCard = ({ shop }) => {
  return (
    <Link
      to={`/shops/${shop._id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-brand-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100">
        <img
          src={shop.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Operating status badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md ${
              shop.isOperating
                ? 'bg-emerald-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {shop.isOperating ? 'Open Now' : 'Closed'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 shadow-md backdrop-blur-md">
            {shop.category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-slate-900 font-extrabold text-xs shadow-md">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{shop.rating?.toFixed(1) || '4.5'}</span>
          {shop.ratingCount > 0 && (
            <span className="text-slate-400 font-normal text-[10px]">({shop.ratingCount})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {shop.name}
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {shop.description || 'Quality food and grocery products delivered fresh.'}
          </p>

          <div className="mt-2 flex items-center text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
            <span className="truncate">{shop.address?.city || 'Local Delivery'}</span>
          </div>
        </div>

        {/* Bottom details */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{shop.estimatedDeliveryTime || '25-35 mins'}</span>
          </div>

          <div className="flex items-center space-x-1 font-bold text-slate-800">
            <Bike className="w-3.5 h-3.5 text-brand-500" />
            <span>
              {shop.deliveryChargePaise === 0
                ? 'Free Delivery'
                : `${formatINR(shop.deliveryChargePaise)} Delivery`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
