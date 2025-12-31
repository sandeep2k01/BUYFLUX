import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';

export const orderService = {
    // Place a new order
    placeOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        try {
            const ordersRef = collection(db, 'orders');
            const newOrder = {
                ...orderData,
                createdAt: new Date().toISOString(),
                serverTimestamp: Timestamp.now()
            };
            const docRef = await addDoc(ordersRef, newOrder);
            return docRef.id;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    },

    // Get orders for a user
    getUserOrders: async (userId: string): Promise<Order[]> => {
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where('userId', '==', userId),
                orderBy('serverTimestamp', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const orders: Order[] = [];

            querySnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() } as Order);
            });

            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
};
