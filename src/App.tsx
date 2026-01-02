import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import SmoothScroll from './components/layout/SmoothScroll';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toaster } from 'sonner';
import ScrollToTop from './components/layout/ScrollToTop';

// Lazy load pages
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProductListingPage = lazy(() => import('./features/products/pages/ProductListingPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AddProductPage = lazy(() => import('./features/products/pages/AddProductPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'));
const EditProductPage = lazy(() => import('./features/products/pages/EditProductPage'));

// Protected Route Component
import { Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAppSelector((state) => state.auth);
    const isAdmin = user?.email === 'sandeepdamera596@gmail.com';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};



function App() {
    useEffect(() => {
        console.log("BUYFLUX App Mounting...");
        const handleInstallPrompt = (e: any) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
        };

        window.addEventListener('beforeinstallprompt', handleInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    return (
        <Provider store={store}>
            <SmoothScroll>
                <Toaster position="top-center" richColors duration={1400} />
                <AuthLayout>
                    <Router>
                        <ScrollToTop />
                        <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/" element={<MainLayout />}>
                                    <Route index element={<HomePage />} />
                                    <Route path="products" element={<ProductListingPage />} />
                                    <Route path="products/:category" element={<ProductListingPage />} />
                                    <Route path="product/:id" element={<ProductDetailPage />} />
                                    <Route path="cart" element={<CartPage />} />
                                    <Route path="wishlist" element={<WishlistPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="checkout" element={<CheckoutPage />} />

                                    {/* Protected Admin Routes */}
                                    <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                                    <Route path="admin/add-product" element={<AdminRoute><AddProductPage /></AdminRoute>} />
                                    <Route path="admin/edit-product/:id" element={<AdminRoute><EditProductPage /></AdminRoute>} />

                                    {/* Add more routes here */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Route>
                            </Routes>
                        </Suspense>
                    </Router>
                </AuthLayout>
            </SmoothScroll>
        </Provider>
    );
}

export default App;
