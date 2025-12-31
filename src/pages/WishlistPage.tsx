import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const WishlistPage = () => {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.wishlist);

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-500 mb-6">Explore more and shortlist some items.</p>
                <Link to="/products">
                    <Button size="lg">Explore Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist ({items.length})</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                                onClick={() => dispatch(toggleWishlist(item))}
                                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-pink-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{item.brand}</h3>
                            <p className="text-sm text-gray-500 truncate mb-2">{item.title}</p>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                                    <span className="text-xs text-orange-500 font-bold">({item.discountPercentage}% OFF)</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                onClick={() => dispatch(addToCart(item))}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Move to Bag
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
