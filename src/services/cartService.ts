import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CartItem } from '../types';

export const cartService = {
    // Fetch cart items for a user
    fetchCart: async (userId: string): Promise<CartItem[]> => {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return (data.cart as CartItem[]) || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    // Save entire cart to Firestore (easiest sync strategy for simple app)
    saveCart: async (userId: string, cartItems: CartItem[]) => {
        try {
            const docRef = doc(db, 'users', userId);
            await setDoc(docRef, { cart: cartItems }, { merge: true });
        } catch (error) {
            console.error('Error saving cart:', error);
            throw error;
        }
    }
};
