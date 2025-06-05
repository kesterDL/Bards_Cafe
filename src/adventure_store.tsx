import React, { useState, useEffect, ChangeEvent, MouseEvent, FormEvent } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User, signInWithCustomToken } from 'firebase/auth';
import { 
    getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, 
    query, DocumentData, Firestore, addDoc 
    // Removed unused Firestore imports: where, orderBy, limit, startAfter, endBefore, limitToLast 
} from 'firebase/firestore';
import { 
    ChevronDown, ChevronUp, Search, ShoppingCart, Trash2, PlusCircle, MinusCircle, 
    User as UserIcon, ShieldCheck, BookOpen, Home, Package, Filter, X 
} from 'lucide-react';

// --- Type Definitions ---
interface Adventure {
  id: string;
  title: string;
  author: string;
  price: number;
  levelMin: number;
  levelMax: number;
  theme: string;
  coverImageUrl?: string;
  shortDescription: string;
  longDescription?: string;
}

interface CartItem extends Adventure {
  quantity: number;
}

interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

interface MessageState {
  text: string | null;
  type: 'success' | 'error' | 'info' | null;
}

type PageKey = 'home' | 'adventures' | 'adventureDetail' | 'cart' | 'checkout';

interface Order {
  userId: string;
  customerInfo: CheckoutFormData;
  items: CartItem[];
  totalAmount: number;
  orderDate: Date; 
  status: string;
}


