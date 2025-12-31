import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { toast } from 'sonner';

interface ProductHorizontalScrollProps {
    title: string;
    products: Product[];
    category?: string;
}

const ProductHorizontalScroll = ({ title, products, category }: ProductHorizontalScrollProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector((state) => state.wishlist?.items || []);

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

    const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(product));
        const isWishlisted = wishlistItems.some(item => item.id === product.id);
        if (!isWishlisted) {
            toast.success(`Added to favorites`);
        } else {
            toast.info(`Removed from favorites`);
        }
    };

    if (products.length === 0) return null;

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end mb-4 md:mb-8">
                <div className="space-y-1 md:space-y-2">
                    <h3 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tighter uppercase italic leading-tight max-w-2xl">
                        {title}
                    </h3>
                    {category && (
                        <div className="flex items-center gap-2 md:gap-4">
                            <span className="h-[1px] md:h-[2px] w-8 md:w-12 bg-gray-200" />
                            <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                Verified {category} Units
                            </p>
                        </div>
                    )}
                </div>
                <div className="hidden md:flex gap-2 md:gap-4">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-3xl bg-white border border-gray-100 text-gray-950 transition-all hover:bg-black hover:text-white active:scale-90 shadow-xl shadow-black/5"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-8 md:h-8" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-3xl bg-black text-white transition-all hover:bg-indigo-600 active:scale-90 shadow-2xl"
                    >
                        <ChevronRight className="w-4 h-4 md:w-8 md:h-8" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 md:gap-10 px-4 sm:px-6 lg:px-[max(1rem,calc((100vw-80rem)/2))] pb-4 md:pb-8 scrollbar-hide snap-x select-none"
            >
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="flex-shrink-0 w-[170px] md:w-[240px] bg-white border border-gray-100 rounded-[1.2rem] md:rounded-[1.5rem] p-2 md:p-3 cursor-pointer snap-start hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 group relative"
                        onClick={() => {
                            navigate(`/product/${product.id}`);
                            window.scrollTo(0, 0);
                        }}
                    >
                        <div className="aspect-[1/1.2] bg-gray-50 rounded-[1rem] md:rounded-[1.2rem] mb-2 md:mb-3 flex items-center justify-center overflow-hidden p-3 md:p-5 relative group-hover:bg-white transition-colors duration-500">
                            <motion.img
                                src={product.image}
                                alt={product.title}
                                loading="lazy"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop';
                                }}
                                className="w-full h-full object-contain mix-blend-multiply transition-all duration-700"
                            />
                            {product.discountPercentage && (
                                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                                    <span className="bg-indigo-600 text-white text-[6px] md:text-[9px] font-black px-1.5 py-0.5 md:px-3 md:py-1 rounded md:rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                                        -{product.discountPercentage}%
                                    </span>
                                </div>
                            )}

                            {/* Wishlist Button */}
                            <button
                                onClick={(e) => handleToggleWishlist(e, product)}
                                className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all z-20 active:scale-75 ${wishlistItems.some(item => item.id === product.id) ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}
                            >
                                <Heart className={`w-3 h-3 md:w-4 md:h-4 ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4 px-0.5 md:px-1">
                            <div className="space-y-1.5">
                                <div className="space-y-0 md:space-y-0.5">
                                    <p className="text-[6px] md:text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60 truncate">{product.brand}</p>
                                    <h4 className="text-[10px] md:text-[13px] font-black text-gray-950 uppercase tracking-tighter truncate leading-tight group-hover:text-indigo-600 transition-colors">
                                        {product.title}
                                    </h4>
                                </div>

                                <div className="flex items-baseline gap-1 md:gap-2">
                                    <span className="text-[11px] md:text-[15px] font-black text-gray-950 italic tracking-tighter leading-none">₹{product.price.toLocaleString()}</span>
                                    {product.discountPercentage && (
                                        <span className="text-[8px] md:text-[10px] text-gray-300 line-through font-bold opacity-50">₹{Math.round(product.price * (1 + product.discountPercentage / 100)).toLocaleString()}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className="w-full bg-gray-950 text-white text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] py-1.5 md:py-2.5 rounded-lg hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                                <ShoppingBag className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" />
                                <span>Add to Bag</span>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* View All Card */}
                <motion.div
                    whileHover={{ scale: 0.96, y: -5 }}
                    onClick={() => navigate(`/products/${category?.toLowerCase() || ''}`)}
                    className="flex-shrink-0 w-[140px] md:w-[320px] rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-6 md:p-12 cursor-pointer group hover:bg-white hover:border-indigo-600 transition-all duration-500 shadow-sm"
                >
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center mb-3 md:mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700 shadow-sm group-hover:shadow-indigo-600/20">
                        <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <p className="text-[10px] md:text-base font-black text-gray-950 uppercase tracking-[0.2em] mb-0.5 italic text-center">See More</p>
                    <p className="text-[7px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] text-center opacity-70">{category || 'All Items'}</p>
                </motion.div>
            </div>

            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default ProductHorizontalScroll;
