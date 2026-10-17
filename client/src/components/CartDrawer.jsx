import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, Sparkles } from 'lucide-react';

const CartDrawer = () => {
  const {
    cartItems,
    currentShop,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotalPaise,
    deliveryChargePaise,
    totalPaise,
    totalItemCount,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = currentShop?.freeDeliveryThresholdPaise || 0;
  const isFreeDeliveryEligible = freeDeliveryThreshold > 0 && subtotalPaise >= freeDeliveryThreshold;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotalPaise);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <h3 className="font-extrabold text-lg text-slate-900">Your Basket</h3>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl hover:bg-stone-200/60 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Explore popular local restaurants and grocery stores to add your favorite products!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shops');
                }}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-md transition"
              >
                Browse Shops
              </button>
            </div>
          ) : (
            <>
              {/* Shop info & Free Delivery Bar */}
              <div className="p-4 bg-brand-50/60 border-b border-brand-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <Store className="w-4 h-4 text-brand-600" />
                    <span className="truncate max-w-[200px]">{currentShop?.name}</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-red-600 hover:underline flex items-center"
                  >
                    Clear All
                  </button>
                </div>

                {/* Free delivery banner */}
                {freeDeliveryThreshold > 0 && (
                  <div className="mt-2 bg-white p-2.5 rounded-xl border border-brand-200 shadow-2xs">
                    {isFreeDeliveryEligible ? (
                      <p className="text-xs font-bold text-fresh-600 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Yay! You unlocked FREE delivery on this order.
                      </p>
                    ) : (
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>Free Delivery Progress</span>
                          <span>Add {formatINR(amountNeededForFreeDelivery)} more</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (subtotalPaise / freeDeliveryThreshold) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="py-3.5 flex items-center justify-between space-x-3">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h4>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">
                        {formatINR(item.product.pricePaise)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1.5 bg-stone-100 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.product._id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-red-600 shadow-2xs"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-brand-600 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details Footer */}
              <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatINR(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee</span>
                    <span>
                      {deliveryChargePaise === 0 ? (
                        <span className="text-fresh-600 font-bold uppercase text-[11px]">Free</span>
                      ) : (
                        <span className="font-semibold text-slate-800">{formatINR(deliveryChargePaise)}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-slate-900">
                    <span>To Pay</span>
                    <span className="text-brand-600">{formatINR(totalPaise)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
