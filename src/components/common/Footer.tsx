// src/components/common/Footer.tsx
import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
    <div className="container mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} D&D Homebrew Hub. All rights reserved (mock site).</p>
      <p className="text-sm">Created with passion for adventurers everywhere.</p>
    </div>
  </footer>
);

export default Footer;
