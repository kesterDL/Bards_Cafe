// src/pages/HomePage.tsx
import React from 'react';
import { Adventure, PageKey } from '../types';
import AdventureCard from '../components/common/AdventureCard';

interface HomePageProps {
  navigateTo: (page: PageKey) => void;
  adventures: Adventure[];
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo, adventures, setSelectedAdventure, addToCart }) => {
  const featuredAdventures = adventures.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-16 sm:py-20 md:py-24 rounded-lg shadow-2xl mb-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">Discover Your Next Epic Adventure!</h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Explore a vast collection of unique, high-quality homebrew Dungeons & Dragons adventures crafted by talented creators.
          </p>
          <button
            onClick={() => navigateTo('adventures')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
          >
            Browse All Adventures
          </button>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-3xl font-semibold text-slate-700 mb-8 text-center">Featured Adventures</h3>
        {adventures.length === 0 ? (
          <p className="text-center text-slate-500">Loading adventures or no adventures available...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAdventures.map(adv => (
              <AdventureCard
                key={adv.id}
                adventure={adv}
                navigateTo={navigateTo}
                setSelectedAdventure={setSelectedAdventure}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-100 py-12 rounded-lg shadow-lg">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-700 mb-4">Ready to Dive In?</h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Our library is constantly growing. Find the perfect story for your D&D group today!
          </p>
          <button
            onClick={() => navigateTo('adventures')}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
          >
            Explore More
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
