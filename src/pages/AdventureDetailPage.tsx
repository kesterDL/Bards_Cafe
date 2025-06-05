// src/pages/AdventureDetailPage.tsx
import React, { useState, ChangeEvent } from 'react';
import { Adventure, PageKey } from '../types';
import { formatPrice } from '../utils/formatters';
import { ShoppingCart, PlusCircle, MinusCircle } from 'lucide-react';

interface AdventureDetailPageProps {
  adventure: Adventure | null;
  addToCart: (adventure: Adventure, quantity: number) => void;
  navigateTo: (page: PageKey) => void;
}

const AdventureDetailPage: React.FC<AdventureDetailPageProps> = ({ adventure, addToCart, navigateTo }) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!adventure) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-slate-600">Adventure not found. Please select an adventure to view its details.</p>
        <button
          onClick={() => navigateTo('adventures')}
          className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Back to Adventures
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={adventure.coverImageUrl || `https://placehold.co/800x600/333/ccc?text=${encodeURIComponent(adventure.title)}`}
              alt={adventure.title}
              className="w-full h-64 md:h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://placehold.co/800x600/333/ccc?text=Image+Error`;
              }}
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">{adventure.title}</h2>
              <p className="text-md text-slate-500 mb-1">By: {adventure.author}</p>
              <p className="text-md text-slate-500 mb-1">Recommended Level: {adventure.levelMin}-{adventure.levelMax}</p>
              <p className="text-md text-slate-500 mb-4">Theme: {adventure.theme}</p>
              <p className="text-slate-700 leading-relaxed mb-6">{adventure.longDescription || adventure.shortDescription}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500 mb-6">{formatPrice(adventure.price)}</p>
              <div className="flex items-center mb-6 space-x-3">
                <label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity:</label>
                <div className="flex items-center border border-slate-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-l-md"
                    aria-label="Decrease quantity"
                  >
                    <MinusCircle size={20} />
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-none focus:ring-0"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-r-md"
                    aria-label="Increase quantity"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => addToCart(adventure, quantity)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center"
              >
                <ShoppingCart size={20} className="mr-2" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-slate-50 p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold text-slate-700 mb-4">Reviews (Mock)</h3>
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <p className="font-semibold text-slate-800">Adventurer Alex - ★★★★★</p>
            <p className="text-slate-600 text-sm">"Absolutely fantastic! My players loved the twists and turns."</p>
          </div>
          <div className="border-b border-slate-200 pb-4">
            <p className="font-semibold text-slate-800">Dungeon Master Dana - ★★★★☆</p>
            <p className="text-slate-600 text-sm">"A well-crafted adventure, easy to run. Could use a few more maps."</p>
          </div>
          <p className="text-slate-500">More reviews coming soon...</p>
        </div>
      </div>

      <button
        onClick={() => navigateTo('adventures')}
        className="mt-8 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        &larr; Back to All Adventures
      </button>
    </div>
  );
};

export default AdventureDetailPage;
