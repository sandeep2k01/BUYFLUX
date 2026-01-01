import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { Heart, ShoppingBag } from 'lucide-react';
import { addToCart } from '../../../features/cart/cartSlice';
import { toggleWishlist } from '../../../features/wishlist/wishlistSlice';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector((state) => state.wishlist?.items || []);
    const isWishlisted = wishlistItems.some((item) => item.id === product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart(product));
        toast.success(`Unit added to bag`, {
            description: product.title,
            icon: <ShoppingBag className="w-4 h-4 text-indigo-600" />
        });
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(product));
        if (!isWishlisted) {
            toast.success(`Added to favorites`);
        } else {
            toast.info(`Removed from favorites`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="group relative bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer"
        >
            <Link to={`/product/${product.id}`} className="block relative z-0">
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative group-hover:bg-white transition-colors duration-500">
                    <motion.img
                        src={product.image || 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop'}
                        alt={product.title}
                        loading="lazy"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover transition-all duration-700"
                    />

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all z-20 active:scale-75 ${isWishlisted ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 md:w-5 md:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                    <div className="space-y-2">
                        <div className="space-y-0.5 md:space-y-1">
                            <h4 className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">
                                {product.brand || 'Elite Unit'}
                            </h4>
                            <h3 className="text-[11px] md:text-sm font-black text-gray-950 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tighter leading-tight">
                                {product.title}
                            </h3>
                        </div>

                        <div className="flex items-baseline gap-1.5 md:gap-2 pt-0.5">
                            <span className="text-sm md:text-xl font-black text-gray-950 italic tracking-tighter leading-none">
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.discountPercentage && (
                                <span className="text-[9px] md:text-xs text-gray-300 line-through font-bold">
                                    ₹{Math.round(product.price * (100 / (100 - product.discountPercentage))).toLocaleString()}
                                </span>
                            )}
                        </div>

                        {product.discountPercentage && (
                            <div className="bg-indigo-50 inline-block px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md">
                                <span className="text-[7px] md:text-[8px] font-black text-indigo-600 uppercase tracking-tighter">
                                    {product.discountPercentage}% Optimization
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Moved Quick Add to Bottom */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-gray-950 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] py-2 md:py-3.5 rounded-xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <ShoppingBag className="w-3 md:w-4 h-3 md:h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span>Add to Bag</span>
                    </button>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
