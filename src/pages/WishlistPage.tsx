import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { ShoppingCart, Trash2, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const WishlistPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items } = useAppSelector((state) => state.wishlist);

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-100/30 rounded-full blur-[100px] -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-white border border-pink-50 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto relative group">
                        <Heart className="w-10 h-10 text-pink-200 group-hover:scale-110 group-hover:text-pink-400 transition-all duration-500" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full border-4 border-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Lookbook <span className="text-pink-600">Empty</span></h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                            Your private curation of excellence awaits its first acquisition.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => navigate('/products')}
                        className="px-12 py-5 rounded-2xl bg-gray-950 hover:bg-pink-600 border-none shadow-2xl shadow-pink-100 font-black uppercase text-[11px] tracking-widest transition-all duration-500"
                    >
                        Explore Collections
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header Section */}
            <div className="relative pt-20 pb-16 px-6 lg:px-8 border-b border-gray-50 overflow-hidden bg-gray-50/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-50 rounded-full blur-[120px] -z-10 opacity-50" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-600">Curated Selection</span>
                        </div>
                        <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                            My <span className="text-pink-600">Wishlist</span>
                        </h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Synchronized across all authorized terminals • {items.length} Units</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2">
                        <div className="h-1 w-24 bg-gray-950 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Elite Lookbook v2.0</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-gray-50 rounded-[2.5rem] relative border border-gray-100 group-hover:border-pink-100 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-700">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                        <button
                                            onClick={() => dispatch(toggleWishlist(item))}
                                            className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all duration-300"
                                            title="Remove from Heritage"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                dispatch(addToCart(item));
                                                toast.success("Unit transferred to bag");
                                            }}
                                            className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl flex items-center justify-center text-white hover:bg-gray-900 transition-all duration-300"
                                            title="Move to Bag"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <button
                                            onClick={() => navigate(`/product/${item.id}`)}
                                            className="w-full py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            Review unit <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 px-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">{item.brand}</p>
                                            <h3 className="text-sm font-black text-gray-900 uppercase italic tracking-tight line-clamp-1">{item.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900 tracking-tighter italic">₹{item.price.toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">-{item.discountPercentage}% OFF</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="h-0.5 w-6 bg-pink-100 rounded-full" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Authenticity Verified</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
