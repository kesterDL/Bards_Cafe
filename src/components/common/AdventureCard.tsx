// src/components/common/AdventureCard.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Adventure, PageKey } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface AdventureCardProps {
  adventure: Adventure;
  navigateTo: (page: PageKey) => void;
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

const AdventureCard: React.FC<AdventureCardProps> = ({ adventure, navigateTo, setSelectedAdventure, addToCart }) => {
  const handleViewDetails = () => {
    setSelectedAdventure(adventure);
    navigateTo('adventureDetail');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col h-full">
      <img
        src={adventure.coverImageUrl || `https://placehold.co/600x400/333/ccc?text=${encodeURIComponent(adventure.title)}`}
        alt={adventure.title}
        className="w-full h-48 object-cover"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = `https://placehold.co/600x400/333/ccc?text=Image+Error`;
        }}
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">{adventure.title}</h3>
        <p className="text-sm text-slate-500 mb-1">By: {adventure.author}</p>
        <p className="text-sm text-slate-500 mb-1">Level: {adventure.levelMin}-{adventure.levelMax}</p>
        <p className="text-sm text-slate-500 mb-3">Theme: {adventure.theme}</p>
        <p className="text-slate-600 text-sm mb-4 flex-grow">{adventure.shortDescription}</p>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-amber-500 mb-4">{formatPrice(adventure.price)}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleViewDetails}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              View Details
            </button>
            <button
              onClick={() => addToCart(adventure, 1)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
            >
              <ShoppingCart size={16} className="mr-1" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureCard;
