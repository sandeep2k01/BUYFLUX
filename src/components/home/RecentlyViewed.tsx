import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'sonner';
import { Product } from '../../types';

const RecentlyViewed = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const scrollRef = useRef<HTMLDivElement>(null);
    const recentlyViewed = useAppSelector((state) => state.recentlyViewed.items);
    const allProducts = useAppSelector((state) => state.products.items);

    const itemsToShow = useMemo(() => {
        const combined = [...recentlyViewed];
        for (const product of allProducts) {
            if (combined.length >= 12) break;
            if (!combined.find(p => p.id === product.id)) {
                combined.push(product);
            }
        }
        return combined;
    }, [recentlyViewed, allProducts]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart(product));
        toast.success(`Unit added to bag`, {
            description: product.title,
            icon: <ShoppingBag className="w-4 h-4 text-indigo-600" />
        });
    };

    if (itemsToShow.length === 0) return null;

    return (
        <section className="bg-white py-4 md:py-8 border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6 md:mb-10">
                    <div>
                        <h3 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase italic leading-none">
                            RECENTS
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                            Synchronized with your journey
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 shadow-sm transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black text-white shadow-xl hover:bg-indigo-600 transition-all active:scale-90"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x"
                >
                    {itemsToShow.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className="flex-shrink-0 w-[180px] md:w-[260px] bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 cursor-pointer snap-start hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group"
                        >
                            <div
                                onClick={() => {
                                    navigate(`/product/${product.id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="aspect-square bg-gray-50 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center mb-3 md:mb-4 overflow-hidden p-3 md:p-5 group-hover:bg-white transition-colors duration-500 relative"
                            >
                                <motion.img
                                    src={product.image || 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&q=80'}
                                    alt={product.title}
                                    loading="lazy"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&q=80';
                                    }}
                                    className="w-full h-full object-contain group-hover:drop-shadow-lg transition-all"
                                />
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="space-y-1">
                                    <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate opacity-60 italic">{product.brand}</h4>
                                    <h4 className="text-[11px] md:text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tighter">{product.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] md:text-[15px] font-black text-gray-950">₹{product.price.toLocaleString()}</span>
                                        {product.discountPercentage && (
                                            <span className="text-[9px] md:text-[11px] text-gray-300 line-through font-bold opacity-50 font-sans">₹{Math.round(product.price * (1 + product.discountPercentage / 100)).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="w-full bg-gray-950 text-white text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] py-2 md:py-2.5 rounded-lg hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <ShoppingBag className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" />
                                    <span>Add to Bag</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
};


export default RecentlyViewed;
