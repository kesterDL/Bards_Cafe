// src/components/common/Header.tsx
import React, { useState } from 'react';
import { BookOpen, Home, Package, ShoppingCart, X } from 'lucide-react';
import { PageKey } from '../../types';

interface HeaderProps {
  navigateTo: (page: PageKey) => void;
  cartItemCount: number;
  userId: string | null;
}

const Header: React.FC<HeaderProps> = ({ navigateTo, cartItemCount, userId }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-2 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold cursor-pointer" onClick={() => navigateTo('home')}>
              D&D Homebrew Hub
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-4">
              <button onClick={() => navigateTo('home')} className="hover:text-amber-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Home size={18} className="mr-1" /> Home</button>
              <button onClick={() => navigateTo('adventures')} className="hover:text-amber-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Package size={18} className="mr-1" /> Adventures</button>
            </nav>
            <button onClick={() => navigateTo('cart')} className="relative hover:text-amber-400 transition-colors duration-200 p-2 rounded-full">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                  {cartItemCount}
                </span>
              )}
            </button>
            {userId && <div className="text-xs text-slate-400 hidden lg:block">UID: {userId}</div>}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => navigateTo('cart')} className="relative hover:text-amber-400 transition-colors duration-200 p-2 rounded-full mr-2">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {menuOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { navigateTo('home'); setMenuOpen(false); }} className="text-slate-300 hover:bg-slate-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"><Home size={18} className="mr-2" />Home</button>
            <button onClick={() => { navigateTo('adventures'); setMenuOpen(false); }} className="text-slate-300 hover:bg-slate-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"><Package size={18} className="mr-2" />Adventures</button>
            {userId && <div className="text-xs text-slate-400 px-3 py-2">UID: {userId}</div>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
