import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useCart } from './context/CartContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ConfirmationModal from './components/ConfirmationModal';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopListingPage from './pages/ShopListingPage';
import ShopDetailsPage from './pages/ShopDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import HelpContactPage from './pages/HelpContactPage';
import LoginPage from './pages/LoginPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterShopOwnerPage from './pages/RegisterShopOwnerPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShopsPage from './pages/admin/AdminShopsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

// Owner Pages
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProductsPage from './pages/owner/OwnerProductsPage';
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage';
import OwnerDeliveryPartnersPage from './pages/owner/OwnerDeliveryPartnersPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';

// Delivery Pages
import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Customer Layout Wrapper
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  const { conflictModal, confirmReplaceCart, cancelReplaceCart } = useCart();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            padding: '12px 16px',
          },
        }}
      />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Single-Shop Conflict Modal */}
      <ConfirmationModal
        isOpen={conflictModal.isOpen}
        title="Replace items in your basket?"
        message={`Your cart contains items from "${conflictModal.pendingShop ? 'another shop' : ''}". Each order must be from a single shop. Would you like to clear your cart and start adding from "${conflictModal.pendingShop?.name}"?`}
        confirmText="Yes, Start New Order"
        cancelText="Keep Existing Items"
        isDestructive={false}
        onConfirm={confirmReplaceCart}
        onCancel={cancelReplaceCart}
      />

      <Routes>
        {/* Public / Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shops" element={<ShopListingPage />} />
          <Route path="/shops/:id" element={<ShopDetailsPage />} />
          <Route path="/help" element={<HelpContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterCustomerPage />} />
          <Route path="/partner-with-us" element={<RegisterShopOwnerPage />} />

          {/* Authenticated Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'shop_owner']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-tracking/:id"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'shop_owner']}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Super Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Shop Owner Portal Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['shop_owner', 'admin']}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="products" element={<OwnerProductsPage />} />
          <Route path="orders" element={<OwnerOrdersPage />} />
          <Route path="delivery-partners" element={<OwnerDeliveryPartnersPage />} />
          <Route path="settings" element={<OwnerSettingsPage />} />
        </Route>

        {/* Delivery Partner Console Routes */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute allowedRoles={['delivery_partner', 'admin']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DeliveryDashboard />} />
        </Route>

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 text-center">
              <div>
                <h1 className="text-4xl font-black text-slate-900">404</h1>
                <p className="text-xs text-slate-500 mt-1 mb-4">Page not found.</p>
                <a href="/" className="px-5 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold">
                  Go to Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
