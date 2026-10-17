import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('quickbite_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quickbite_token') || null);
  const [shop, setShop] = useState(null);
  const [deliveryProfile, setDeliveryProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token in localStorage & fetch fresh profile
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!token) {
        setUser(null);
        setShop(null);
        setDeliveryProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('quickbite_user', JSON.stringify(data.user));
          if (data.shop) setShop(data.shop);
          if (data.deliveryProfile) setDeliveryProfile(data.deliveryProfile);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('quickbite_token', data.token);
        localStorage.setItem('quickbite_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        if (data.shop) setShop(data.shop);
        if (data.deliveryProfile) setDeliveryProfile(data.deliveryProfile);
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, role: data.user.role };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const registerCustomer = async (formData) => {
    try {
      const { data } = await api.post('/auth/register-customer', formData);
      if (data.success) {
        localStorage.setItem('quickbite_token', data.token);
        localStorage.setItem('quickbite_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success('Registration successful! Welcome to QuickBite.');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const registerShopOwner = async (formData) => {
    try {
      const { data } = await api.post('/auth/register-shop-owner', formData);
      if (data.success) {
        localStorage.setItem('quickbite_token', data.token);
        localStorage.setItem('quickbite_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        if (data.shop) setShop(data.shop);
        toast.success('Shop registration submitted for Super Admin review!');
        return { success: true, shop: data.shop };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Shop registration failed.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('quickbite_token');
    localStorage.removeItem('quickbite_user');
    setToken(null);
    setUser(null);
    setShop(null);
    setDeliveryProfile(null);
    toast.success('Logged out successfully.');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        if (data.shop) setShop(data.shop);
        if (data.deliveryProfile) setDeliveryProfile(data.deliveryProfile);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        token,
        isAuthenticated: !!user,
        shop,
        deliveryProfile,
        loading,
        login,
        registerCustomer,
        registerShopOwner,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
