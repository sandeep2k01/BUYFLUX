import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

export const wishlistService = {
    // Fetch wishlist items for a user
    fetchWishlist: async (userId: string): Promise<Product[]> => {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return (data.wishlist as Product[]) || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw error;
        }
    },

    // Save entire wishlist to Firestore
    saveWishlist: async (userId: string, items: Product[]) => {
        try {
            const docRef = doc(db, 'users', userId);
            await setDoc(docRef, { wishlist: items }, { merge: true });
        } catch (error) {
            console.error('Error saving wishlist:', error);
            throw error;
        }
    }
};
