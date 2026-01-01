import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc
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
    },

    // Upload image to Cloudinary (FREE & REAL UPLOADS)
    uploadImage: async (file: File): Promise<string> => {
        const CLOUD_NAME = "do2vcaoke";
        const UPLOAD_PRESET = "x9pzklrb";

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            console.log("DEBUG: Starting Cloudinary upload...");
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Cloudinary Upload Failed");
            }

            const data = await response.json();
            console.log("DEBUG: Cloudinary upload success:", data.secure_url);
            return data.secure_url;
        } catch (error: any) {
            console.error("DEBUG: Cloudinary Error:", error);
            throw new Error(error.message || "Failed to upload to Cloudinary. Check your Cloud Name & Preset.");
        }
    },

    // Update product image
    updateProductImage: async (productId: string, imageUrl: string) => {
        try {
            const productRef = doc(db, 'products', productId);
            await updateDoc(productRef, { image: imageUrl });
        } catch (error) {
            console.error("Error updating product image:", error);
            throw error;
        }
    }
};
