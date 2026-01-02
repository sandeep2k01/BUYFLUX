import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity, syncCart } from '../features/cart/cartSlice';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CartPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items } = useAppSelector((state: any) => state.cart);
    const isAuthenticated = useAppSelector((state: any) => !!state.auth.user);

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    useEffect(() => {
        if (isAuthenticated && items.length > 0) {
            dispatch(syncCart());
        }
    }, [items, isAuthenticated, dispatch]);

    const handleQuantityChange = (id: string, newQuantity: number) => {
        if (newQuantity > 0) {
            dispatch(updateQuantity({ id, quantity: newQuantity }));
        } else {
            dispatch(removeFromCart(id));
            toast.error("Unit removed from manifest");
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-white border border-gray-50 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto relative group">
                        <ShoppingBag className="w-10 h-10 text-gray-200 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Bag <span className="text-indigo-600">Empty</span></h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                            Your curation terminal is currently idle. Initialize shopping to add premium units.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => navigate('/products')}
                        className="px-12 py-5 rounded-2xl bg-gray-950 hover:bg-indigo-600 border-none shadow-2xl shadow-indigo-100 font-black uppercase text-[11px] tracking-widest transition-all duration-500"
                    >
                        Start Acquisition
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="relative pt-20 pb-16 px-6 lg:px-8 border-b border-gray-50 overflow-hidden bg-gray-50/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-0.5 w-10 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Unit Manifest</span>
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                        Shopping <span className="text-indigo-600">Bag</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Units List */}
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <AnimatePresence>
                                {items.map((item: any) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col sm:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 relative group"
                                    >
                                        <div className="w-32 h-32 bg-gray-50 rounded-3xl overflow-hidden p-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                        </div>

                                        <div className="flex-1 w-full text-center sm:text-left space-y-2">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.brand}</p>
                                                <h3 className="text-lg font-black text-gray-950 uppercase italic tracking-tight line-clamp-1">{item.title}</h3>
                                            </div>
                                            <div className="flex items-center justify-center sm:justify-start gap-4">
                                                <span className="text-xl font-black text-gray-900 tracking-tighter italic">₹{item.price.toLocaleString()}</span>
                                                {item.discountPercentage > 0 && (
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100">
                                                        -{item.discountPercentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-gray-900 hover:text-white transition-all active:scale-90"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-black text-sm w-8 text-center tabular-nums">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-gray-900 hover:text-white transition-all active:scale-90"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                dispatch(removeFromCart(item.id));
                                                toast.error("Unit ejected");
                                            }}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Return to Terminal
                        </button>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-gray-950 rounded-[3.5rem] p-10 text-white sticky top-32 shadow-2xl shadow-indigo-200 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />

                            <h2 className="text-xl font-black uppercase italic tracking-tight mb-8 relative z-10">Order <span className="text-indigo-400">Resolution</span></h2>

                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Gross Value</span>
                                    <span className="text-sm font-black text-white italic">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Logistical Fee</span>
                                    <span className="text-sm font-black text-indigo-400 italic">{shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Regulatory Tax (18%)</span>
                                    <span className="text-sm font-black text-white italic">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Final Settlement</p>
                                        <span className="text-3xl font-black text-white tracking-tighter italic">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <Button
                                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-white hover:text-indigo-600 border-none font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-600/20"
                                    size="lg"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Authorize Checkout <Zap className="w-4 h-4 ml-2" />
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Secure</span>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center gap-1">
                                        <Truck className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Insured</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
