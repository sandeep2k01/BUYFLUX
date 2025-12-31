import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Heart, Star } from 'lucide-react';
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
        toast.success(`${product.title} added to bag!`, {
            description: "Go to cart to complete your purchase.",
        });
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(product));
        if (!isWishlisted) {
            toast.success(`${product.title} added to wishlist!`);
        } else {
            toast.info(`${product.title} removed from wishlist`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
        >
            <Link to={`/product/${product.id}`} className="block h-full">
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg bg-indigo-600 hover:bg-indigo-700"
                        >
                            Add to Bag
                        </Button>
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 transition-all z-10 active:scale-95 ${isWishlisted ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600 hover:bg-white'}`}
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Rating Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                        <span className="flex items-center">
                            {product.rating?.rate || 0} <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 ml-0.5" />
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">{product.rating?.count || 0}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-xs font-black text-gray-900 truncate uppercase tracking-widest mb-1">{product.brand || 'Premium'}</h3>
                    <p className="text-sm text-gray-500 truncate mb-3">{product.title}</p>
                    <div className="flex items-end gap-2">
                        <span className="text-lg font-black text-gray-900 tracking-tight">₹{product.price}</span>
                        {product.discountPercentage && (
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs text-gray-400 line-through font-medium">₹{Math.round(product.price * (100 / (100 - product.discountPercentage)))}</span>
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">({product.discountPercentage}% OFF)</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
