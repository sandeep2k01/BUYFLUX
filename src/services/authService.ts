import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    sendEmailVerification,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, Address } from '../types';

import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';

// Storage for simulated OTPs (In a real app, this would be on the server)
let simulatedOTP: { email: string; code: string } | null = null;

export const authService = {
    // Send Verification Code to Email using EmailJS
    sendVerificationCode: async (emailInput: string) => {
        const email = emailInput.trim();
        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            simulatedOTP = { email, code };

            // DEBUG: See the code in browser console (F12)
            console.log(`[AUTH DEBUG] Verification code for ${email} is: ${code}`);

            // Sending real email via EmailJS
            await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                {
                    to_email: email,
                    verification_code: code,
                    project_name: 'Buyflux Ecommerce'
                },
                EMAIL_CONFIG.PUBLIC_KEY
            );

            console.log(`[AUTH SERVICE] OTP sent to ${email}. Check your inbox!`);
            return true;
        } catch (error: any) {
            console.error('EmailJS Error:', error);
            throw new Error(error.text || 'Failed to send verification email. Please check your EmailJS configuration.');
        }
    },

    // Simulated: Verify Code
    verifyCode: async (email: string, code: string) => {
        if (simulatedOTP && simulatedOTP.email === email && simulatedOTP.code === code) {
            return true;
        }
        throw new Error('Invalid or expired verification code');
    },

    // Register new user (now happens AFTER verification)
    register: async (name: string, email: string, password: string): Promise<UserProfile> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update displayName in Auth
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            const userProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL: user.photoURL,
                emailVerified: true, // Mark as true because they just verified via code
                createdAt: new Date().toISOString()
            };

            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, {
                ...userProfile,
                cart: [],
                wishlist: [],
                addresses: []
            }, { merge: true });

            return {
                ...userProfile,
                emailVerified: true
            };
        } catch (error) {
            throw error;
        }
    },

    // Login existing user
    login: async (email: string, password: string): Promise<UserProfile> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch extra data from Firestore
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = { ...docSnap.data() } as UserProfile;
                return profile;
            }

            // Fallback: If user exists in Auth but not in Firestore 'users' collection
            const basicProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                createdAt: new Date().toISOString(),
                addresses: []
            };

            await setDoc(docRef, basicProfile, { merge: true });
            return basicProfile;
        } catch (error) {
            throw error;
        }
    },

    // Finalize verification for an existing user
    confirmUserVerification: async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid);
            await setDoc(docRef, { emailVerified: true }, { merge: true });
            return true;
        } catch (error) {
            throw error;
        }
    },

    // Resend Verification Email (Legacy link-based, kept for profile settings if needed)
    resendVerificationEmail: async () => {
        const user = auth.currentUser;
        if (user) {
            await sendEmailVerification(user);
        }
    },

    // Update addresses in Firestore
    updateAddresses: async (uid: string, addresses: Address[]) => {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, { addresses }, { merge: true });
    },

    // Update profile details
    updateProfileDetails: async (uid: string, data: Partial<UserProfile>) => {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, data, { merge: true });

        // Also update Auth profile if name or photoURL is changed
        const user = auth.currentUser;
        if (user && (data.displayName || data.photoURL)) {
            await updateProfile(user, {
                displayName: data.displayName || user.displayName,
                photoURL: data.photoURL || user.photoURL
            });
        }
    },

    // Logout
    logout: async () => {
        await signOut(auth);
    },

    // Auth State Listener
    onAuthStateChanged: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    // Get Full User Profile from Firestore
    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    }
};
