// src/pages/CartPage.tsx
import React from 'react';
import { CartItem, PageKey, MessageState } from '../types';
import { formatPrice } from '../utils/formatters';
import { ShoppingCart, Trash2, PlusCircle, MinusCircle, ShieldCheck } from 'lucide-react';

interface CartPageProps {
  cartItems: CartItem[];
  removeFromCart: (adventureId: string) => void;
  updateQuantityInCart: (adventureId: string, newQuantity: number) => void;
  navigateTo: (page: PageKey) => void;
  showMessage: (text: string, type?: MessageState['type'], duration?: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, removeFromCart, updateQuantityInCart, navigateTo, showMessage }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart size={64} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-3xl font-semibold text-slate-700 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-6">Looks like you haven't added any adventures yet. Explore our collection!</p>
        <button
          onClick={() => navigateTo('adventures')}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Browse Adventures
        </button>
      </div>
    );
  }

  const handleRemove = (adventureId: string) => {
    removeFromCart(adventureId);
    showMessage("Item removed from cart.", "info");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">Your Shopping Cart</h2>
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 py-4 last:border-b-0">
            <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-2/5">
              <img
                src={item.coverImageUrl || `https://placehold.co/100x80/333/ccc?text=${encodeURIComponent(item.title.substring(0, 10))}`}
                alt={item.title}
                className="w-20 h-16 object-cover rounded-md mr-4 shadow"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://placehold.co/100x80/333/ccc?text=Error`;
                }}
              />
              <div>
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm">{formatPrice(item.price)} each</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-0">
              <button onClick={() => updateQuantityInCart(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-slate-600 hover:bg-slate-100 rounded-full disabled:opacity-50" disabled={item.quantity <= 1}><MinusCircle size={20} /></button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantityInCart(item.id, item.quantity + 1)} className="p-1 text-slate-600 hover:bg-slate-100 rounded-full"><PlusCircle size={20} /></button>
            </div>
            <p className="font-semibold text-slate-700 w-20 text-center mb-2 sm:mb-0">{formatPrice(item.price * item.quantity)}</p>
            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><Trash2 size={20} /></button>
          </div>
        ))}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-600 text-lg">Subtotal:</p>
            <p className="text-slate-800 font-bold text-2xl">{formatPrice(subtotal)}</p>
          </div>
          <p className="text-sm text-slate-500 mb-6 text-right">Taxes and shipping calculated at checkout (mock).</p>
          <button
            onClick={() => navigateTo('checkout')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center"
          >
            <ShieldCheck size={20} className="mr-2" /> Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
