// src/types/index.ts

export interface Adventure {
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

export interface CartItem extends Adventure {
  quantity: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export interface MessageState {
  text: string | null;
  type: 'success' | 'error' | 'info' | null;
}

export type PageKey = 'home' | 'adventures' | 'adventureDetail' | 'cart' | 'checkout';

export interface Order {
  userId: string;
  customerInfo: CheckoutFormData;
  items: CartItem[];
  totalAmount: number;
  orderDate: Date; // Firestore will convert to Timestamp, but we use Date in JS
  status: string;
}

// This declares the global variables expected from the Canvas environment
// to TypeScript, so it doesn't complain they are not defined.
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}
