import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Search,
  CheckCircle,
  XCircle,
  Tag,
  Boxes
} from 'lucide-react';

const OwnerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    image: '',
    priceRupees: '',
    originalPriceRupees: '',
    stockQuantity: '50',
    isAvailable: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shops/my-shop/products');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching owner products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Main Course',
      image: '',
      priceRupees: '',
      originalPriceRupees: '',
      stockQuantity: '50',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      image: product.image || '',
      priceRupees: paiseToRupees(product.pricePaise).toString(),
      originalPriceRupees: product.originalPricePaise
        ? paiseToRupees(product.originalPricePaise).toString()
        : '',
      stockQuantity: product.stockQuantity.toString(),
      isAvailable: product.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.priceRupees) {
      toast.error('Please specify product name and price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: formData.image || undefined,
        // Convert rupees input to integer paise for backend
        pricePaise: rupeesToPaise(Number(formData.priceRupees)),
        originalPricePaise: formData.originalPriceRupees
          ? rupeesToPaise(Number(formData.originalPriceRupees))
          : rupeesToPaise(Number(formData.priceRupees)),
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        isAvailable: formData.isAvailable,
      };

      if (editingProduct) {
        const { data } = await api.put(`/shops/my-shop/products/${editingProduct._id}`, payload);
        if (data.success) {
          toast.success('Product updated successfully!');
          setShowModal(false);
          fetchProducts();
        }
      } else {
        const { data } = await api.post('/shops/my-shop/products', payload);
        if (data.success) {
          toast.success('Product added to catalog!');
          setShowModal(false);
          fetchProducts();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { data } = await api.delete(`/shops/my-shop/products/${productId}`);
      if (data.success) {
        toast.success('Product removed.');
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Catalog & Menu</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Independently manage menu items, prices in ₹, stock counts, and availability.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {filteredProducts.length} items listed
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading catalog...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold">No products in your catalog yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 text-xs font-bold text-brand-600 hover:underline"
            >
              Add your first product now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Selling Price (₹)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {p.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900">{formatINR(p.pricePaise)}</span>
                      {p.originalPricePaise > p.pricePaise && (
                        <span className="text-[10px] text-slate-400 line-through block">
                          {formatINR(p.originalPricePaise)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          p.stockQuantity <= 5 ? 'text-red-500' : 'text-slate-800'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.isAvailable ? 'In Stock' : 'Unavailable'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set product price in ₹ (stored internally as integer paise).
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  placeholder="e.g. Royal Butter Chicken / Farm Fresh Milk 1L"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                    placeholder="e.g. Main Course / Dairy / Breads"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                    placeholder="e.g. 250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹ - Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPriceRupees}
                    onChange={(e) => setFormData({ ...formData, originalPriceRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                    placeholder="e.g. 300 (for discount display)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-stone-200"
                  placeholder="Ingredients, portion size, flavor profile..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isAvailable" className="text-xs font-bold text-slate-700">
                  Product is currently available for purchase (In Stock)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerProductsPage;
