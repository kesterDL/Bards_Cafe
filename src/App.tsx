// src/App.tsx
import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, query, addDoc, DocumentData } from 'firebase/firestore';

import { Adventure, CartItem, CheckoutFormData, MessageState, PageKey, Order } from './types';
import { authInstance, dbInstance, appId as firebaseAppId } from './config/firebaseConfig'; // Use configured appId
import { MOCK_ADVENTURES } from './constants/MOCK_DATA';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import MessageModal from './components/common/MessageModal';
import HomePage from './pages/HomePage';
import AdventuresPage from './pages/AdventuresPage';
import AdventureDetailPage from './pages/AdventureDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

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
        if (initialAuthToken && initialAuthToken !== "") {
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
      } finally {
        // Ensure isAuthReady is set even if all auth attempts fail,
        // so the app can proceed (e.g. to show an error or load public data)
         if (!isAuthReady) setIsAuthReady(true);
      }
    };

    attemptInitialSignIn();
    return () => unsubscribeAuth();
  }, [isAuthReady]); // Added isAuthReady to dependencies to avoid re-running if already set by attemptInitialSignIn

  useEffect(() => {
    if (!isAuthReady) return;

    const adventuresColRef = collection(dbInstance, `artifacts/${firebaseAppId}/public/data/adventures`);
    const unsubscribeAdventures = onSnapshot(query(adventuresColRef), (snapshot) => {
      let fetchedAdventures: Adventure[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as Omit<Adventure, 'id'>;
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
            const docRef = doc(adventuresColRef, adv.id); // Mock adventures have IDs
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

    let unsubscribeCart = () => { };
    if (userId) {
      const cartDocRef = doc(dbInstance, `artifacts/${firebaseAppId}/users/${userId}/carts/activeCart`);
      unsubscribeCart = onSnapshot(cartDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const cartData = docSnap.data() as { items?: CartItem[] };
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
  }, [isAuthReady, userId]); // firebaseAppId is constant from config

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
      const cartDocRef = doc(dbInstance, `artifacts/${firebaseAppId}/users/${userId}/carts/activeCart`);
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
        const ordersColRef = collection(dbInstance, `artifacts/${firebaseAppId}/public/data/orders`);
        const newOrder: Order = {
          userId: userId,
          customerInfo: formData,
          items: cartItems,
          totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.08, // with mock tax
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
        return <HomePage navigateTo={navigateTo} adventures={adventures} setSelectedAdventure={setSelectedAdventure} addToCart={addToCart} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header navigateTo={navigateTo} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} userId={userId} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <MessageModal message={message.text} type={message.type} onClose={() => setMessage({ text: null, type: null })} />
      <Footer />
    </div>
  );
}

export default App;
