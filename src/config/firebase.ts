import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBRnVAKfs_tWn06EfllMVD2ySayovozkuw",
    authDomain: "modern-ecommerce-app-b2a7f.firebaseapp.com",
    projectId: "modern-ecommerce-app-b2a7f",
    storageBucket: "modern-ecommerce-app-b2a7f.firebasestorage.app",
    messagingSenderId: "549634641724",
    appId: "1:549634641724:web:cf8bf20c7346ce52a21839",
    measurementId: "G-X9JE7TL93C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
