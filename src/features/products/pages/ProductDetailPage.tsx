import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addToCart } from '../../../features/cart/cartSlice';
import { toggleWishlist } from '../../../features/wishlist/wishlistSlice';
import { Product } from '../../../types';
import { Button } from '../../../components/ui/Button';
import {
    Heart,
    ShoppingBag,
    Star,
    ArrowLeft,
    ShieldCheck,
    ChevronRight,
    Share2,
    Search,
    Zap,
    MapPin,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../productSlice';
import { addToRecentlyViewed } from '../recentlyViewedSlice';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { items } = useAppSelector((state) => state.products);
    const wishlistItems = useAppSelector((state) => state.wishlist?.items || []);
    const cartItems = useAppSelector((state) => state.cart.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

    const [reviewsCount, setReviewsCount] = useState(0);

    const needsSize = useMemo(() => {
        if (!product) return false;
        const cat = (product.category || '').toLowerCase();
        const title = (product.title || '').toLowerCase();

        // 1. Must be in a clothing-friendly category
        const apparelCategories = ['men', 'women', 'kids'];
        if (!apparelCategories.includes(cat)) return false;

        // 2. Filter out known accessories/non-clothing items
        const nonApparelKeywords = [
            'watch', 'bag', 'sunglass', 'jewelry', 'jewel', 'ring', 'necklace',
            'earring', 'pendant', 'bracelet', 'wallet', 'purse', 'clutch',
            'perfume', 'fragrance', 'beauty', 'makeup', 'cream', 'lotion',
            'mobile', 'laptop', 'electronic', 'gadget', 'home', 'decor',
            'bottle', 'jar', 'potato', 'groceries', 'food'
        ];

        const isNonApparel = nonApparelKeywords.some(keyword =>
            title.includes(keyword) ||
            cat.includes(keyword)
        );

        return !isNonApparel;
    }, [product]);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchProducts());
            return;
        }

        // Find in redux items (which already contains merged firebase products)
        const foundProduct = items.find(item => item.id === id);
        if (foundProduct) {
            setProduct(foundProduct);
            setMainImage(foundProduct.image || '');
            dispatch(addToRecentlyViewed(foundProduct));
            setLoading(false);
        } else {
            setLoading(false);
        }
        window.scrollTo(0, 0);
    }, [id, items, dispatch]); // Removed loading from deps

    // Live review count listener
    useEffect(() => {
        if (!id) return;
        const q = query(collection(db, 'reviews'), where('productId', '==', id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReviewsCount(snapshot.docs.length);
        });
        return () => unsubscribe();
    }, [id]);

    const isWishlisted = wishlistItems.some((item) => item.id === product?.id);

    const handleAddToCart = () => {
        if (!product) return;
        if (needsSize && !selectedSize) {
            toast.error("Select Size", {
                description: "This item requires a size selection."
            });
            return;
        }
        dispatch(addToCart(product));
        toast.success("Added to Bag!", {
            icon: <ShoppingBag className="w-4 h-4" />,
            description: `${product.title} is waiting for you.`
        });
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (needsSize && !selectedSize) {
            toast.error("Select Size", {
                description: "This item requires a size selection."
            });
            return;
        }
        dispatch(addToCart(product));
        navigate('/cart');
    };

    const handleToggleWishlist = () => {
        if (!product) return;
        dispatch(toggleWishlist(product));
        if (!isWishlisted) {
            toast.success("Added to Wishlist!");
        } else {
            toast.info("Removed from Wishlist");
        }
    };

    const originalPrice = product?.discountPercentage && product.discountPercentage < 100
        ? Math.round(product.price * (100 / (100 - product.discountPercentage)))
        : null;

    const similarProducts = useMemo(() => {
        if (!product || !product.category) return [];
        return items
            .filter(item =>
                item.category?.toLowerCase() === product.category?.toLowerCase() &&
                item.id !== product.id
            )
            .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
            .slice(0, 10); // Fetch more for horizontal scroll
    }, [product, items]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 shadow-2xl shadow-indigo-100"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Store...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Item Out of Stock</h2>
                <p className="text-gray-500 mb-8 text-center max-w-xs">We couldn't find this piece. Explore our new collection instead!</p>
                <Button onClick={() => navigate('/products')} className="px-10 py-6 rounded-2xl font-black italic">Shop Collection</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12">
            {/* Custom Header for Mobile (Flipkart Style) */}
            <div className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
                        <ArrowLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Shop</span>
                        <span className="text-sm font-black text-gray-900 truncate max-w-[150px] leading-tight italic">{product.brand || 'Store'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Search className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={handleToggleWishlist} className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isWishlisted ? 'text-pink-500' : 'text-gray-700'}`}>
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ShoppingBag className="w-5 h-5 text-gray-700" />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Breadcrumbs (Desktop) */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">Store</button>
                    <ChevronRight className="w-3 h-3 opacity-30" />
                    <button onClick={() => navigate('/products')} className="hover:text-indigo-600 transition-colors">Archive</button>
                    <ChevronRight className="w-3 h-3 opacity-30" />
                    <span className="text-indigo-600 truncate">{product.title || 'Product'}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-0 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 xl:gap-20">

                    {/* Left: Image Gallery (Flipkart Style) */}
                    <div className="bg-white md:bg-transparent md:space-y-6">
                        <div className="relative group overflow-hidden md:rounded-3xl border-b md:border border-gray-100 md:shadow-2xl md:shadow-indigo-100/20">
                            <motion.img
                                key={mainImage}
                                initial={{ opacity: 0.5, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                src={mainImage || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop'}
                                alt={product.title}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop';
                                }}
                                className="w-full aspect-[3/4] object-cover"
                            />

                            {/* Desktop Float Buttons */}
                            <div className="hidden md:block absolute top-6 right-6 space-y-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <button onClick={handleToggleWishlist} className={`p-4 rounded-2xl shadow-xl backdrop-blur-md transition-all active:scale-90 ${isWishlisted ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-700'}`}>
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-4 rounded-2xl bg-white/90 text-gray-700 shadow-xl backdrop-blur-md hover:bg-white transition-all active:scale-90">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Badge */}
                            <div className="absolute bottom-4 left-4 md:hidden">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-black text-white italic">{product.rating?.rate || 0} ({reviewsCount || product.rating?.count || 0}+)</span>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="px-4 py-4 md:px-0 scrollbar-hide overflow-x-auto">
                            <div className="flex md:grid md:grid-cols-4 gap-3">
                                {[product.image, ...Array(3).fill(product.image)].map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 h-20 md:w-auto md:aspect-square flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-1 ${mainImage === img ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-100 bg-white'}`}
                                    >
                                        <img
                                            src={img || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop'}
                                            className="w-full h-full object-cover rounded-xl"
                                            alt="thumbnail"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="px-5 py-8 md:px-0 flex flex-col bg-white md:bg-transparent mt-2 md:mt-0 rounded-t-[40px] md:rounded-none relative z-10 shadow-t-xl md:shadow-none">

                        {/* Brand & Price Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col mb-8"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 italic">{product.brand}</p>
                                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight uppercase">{product.title}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic">₹{product.price}</span>
                                    {originalPrice && (
                                        <span className="text-base md:text-xl text-gray-400 line-through font-bold opacity-60">₹{originalPrice}</span>
                                    )}
                                </div>
                                {product.discountPercentage && (
                                    <span className="bg-green-100 text-green-600 px-3 py-1.5 rounded-xl text-xs md:text-sm font-black uppercase italic animate-pulse">
                                        {product.discountPercentage}% OFF
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {product.stock > 0 ? `Inventory: ${product.stock} Ready` : 'Inventory Depleted'}
                                </div>
                                {product.stock > 0 && product.stock < 10 && (
                                    <span className="text-[9px] font-black text-orange-500 uppercase animate-pulse">Critical Low Stock</span>
                                )}
                            </div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Free delivery on orders above ₹499</p>
                        </motion.div>

                        {/* Variant Selection */}
                        {needsSize && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-10 bg-gray-50/80 p-6 rounded-[32px] border border-gray-100"
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Variant</h3>
                                    <button className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline">
                                        Size Guide <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[56px] h-14 rounded-2xl flex items-center justify-center text-xs font-black transition-all border-2 relative overflow-hidden active:scale-95 ${selectedSize === size
                                                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xl shadow-indigo-100'
                                                : 'border-white bg-white hover:border-indigo-100 text-gray-400'
                                                }`}
                                        >
                                            {size}
                                            {selectedSize === size && (
                                                <motion.div layoutId="activeSize" className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Desktop Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="hidden md:flex gap-4 mb-12"
                        >
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-gray-900 text-white h-20 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                                <ShoppingBag className="w-5 h-5" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="flex-1 bg-indigo-600 text-white h-20 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                                <Zap className="w-5 h-5 fill-current" /> {product.stock === 0 ? 'Notify Me' : 'Buy Now'}
                            </button>
                        </motion.div>

                        {/* Store Offer Info */}
                        <div className="space-y-4 mb-12">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-gray-900 uppercase mb-0.5 tracking-tight">Standard Delivery</p>
                                    <p className="text-[11px] text-green-600 font-bold uppercase tracking-widest">Expected by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs for Details/Reviews */}
                        <div className="border-b border-gray-100 mb-8 flex gap-8">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'details' ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                Details
                                {activeTab === 'details' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'reviews' ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                Reviews
                                {activeTab === 'reviews' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'details' ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <p className="text-gray-600 leading-relaxed text-sm font-medium">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col gap-2">
                                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authentic</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col gap-2">
                                            <RotateCcw className="w-5 h-5 text-indigo-600" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">14d Easy Return</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reviews"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <ReviewSection productId={product.id} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Similar Products Section - Shopsy Style Horizontal Scroll */}
                {similarProducts.length > 0 && (
                    <div className="mt-20 px-5 md:px-0 bg-white md:bg-transparent py-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-100 pb-8">
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2"
                                >
                                    Similar Products
                                </motion.h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Based on your current selection in {product.category}</p>
                            </div>
                            <Link to={`/products/${(product.category || 'all').toLowerCase()}`} className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 group">
                                View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="relative group">
                            <motion.div
                                className="flex gap-4 md:gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                {similarProducts.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="min-w-[180px] md:min-w-[280px] snap-start"
                                    >
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}

                                {/* Final 'View All' Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="min-w-[180px] md:min-w-[200px] flex items-center justify-center snap-start"
                                >
                                    <Link
                                        to={`/products/${(product.category || 'all').toLowerCase()}`}
                                        className="w-full aspect-[3/4] rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-4 group hover:bg-indigo-100 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <ChevronRight className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Explore More</span>
                                    </Link>
                                </motion.div>
                            </motion.div>

                            {/* Scroll Indicators (Mobile) */}
                            <div className="flex md:hidden justify-center gap-1.5 mt-4 mb-4">
                                {[...Array(Math.min(similarProducts.length, 5))].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                ))}
                            </div>

                            <div className="mt-4 md:hidden">
                                <Link to={`/products/${(product.category || 'all').toLowerCase()}`} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                    View All <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Sticky Footer (Flipkart Style) */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3 flex gap-3 z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-white border-2 border-gray-900 text-gray-900 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                    <ShoppingBag className="w-4 h-4" /> {product.stock === 0 ? 'Out' : 'Add to Bag'}
                </button>
                <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gray-900 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                    <Zap className="w-4 h-4 fill-current" /> {product.stock === 0 ? 'Waitlist' : 'Buy Now'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetailPage;
