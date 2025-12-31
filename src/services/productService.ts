import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

export const productService = {
    // Save product metadata to Firestore (Bypassing Storage to avoid billing/upgrade issues)
    addProduct: async (productData: Product): Promise<string> => {
        try {
            console.log("Starting product save to Firestore...");

            const productWithTimestamp = {
                ...productData,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'products'), productWithTimestamp);
            console.log("Product live on Firebase! ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error in productService.addProduct:", error);
            throw error;
        }
    },

    // Fetch all products
    getProducts: async (): Promise<Product[]> => {
        const querySnapshot = await getDocs(collection(db, 'products'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    },

    // Get product by ID
    getProductById: async (id: string): Promise<Product | null> => {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    }
};
