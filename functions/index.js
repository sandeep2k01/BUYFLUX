const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Set up Razorpay
// NOTE: For portfolio, you should set these in firebase functions:config:set razorpay.key_id="xxx" razorpay.key_secret="xxx"
const razorpay = new Razorpay({
    key_id: "rzp_test_S1OkWJ8ERlJlex", // Using your test key
    key_secret: "YOUR_RAZORPAY_SECRET_HERE" // You need to add this
});

/**
 * Endpoint 1: Create Order
 * Called when user clicks "Checkout"
 */
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { amount, currency, items, shippingAddress } = data;

    try {
        // 1. Create Razorpay Order
        const rzpOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100), // in paise
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`
        });

        // 2. Create Pending Order in Firestore
        const orderRef = db.collection("orders").doc();
        await orderRef.set({
            userId: context.auth.uid,
            items,
            totalAmount: amount,
            shippingAddress,
            status: "PENDING_PAYMENT",
            paymentStatus: "pending",
            razorpayOrderId: rzpOrder.id,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        });

        return {
            orderId: orderRef.id,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            keyId: razorpay.key_id
        };
    } catch (error) {
        console.error("Order Creation Failed:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Endpoint 2: Verify Payment
 * Called after Razorpay modal completes
 */
exports.verifyPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = data;

    // 1. Generate local signature to compare
    const expectedSignature = crypto
        .createHmac("sha256", "YOUR_RAZORPAY_SECRET_HERE")
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    if (!isVerified) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment signature verification failed.');
    }

    try {
        const orderRef = db.collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) throw new functions.https.HttpsError('not-found', 'Order manifest not found.');

        // 2. Atoms Stock Deduction & Order Confirmation
        await db.runTransaction(async (transaction) => {
            const data = orderDoc.data();

            // Deduct stock for each item
            for (const item of data.items) {
                const productRef = db.collection("products").doc(item.id);
                const productDoc = await transaction.get(productRef);
                const currentStock = productDoc.data().stock || 0;

                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.title}`);
                }

                transaction.update(productRef, { stock: currentStock - item.quantity });
            }

            // Update Order Status
            transaction.update(orderRef, {
                status: "PAID",
                paymentStatus: "completed",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                updatedAt: admin.firestore.Timestamp.now()
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Payment Verification Failed:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
