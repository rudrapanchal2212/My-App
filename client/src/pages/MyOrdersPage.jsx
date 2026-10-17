import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';
import { Clock, ShoppingBag, ArrowRight, Store, AlertCircle } from 'lucide-react';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 max-w-4xl mx-auto px-4">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/4" />
          <div className="h-32 bg-stone-200 rounded-2xl" />
          <div className="h-32 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active deliveries and review your past order receipts.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">You haven't placed any orders yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
              Craving something delicious or need fresh groceries? Start exploring top local shops now!
            </p>
            <Link
              to="/shops"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Browse Shops
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-brand-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={order.shop?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
                    alt={order.shop?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-100 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-base text-slate-900">{order.shop?.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'cancelled' || order.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-brand-100 text-brand-800'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">
                      {formatINR(order.totalPaise)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                  </div>

                  <Link
                    to={`/order-tracking/${order._id}`}
                    className="mt-2 inline-flex items-center space-x-1 px-4 py-2 bg-stone-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrdersPage;
