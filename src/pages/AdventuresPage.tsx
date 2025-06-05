// src/pages/AdventuresPage.tsx
import React, { useState, ChangeEvent } from 'react';
import { Adventure, PageKey } from '../types';
import AdventureCard from '../components/common/AdventureCard';
import { THEMES, LEVEL_RANGES } from '../constants/MOCK_DATA';
import { Search, Filter } from 'lucide-react';

interface AdventuresPageProps {
  navigateTo: (page: PageKey) => void;
  allAdventures: Adventure[];
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

const AdventuresPage: React.FC<AdventuresPageProps> = ({ navigateTo, allAdventures, setSelectedAdventure, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filteredAdventures = allAdventures.filter(adv => {
    const matchesSearch = adv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === 'All' || adv.theme === selectedTheme;

    let matchesLevel = selectedLevel === 'All';
    if (selectedLevel !== 'All') {
      const [minLvlStr, maxLvlStr] = selectedLevel.split('-');
      const minLvl = parseInt(minLvlStr);
      const maxLvl = maxLvlStr ? parseInt(maxLvlStr) : Infinity;
      matchesLevel = (adv.levelMin >= minLvl && adv.levelMin <= maxLvl) || (adv.levelMax >= minLvl && adv.levelMax <= maxLvl);
    }
    return matchesSearch && matchesTheme && matchesLevel;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-6 bg-slate-100 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold text-slate-700 mb-4 md:mb-0">Browse Adventures</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-sky-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Filter size={18} className="mr-2" /> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        <div className={`flex-col md:flex md:flex-row md:space-x-4 items-center ${showFilters ? 'flex' : 'hidden'} md:flex`}>
          <div className="relative flex-grow w-full md:w-auto mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 w-full md:w-auto">
            <div className="mb-4 sm:mb-0 w-full sm:w-1/2 md:w-auto">
              <label htmlFor="themeFilter" className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
              <select
                id="themeFilter"
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white"
                value={selectedTheme}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTheme(e.target.value)}
              >
                {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-1/2 md:w-auto">
              <label htmlFor="levelFilter" className="block text-sm font-medium text-slate-700 mb-1">Level Range</label>
              <select
                id="levelFilter"
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white"
                value={selectedLevel}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedLevel(e.target.value)}
              >
                {LEVEL_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredAdventures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAdventures.map(adv => (
            <AdventureCard
              key={adv.id}
              adventure={adv}
              navigateTo={navigateTo}
              setSelectedAdventure={setSelectedAdventure}
              addToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 text-xl py-10">
          No adventures match your criteria. Try adjusting your filters!
        </p>
      )}
    </div>
  );
};

export default AdventuresPage;