// --- Firebase Configuration ---
const firebaseConfigFromEnv = {
  apiKey: "YOUR_API_KEY", 
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Global Variables provided by Canvas (DO NOT MODIFY THESE LINES) ---
const a_app_id: string = typeof __app_id !== 'undefined' ? __app_id : 'dnd-adventure-store-dev-ts';
const a_firebase_config_str: string = typeof __firebase_config !== 'undefined' ? __firebase_config : JSON.stringify(firebaseConfigFromEnv);

const parsedFirebaseConfig = JSON.parse(a_firebase_config_str);

// Initialize Firebase
const app: FirebaseApp = initializeApp(parsedFirebaseConfig);
const authInstance: Auth = getAuth(app); // Renamed to avoid conflict with 'auth' prop/variable
const dbInstance: Firestore = getFirestore(app); // Renamed
// --- End Firebase Configuration ---


// --- Mock Data ---
const MOCK_ADVENTURES: Adventure[] = [
  { id: '1', title: 'The Whispering Crypt', author: 'Elara Meadowlight', price: 9.99, levelMin: 1, levelMax: 3, theme: 'Undead', coverImageUrl: 'https://placehold.co/600x400/2d3748/edf2f7?text=Whispering+Crypt', shortDescription: 'A haunted crypt rumored to hold ancient secrets.', longDescription: 'Delve into the depths of the Whispering Crypt, where restless spirits guard forgotten lore. This adventure is designed for low-level characters and features exploration, puzzle-solving, and combat encounters with the undead. Will your party uncover the secrets or become permanent residents?' },
  { id: '2', title: 'Curse of the Sunken City', author: 'Finnian Wavecrest', price: 12.50, levelMin: 5, levelMax: 7, theme: 'Aquatic', coverImageUrl: 'https://placehold.co/600x400/3182ce/eBF4FF?text=Sunken+City', shortDescription: 'Explore a mysterious underwater city plagued by a dark curse.', longDescription: 'The legendary Sunken City of Aethel has resurfaced, but it is not the glorious metropolis of old. A sinister curse grips its coral-covered ruins, and strange aquatic creatures now roam its once-majestic halls. This adventure for mid-level heroes involves underwater exploration, challenging monsters, and the chance to lift an ancient malediction.' },
  { id: '3', title: 'The Dragon\'s Hoard of Mount Cinder', author: 'Ignis Stonebeard', price: 15.00, levelMin: 8, levelMax: 10, theme: 'Dragon', coverImageUrl: 'https://placehold.co/600x400/c53030/fff5f5?text=Dragon%27s+Hoard', shortDescription: 'Dare to claim the treasure guarded by a fearsome red dragon.', longDescription: 'Mount Cinder is home to Ignis, a cunning and powerful red dragon. Legends speak of an immense hoard hidden deep within the volcano. This high-stakes adventure challenges brave heroes to outwit or overcome the dragon and its minions to claim unimaginable riches. Prepare for fiery traps, challenging encounters, and a climactic battle!' },
  { id: '4', title: 'Secrets of the Feywild Glade', author: 'Lyra Moonpetal', price: 8.00, levelMin: 3, levelMax: 5, theme: 'Fey', coverImageUrl: 'https://placehold.co/600x400/38a169/f0fff4?text=Feywild+Glade', shortDescription: 'Navigate the enchanting and treacherous paths of a fey-controlled forest.', longDescription: 'A hidden glade, touched by the chaotic magic of the Feywild, beckons. Strange creatures, powerful fey lords, and riddles await those who dare to enter. This adventure emphasizes roleplaying, trickery, and navigating the whimsical yet dangerous nature of the fey.'},
  { id: '5', title: 'The Clockwork Tower of Gizmo', author: 'Professor Cogsworth', price: 11.25, levelMin: 4, levelMax: 6, theme: 'Steampunk', coverImageUrl: 'https://placehold.co/600x400/718096/e2e8f0?text=Clockwork+Tower', shortDescription: 'Ascend a tower full of mechanical wonders and deadly constructs.', longDescription: 'The eccentric inventor Professor Gizmo has vanished, leaving behind his magnificent Clockwork Tower. Rumored to contain his greatest inventions, it is also filled with malfunctioning automatons and complex puzzles. This adventure blends invention, traps, and mechanical combat.' },
];

const THEMES: string[] = ['All', 'Undead', 'Aquatic', 'Dragon', 'Fey', 'Steampunk', 'Mystery', 'Intrigue', 'Horror'];
const LEVEL_RANGES: string[] = ['All', '1-3', '3-5', '5-7', '8-10', '10+'];

// --- Helper Functions ---
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

// --- Component Props Interfaces ---
interface HeaderProps {
  navigateTo: (page: PageKey) => void;
  cartItemCount: number;
  userId: string | null;
}

interface AdventureCardProps {
  adventure: Adventure;
  navigateTo: (page: PageKey) => void;
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

interface HomePageProps {
  navigateTo: (page: PageKey) => void;
  adventures: Adventure[];
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

interface AdventuresPageProps {
  navigateTo: (page: PageKey) => void;
  allAdventures: Adventure[];
  setSelectedAdventure: (adventure: Adventure) => void;
  addToCart: (adventure: Adventure, quantity: number) => void;
}

interface AdventureDetailPageProps {
  adventure: Adventure | null;
  addToCart: (adventure: Adventure, quantity: number) => void;
  navigateTo: (page: PageKey) => void;
}

interface CartPageProps {
  cartItems: CartItem[];
  removeFromCart: (adventureId: string) => void;
  updateQuantityInCart: (adventureId: string, newQuantity: number) => void;
  navigateTo: (page: PageKey) => void;
  showMessage: (text: string, type?: MessageState['type'], duration?: number) => void;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  handleCheckout: (formData: CheckoutFormData) => void;
  navigateTo: (page: PageKey) => void;
  showMessage: (text: string, type?: MessageState['type'], duration?: number) => void;
}

interface MessageModalProps {
  message: string | null;
  type: MessageState['type'];
  onClose: () => void;
}


// --- Components ---

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

const Footer: React.FC = () => (
  <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
    <div className="container mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} D&D Homebrew Hub. All rights reserved (mock site).</p>
      <p className="text-sm">Created with passion for adventurers everywhere.</p>
    </div>
  </footer>
);

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
          target.src=`https://placehold.co/600x400/333/ccc?text=Image+Error`; 
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
        matchesLevel = (adv.levelMin >= minLvl && adv.levelMin <= maxLvl) || (adv.levelMax >= minLvl && adv.levelMax <=maxLvl);
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
                <Filter size={18} className="mr-2"/> {showFilters ? 'Hide' : 'Show'} Filters
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
                  target.src=`https://placehold.co/800x600/333/ccc?text=Image+Error`; 
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
                <ShoppingCart size={20} className="mr-2"/> Add to Cart
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
                src={item.coverImageUrl || `https://placehold.co/100x80/333/ccc?text=${encodeURIComponent(item.title.substring(0,10))}`} 
                alt={item.title} 
                className="w-20 h-16 object-cover rounded-md mr-4 shadow"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; 
                  target.src=`https://placehold.co/100x80/333/ccc?text=Error`; 
                }}
              />
              <div>
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm">{formatPrice(item.price)} each</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-0">
              <button onClick={() => updateQuantityInCart(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-slate-600 hover:bg-slate-100 rounded-full disabled:opacity-50" disabled={item.quantity <=1}><MinusCircle size={20}/></button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantityInCart(item.id, item.quantity + 1)} className="p-1 text-slate-600 hover:bg-slate-100 rounded-full"><PlusCircle size={20}/></button>
            </div>
            <p className="font-semibold text-slate-700 w-20 text-center mb-2 sm:mb-0">{formatPrice(item.price * item.quantity)}</p>
            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><Trash2 size={20}/></button>
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
            <ShieldCheck size={20} className="mr-2"/> Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

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
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Street Address</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
                <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-slate-700">ZIP / Postal Code</label>
                <input type="text" name="zip" id="zip" value={formData.zip} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
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

const MessageModal: React.FC<MessageModalProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-sky-500';
    const icon = type === 'success' ? '🎉' : type === 'error' ? '❗' : 'ℹ️';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className={`relative ${bgColor} text-white p-6 rounded-lg shadow-xl max-w-sm w-full`}>
                <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-slate-200">
                    <X size={24} />
                </button>
                <div className="flex items-center">
                    <span className="text-2xl mr-3">{icon}</span>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: null, type: null }); 

  const showMessage = (text: string, type: MessageState['type'] = 'info', duration: number = 3000) => {
    setMessage({ text, type });
    setTimeout(() => {
        setMessage({ text: null, type: null });
    }, duration);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(authInstance, async (user: User | null) => {
      if (user) {
        setUserId(user.uid);
        console.log("User is signed in with UID:", user.uid);
      } else {
        console.log("User is signed out, signing in anonymously.");
        try {
          await signInAnonymously(authInstance);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
        }
      }
      setIsAuthReady(true); 
    });

    const attemptInitialSignIn = async () => {
        try {
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (initialAuthToken) {
                console.log("Attempting to sign in with custom token.");
                await signInWithCustomToken(authInstance, initialAuthToken);
            } else if (!authInstance.currentUser) { 
                console.log("No custom token, attempting anonymous sign-in.");
                await signInAnonymously(authInstance);
            }
        } catch (error) {
            console.error("Initial sign-in error:", error);
            if (!authInstance.currentUser) { 
                try {
                    await signInAnonymously(authInstance);
                } catch (anonError) {
                    console.error("Fallback anonymous sign-in error:", anonError);
                }
            }
            setIsAuthReady(true); 
        }
    };

    attemptInitialSignIn();
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return; 

    const adventuresColRef = collection(dbInstance, `artifacts/${a_app_id}/public/data/adventures`);
    const unsubscribeAdventures = onSnapshot(query(adventuresColRef), (snapshot) => {
        let fetchedAdventures: Adventure[] = [];
        snapshot.forEach(doc => {
            // Ensure data conforms to Adventure interface
            const data = doc.data() as Omit<Adventure, 'id'>; // Assume data() provides all fields except id
            fetchedAdventures.push({ id: doc.id, ...data });
        });
        if (fetchedAdventures.length > 0) {
            setAdventures(fetchedAdventures);
            console.log("Fetched adventures from Firestore:", fetchedAdventures.length);
        } else {
            console.log("No adventures in Firestore. Using MOCK_ADVENTURES and attempting to populate.");
            setAdventures(MOCK_ADVENTURES);
            MOCK_ADVENTURES.forEach(async (adv) => {
                try {
                    const docRef = typeof adv.id === 'string' ? doc(adventuresColRef, adv.id) : doc(adventuresColRef);
                    await setDoc(docRef, adv); 
                    console.log(`Mock adventure "${adv.title}" uploaded to Firestore.`);
                } catch (error) {
                    console.error("Error uploading mock adventure:", adv.title, error);
                }
            });
        }
    }, (error) => {
        console.error("Error fetching adventures:", error);
        console.log("Using MOCK_ADVENTURES due to fetch error.");
        setAdventures(MOCK_ADVENTURES); 
    });

    let unsubscribeCart = () => {};
    if (userId) {
        const cartDocRef = doc(dbInstance, `artifacts/${a_app_id}/users/${userId}/carts/activeCart`);
        unsubscribeCart = onSnapshot(cartDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const cartData = docSnap.data() as { items?: CartItem[] }; // items can be optional
                setCartItems(cartData.items || []);
                console.log("Cart loaded for user:", userId, cartData.items);
            } else {
                setCartItems([]); 
                console.log("No active cart for user:", userId);
            }
        }, (error) => {
            console.error("Error fetching cart:", error);
            showMessage("Error loading your cart. Please try again later.", "error");
        });
    } else {
        setCartItems([]);
    }
    
    return () => {
        unsubscribeAdventures();
        unsubscribeCart();
    };
  }, [isAuthReady, userId]); 

  const navigateTo = (page: PageKey) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); 
  };

  const updateFirestoreCart = async (newCartItems: CartItem[]) => {
    if (!userId || !isAuthReady) {
        console.warn("User not authenticated or auth not ready. Cart not saved to Firestore.");
        return;
    }
    try {
      const cartDocRef = doc(dbInstance, `artifacts/${a_app_id}/users/${userId}/carts/activeCart`);
      await setDoc(cartDocRef, { items: newCartItems, lastUpdated: new Date() });
      console.log("Cart updated in Firestore for user:", userId);
    } catch (error) {
      console.error("Error updating Firestore cart:", error);
      showMessage("There was an issue saving your cart. Please try again.", "error");
    }
  };

  const addToCart = (adventure: Adventure, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === adventure.id);
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === adventure.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...prevItems, { ...adventure, quantity }];
      }
      updateFirestoreCart(newItems);
      return newItems;
    });
    showMessage(`${adventure.title} added to cart!`, "success");
  };

  const removeFromCart = (adventureId: string) => {
    setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== adventureId);
        updateFirestoreCart(newItems);
        return newItems;
    });
  };

  const updateQuantityInCart = (adventureId: string, newQuantity: number) => {
    if (newQuantity < 1) return; 
    setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
            item.id === adventureId ? { ...item, quantity: newQuantity } : item
        );
        updateFirestoreCart(newItems);
        return newItems;
    });
  };

  const handleCheckout = async (formData: CheckoutFormData) => {
    console.log("Mock Checkout Initiated. User Data:", formData, "Cart:", cartItems);
    
    if (isAuthReady && userId) {
        try {
            const ordersColRef = collection(dbInstance, `artifacts/${a_app_id}/public/data/orders`);
            const newOrder: Order = {
                userId: userId,
                customerInfo: formData,
                items: cartItems,
                totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.08,
                orderDate: new Date(),
                status: 'MockOrderPlaced'
            };
            await addDoc(ordersColRef, newOrder);
            console.log("Mock order saved to Firestore.");
        } catch (error) {
            console.error("Error saving mock order to Firestore:", error);
        }
    }

    setCartItems([]); 
    updateFirestoreCart([]); 
    showMessage("Mock order placed successfully! Thank you for your purchase.", "success");
    navigateTo('home');
  };

  const renderPage = () => {
    if (!isAuthReady && adventures.length === 0) { 
        return <div className="flex justify-center items-center h-screen text-xl text-slate-600">Loading the arcane scrolls...</div>;
    }
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} adventures={adventures} setSelectedAdventure={setSelectedAdventure} addToCart={addToCart} />;
      case 'adventures':
        return <AdventuresPage navigateTo={navigateTo} allAdventures={adventures} setSelectedAdventure={setSelectedAdventure} addToCart={addToCart} />;
      case 'adventureDetail':
        return <AdventureDetailPage adventure={selectedAdventure} addToCart={addToCart} navigateTo={navigateTo} />;
      case 'cart':
        return <CartPage cartItems={cartItems} removeFromCart={removeFromCart} updateQuantityInCart={updateQuantityInCart} navigateTo={navigateTo} showMessage={showMessage} />;
      case 'checkout':
        return <CheckoutPage cartItems={cartItems} handleCheckout={handleCheckout} navigateTo={navigateTo} showMessage={showMessage} />;
      default:
        return <HomePage navigateTo={navigateTo} adventures={adventures} setSelectedAdventure={setSelectedAdventure} addToCart={addToCart}/>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header navigateTo={navigateTo} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} userId={userId} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <MessageModal message={message.text} type={message.type} onClose={() => setMessage({ text:null, type:null })} />
      <Footer />
    </div>
  );
}

export default App;
