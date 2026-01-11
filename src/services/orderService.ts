import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';

import { getFunctions, httpsCallable } from 'firebase/functions';

export const orderService = {
    // Stage 1: Create a secure order on the backend
    createPaymentOrder: async (data: {
        amount: number;
        items: any[];
        shippingAddress: any
    }) => {
        const functions = getFunctions();
        const createOrderFn = httpsCallable(functions, 'createOrder');
        const result = await createOrderFn(data);
        return result.data as {
            orderId: string;
            razorpayOrderId: string;
            amount: number;
            keyId: string
        };
    },

    // Stage 2: Verify the payment signature on the backend
    verifyPayment: async (data: {
        orderId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => {
        const functions = getFunctions();
        const verifyFn = httpsCallable(functions, 'verifyPayment');
        const result = await verifyFn(data);
        return result.data as { success: boolean };
    },

    // Legacy method for COD
    placeOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        // ... (existing COD logic)
        try {
            const { runTransaction, doc, collection } = await import('firebase/firestore');
            let orderId = '';

            await runTransaction(db, async (transaction) => {
                // Step 1: Stock Audit
                for (const item of orderData.items) {
                    const productRef = doc(db, 'products', item.id);
                    const productSnap = await transaction.get(productRef);
                    const data = productSnap.data();
                    if (!data) continue; // Skip if product manifest is missing

                    // If stock is undefined (legacy item), we assume infinite availability (100) to avoid blocking
                    const currentStock = data.stock !== undefined ? data.stock : 100;

                    if (currentStock < item.quantity) {
                        throw new Error(`Acquisition blocked: Insufficient inventory for ${item.title}. Required: ${item.quantity}, Available: ${currentStock}`);
                    }
                }

                // Step 2: Resource Allocation (Deduction)
                for (const item of orderData.items) {
                    const productRef = doc(db, 'products', item.id);
                    const productSnap = await transaction.get(productRef);
                    const data = productSnap.data();
                    const currentStock = data?.stock !== undefined ? data.stock : 100;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    transaction.update(productRef, { stock: newStock });
                    console.log(`[INVENTORY] Updated ${item.title} stock to ${newStock}`);
                }

                // Step 3: Creation of Manifest (Order)
                const ordersRef = collection(db, 'orders');
                const orderDocRef = doc(ordersRef); // Generate unique ID upfront
                const finalOrder = {
                    ...orderData,
                    createdAt: new Date().toISOString(),
                    serverTimestamp: Timestamp.now()
                };
                transaction.set(orderDocRef, finalOrder);
                orderId = orderDocRef.id;
            });

            console.log("Acquisition finalized with atomic integrity. ID:", orderId);
            return orderId;
        } catch (error) {
            console.error('CRITICAL TRANSACTION FAILURE:', error);
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
    },

    // Update order payment status
    updateOrderPayment: async (orderId: string, paymentData: { status: Order['paymentStatus']; paymentId?: string }): Promise<void> => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                paymentStatus: paymentData.status,
                paymentId: paymentData.paymentId || null,
                // If payment is completed, ensure status is 'processing' at least
                status: paymentData.status === 'completed' ? 'processing' : 'pending'
            });
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    },

    // Get a single order by ID
    getOrderById: async (orderId: string): Promise<Order | null> => {
        try {
            const { getDoc } = await import('firebase/firestore');
            const orderRef = doc(db, 'orders', orderId);
            const docSnap = await getDoc(orderRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Order;
            }
            return null;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },

    // Update order status (Admin)
    updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status });
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
};
