// src/pages/CheckoutPage.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { CartItem, CheckoutFormData, PageKey, MessageState } from '../types';
import { formatPrice } from '../utils/formatters';
import { ShieldCheck } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  handleCheckout: (formData: CheckoutFormData) => void;
  navigateTo: (page: PageKey) => void;
  showMessage: (text: string, type?: MessageState['type'], duration?: number) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, handleCheckout, navigateTo, showMessage }) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '', email: '', address: '', city: '', zip: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zip) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }
    handleCheckout(formData);
  };

  if (cartItems.length === 0 && subtotal === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Nothing to checkout!</h2>
        <p className="text-slate-500 mb-6">Your cart is empty. Please add some adventures before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('adventures')}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Browse Adventures
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">Checkout</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 order-last lg:order-first bg-slate-50 p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm mb-2">
              <span className="text-slate-600">{item.title} (x{item.quantity})</span>
              <span className="text-slate-700 font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="text-slate-700 font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mock Tax (8%):</span>
              <span className="text-slate-700 font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold mt-2">
              <span className="text-slate-800">Total:</span>
              <span className="text-amber-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Street Address</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
                <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-slate-700">ZIP / Postal Code</label>
                <input type="text" name="zip" id="zip" value={formData.zip} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500 mb-4">Payment processing is mocked for this demonstration. No real transaction will occur.</p>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center"
              >
                <ShieldCheck size={20} className="mr-2" /> Place Mock Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
