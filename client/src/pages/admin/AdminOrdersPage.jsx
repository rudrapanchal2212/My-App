import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';
import { ShoppingBag, Search, Eye, Filter } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/admin/orders', { params });
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching admin platform orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Orders</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time visibility into all customer orders, shop dispatches, and rider fulfillment.
        </p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number (e.g. ORD-261016)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Shop</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rider</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      #{ord.orderNumber}
                      <p className="text-[10px] text-slate-400 font-normal">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ord.shop?.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{ord.customer?.name}</p>
                      <p className="text-[10px] text-slate-400">{ord.customer?.phone}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {ord.deliveryPartner ? ord.deliveryPartner.name : 'Unassigned'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'cancelled' || ord.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-brand-100 text-brand-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(ord.totalPaise)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500">
                  {selectedOrder.shop?.name} • {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100 text-xs">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="pt-2 flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-bold">{formatINR(it.totalPricePaise)}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatINR(selectedOrder.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold">{formatINR(selectedOrder.deliveryChargePaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-200">
                <span>Total:</span>
                <span className="text-purple-600">{formatINR(selectedOrder.totalPaise)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Delivery To: <span className="font-semibold text-slate-800">{selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}</span></p>
              <p>Phone: <span className="font-semibold text-slate-800">{selectedOrder.deliveryAddress?.contactPhone}</span></p>
              <p>Status: <span className="font-bold uppercase text-slate-800">{selectedOrder.status}</span></p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrdersPage;
