import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity, syncCart } from '../features/cart/cartSlice';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEffect } from 'react';

const CartPage = () => {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state: any) => state.cart);
    const isAuthenticated = useAppSelector((state: any) => !!state.auth.user);

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping;

    // Persist changes if logged in
    useEffect(() => {
        if (isAuthenticated && items.length > 0) {
            // Debounce could be added here for better performance
            dispatch(syncCart());
        }
    }, [items, isAuthenticated, dispatch]);

    const handleQuantityChange = (id: string, newQuantity: number) => {
        if (newQuantity >= 0) {
            dispatch(updateQuantity({ id, quantity: newQuantity }));
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <img src="https://via.placeholder.com/200?text=Empty+Cart" alt="Empty Cart" className="mb-6 opacity-50" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bag is Empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your bag yet.</p>
                <Link to="/products">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Bag ({items.length} Items)</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative">
                            <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md" />

                            <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                                <h3 className="font-semibold text-gray-900">{item.brand}</h3>
                                <p className="text-sm text-gray-500 truncate">{item.title}</p>
                                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="font-bold">₹{item.price}</span>
                                    {item.discountPercentage && (
                                        <span className="text-green-600 text-xs">{item.discountPercentage}% Off</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <button
                                onClick={() => dispatch(removeFromCart(item.id))}
                                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Estimate</span>
                                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax Estimate</span>
                                <span>₹{Math.round(subtotal * 0.18)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Order Total</span>
                                <span>₹{total + Math.round(subtotal * 0.18)}</span>
                            </div>
                        </div>
                        <Link to="/checkout">
                            <Button className="w-full" size="lg">Checkout</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
