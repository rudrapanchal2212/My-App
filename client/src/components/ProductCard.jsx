import React from 'react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, shop }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.product._id === product._id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-white rounded-3xl p-4 border border-stone-200/80 hover:border-brand-200 hover:shadow-lg transition flex flex-col justify-between group">
      <div className="relative mb-3">
        {/* Product image */}
        <div className="h-40 w-full rounded-2xl overflow-hidden bg-stone-100">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg shadow-sm">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Stock status indicator */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {product.category}
          </span>
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h4>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'Prepared fresh with quality ingredients.'}
          </p>
        </div>

        {/* Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900">
              {formatINR(product.pricePaise)}
            </span>
            {product.originalPricePaise > product.pricePaise && (
              <span className="text-xs text-slate-400 line-through -mt-0.5">
                {formatINR(product.originalPricePaise)}
              </span>
            )}
          </div>

          <div>
            {!product.isAvailable || product.stockQuantity === 0 ? (
              <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl">
                Sold Out
              </span>
            ) : quantity > 0 ? (
              <div className="flex items-center space-x-1.5 bg-brand-50 border border-brand-200 px-2 py-1 rounded-xl">
                <button
                  onClick={() => updateQuantity(product._id, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-red-600 shadow-2xs font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-extrabold text-brand-700 w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product._id, 1)}
                  disabled={quantity >= product.stockQuantity}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-brand-600 disabled:opacity-40 shadow-2xs font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, shop)}
                className="px-4 py-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-500 font-extrabold text-xs rounded-xl transition shadow-2xs flex items-center space-x-1"
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
