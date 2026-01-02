import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setLoading } from '../features/auth/authSlice';
import { fetchCart, resetCart, syncCart } from '../features/cart/cartSlice';
import { fetchWishlist, resetWishlist, syncWishlist } from '../features/wishlist/wishlistSlice';
import { authService } from '../services/authService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { setFirebaseProducts } from '../features/products/productSlice';
import { Product } from '../types';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const cartItems = useAppSelector((state) => state.cart.items);
    const isCartFetched = useAppSelector((state) => state.cart.fetched);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const isWishlistFetched = useAppSelector((state) => state.wishlist.fetched);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged(async (user) => {
            if (user) {
                // Initial set from Auth
                dispatch(setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified
                }));

                // Fetch extra data and real verification status from Firestore
                authService.getUserProfile(user.uid).then(async (profile) => {
                    if (profile) {
                        dispatch(setUser({
                            ...profile,
                            uid: user.uid,
                            email: user.email,
                            displayName: profile.displayName || user.displayName,
                            photoURL: profile.photoURL || user.photoURL,
                            emailVerified: profile.emailVerified || user.emailVerified
                        }));
                    } else {
                        // FORCE REGISTRY SYNC: Create profile if missing in Firestore
                        const newProfile = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            emailVerified: user.emailVerified,
                            createdAt: new Date().toISOString(),
                            addresses: []
                        };
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
                        dispatch(setUser(newProfile));
                        console.log("Registry Synchronized: New user profile initialized.");
                    }
                });

                dispatch(fetchCart(user.uid));
                dispatch(fetchWishlist(user.uid));
            } else {
                dispatch(setUser(null));
                dispatch(resetCart());
                dispatch(resetWishlist());
            }
            dispatch(setLoading(false));
        });

        return () => unsubscribe();
    }, [dispatch]);

    // GLOBAL REAL-TIME PRODUCT LISTENER
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const products: Product[] = [];
            snapshot.docs.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() } as Product);
            });
            console.log(`Synced ${products.length} products from Firebase.`);
            dispatch(setFirebaseProducts(products));
        });

        return () => unsubscribe();
    }, [dispatch]);

    // SYNC CART TO FIREBASE ON CHANGE
    useEffect(() => {
        if (user && isCartFetched) {
            dispatch(syncCart());
        }
    }, [cartItems, user, isCartFetched, dispatch]);

    // SYNC WISHLIST TO FIREBASE ON CHANGE
    useEffect(() => {
        if (user && isWishlistFetched) {
            dispatch(syncWishlist());
        }
    }, [wishlistItems, user, isWishlistFetched, dispatch]);

    return <>{children}</>;
};

export default AuthLayout;
