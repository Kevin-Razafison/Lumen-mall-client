import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('lumenCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('lumenCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, amount = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const newTotalQty = currentQty + amount;

      // Check if the total requested exceeds available stock
      if (product.stock !== undefined && newTotalQty > product.stock) {
        alert(`Sorry, only ${product.stock} items available in total.`);
        // If they already have the max stock in cart, do nothing
        if (currentQty >= product.stock) return prevItems;
        // Otherwise, just fill the cart to the max available stock
        amount = product.stock - currentQty;
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + amount } 
            : item
        );
      }
      return [...prevItems, { ...product, quantity: amount }];
    });
  };

  const updateQuantity = (productId, newQuantity, stock) => {
    if (newQuantity < 1) return;
    
    // Check stock limit specifically for quantity updates (e.g., in Cart page)
    if (stock !== undefined && newQuantity > stock) {
      alert(`Cannot exceed available stock of ${stock}`);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('lumenCart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);