import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentShop, setCurrentShop] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_cart_shop');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingProduct: null,
    pendingShop: null,
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('quickbite_cart_items', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setCurrentShop(null);
      localStorage.removeItem('quickbite_cart_shop');
    } else if (currentShop) {
      localStorage.setItem('quickbite_cart_shop', JSON.stringify(currentShop));
    }
  }, [cartItems, currentShop]);

  // Add product to cart with Single Shop restriction
  const addToCart = (product, shop, quantity = 1) => {
    // Check if cart has items from another shop
    if (currentShop && currentShop._id !== shop._id && cartItems.length > 0) {
      setConflictModal({
        isOpen: true,
        pendingProduct: product,
        pendingShop: shop,
      });
      return false;
    }

    // Set current shop if first item
    if (!currentShop) {
      setCurrentShop(shop);
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product,
            quantity,
            pricePaise: product.pricePaise,
          },
        ];
      }
    });

    toast.success(`Added "${product.name}" to cart`);
    return true;
  };

  // Resolve conflict: Replace cart items with new shop
  const confirmReplaceCart = () => {
    if (conflictModal.pendingProduct && conflictModal.pendingShop) {
      setCurrentShop(conflictModal.pendingShop);
      setCartItems([
        {
          product: conflictModal.pendingProduct,
          quantity: 1,
          pricePaise: conflictModal.pendingProduct.pricePaise,
        },
      ]);
      toast.success(`Cart updated with items from ${conflictModal.pendingShop.name}`);
    }
    setConflictModal({ isOpen: false, pendingProduct: null, pendingShop: null });
  };

  const cancelReplaceCart = () => {
    setConflictModal({ isOpen: false, pendingProduct: null, pendingShop: null });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    toast.success('Item removed from cart.');
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentShop(null);
    localStorage.removeItem('quickbite_cart_items');
    localStorage.removeItem('quickbite_cart_shop');
  };

  // Computations in integer paise
  const subtotalPaise = cartItems.reduce(
    (acc, item) => acc + item.product.pricePaise * item.quantity,
    0
  );

  let deliveryChargePaise = currentShop?.deliveryChargePaise || 0;
  if (
    currentShop?.freeDeliveryThresholdPaise > 0 &&
    subtotalPaise >= currentShop.freeDeliveryThresholdPaise
  ) {
    deliveryChargePaise = 0; // Free delivery threshold met!
  }

  const totalPaise = subtotalPaise + deliveryChargePaise;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        currentShop,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotalPaise,
        deliveryChargePaise,
        totalPaise,
        totalItemCount,
        conflictModal,
        confirmReplaceCart,
        cancelReplaceCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
