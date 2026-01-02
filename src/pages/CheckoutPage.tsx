import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { clearCart } from '../features/cart/cartSlice';
import { Address, OrderItem } from '../types';
import { CheckCircle2, CreditCard, Lock, ShieldCheck, Zap, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: any) => state.auth.user);
    const { items: cartItems } = useAppSelector((state) => state.cart);

    const [step, setStep] = useState(1); // 1: Address, 2: Order Summary, 3: Payment, 4: Success
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mrp = subtotal * 1.5; // Dummy MRP
    const discount = mrp - subtotal;
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchAddresses = async () => {
            const profile = await authService.getUserProfile(user.uid);
            if (profile?.addresses) {
                setAddresses(profile.addresses);
                const defaultAddr = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
                setSelectedAddress(defaultAddr || null);
            }
        };

        fetchAddresses();
    }, [user, navigate]);

    if (cartItems.length === 0 && step !== 4) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Cart is Empty</h2>
                <p className="text-gray-500 mb-8 text-center max-w-xs">Fill your cart with some premium pieces first!</p>
                <Button onClick={() => navigate('/products')} className="px-10 py-6 rounded-2xl font-black italic">Shop Now</Button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!user || !selectedAddress) return;

        if (user.emailVerified === false) {
            toast.error("Email Verification Required", {
                description: "Please verify your email address before placing an order. Check your inbox for the link.",
                duration: 5000
            });
            return;
        }

        setLoading(true);
        try {
            const { Timestamp } = await import('firebase/firestore');
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                items: cartItems as OrderItem[],
                totalAmount: total,
                shippingAddress: selectedAddress,
                status: 'pending' as const,
                paymentMethod,
                paymentStatus: paymentMethod === 'cod' ? 'pending' as const : 'completed' as const,
                createdAt: new Date().toISOString(),
                serverTimestamp: Timestamp.now()
            };

            const id = await orderService.placeOrder(orderData);

            // Trigger Email Notification
            const { notificationService } = await import('../services/notificationService');
            await notificationService.sendOrderEmail(
                user.email,
                id,
                'Order Initialized',
                `Acquisition Manifest #${id.slice(-6).toUpperCase()} is now active. Tracking synchronized with your account.`
            );

            setOrderId(id);
            dispatch(clearCart());
            setStep(4);
            toast.success("Order Placed Successfully!");
        } catch (error) {
            console.error(error);
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const renderStepper = () => (
        <div className="bg-white border-b border-gray-100 sticky top-0 md:relative z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 md:gap-8 min-w-max">
                    {[
                        { num: 1, label: 'Address' },
                        { num: 2, label: 'Order Summary' },
                        { num: 3, label: 'Payment' }
                    ].map((s) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black italic transition-all ${step === s.num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' :
                                step > s.num ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                            {s.num < 3 && <div className="w-8 md:w-16 h-px bg-gray-100 ml-2" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const PriceSummary = () => (
        <div className="bg-white rounded-3xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-2xl shadow-gray-100/50">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Price Details</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Price ({cartItems.length} items)</span>
                    <span className="font-bold text-gray-900">₹{mrp.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Discount</span>
                    <span className="font-bold text-green-600">-₹{discount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                    <span className="font-bold text-green-600">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 mt-4 flex justify-between">
                    <span className="text-base font-black text-gray-900 uppercase">Total Amount</span>
                    <span className="text-lg font-black text-gray-900">₹{total.toFixed(0)}</span>
                </div>
            </div>
            <div className="p-4 bg-green-50 border-t border-green-100">
                <p className="text-[10px] font-black text-green-700 text-center uppercase tracking-widest">
                    You will save ₹{discount.toFixed(0)} on this order
                </p>
            </div>
        </div>
    );

    if (step === 4) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 relative"
                >
                    <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-20 h-20 text-green-600" />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-green-100/50 -z-10"
                    />
                </motion.div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase italic">Order Confirmed</h1>
                <p className="text-gray-500 text-center max-w-sm mb-10 font-medium leading-relaxed uppercase tracking-tighter text-xs">
                    Get ready! Your capsule collection is being packed. Your order ID is <span className="text-indigo-600 font-black">#{orderId?.slice(-6).toUpperCase()}</span>
                </p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Button onClick={() => navigate('/profile')} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Track Order</Button>
                    <button onClick={() => navigate('/')} className="text-xs font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Back to Store</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
            {renderStepper()}

            <div className="max-w-7xl mx-auto px-0 md:px-8 py-0 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-10">

                    {/* Left: Interactive Steps */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">

                        {/* Step 1: Address */}
                        <div className={`bg-white md:rounded-2xl border-b md:border border-gray-100 overflow-hidden ${step > 1 ? 'opacity-70' : ''}`}>
                            <div className="p-6 flex items-center justify-between bg-white border-b border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black italic shadow-lg ${step >= 1 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>1</div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest italic leading-none">Delivery Address</h2>
                                </div>
                                {step > 1 && (
                                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-indigo-600 border-2 border-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest">Change</button>
                                )}
                            </div>

                            <AnimatePresence>
                                {step === 1 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6"
                                    >
                                        <div className="space-y-4">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddress(addr)}
                                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative group active:scale-95 ${selectedAddress?.id === addr.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 hover:border-gray-200 bg-gray-50/20'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress?.id === addr.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                                                {selectedAddress?.id === addr.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                            <span className="font-black text-sm text-gray-900 uppercase tracking-tight italic">{addr.name}</span>
                                                            <span className="text-[8px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{addr.type}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed ml-7">
                                                        {addr.street}, {addr.locality && `${addr.locality}, `}
                                                        <br />
                                                        {addr.city}, {addr.state} - {addr.zipCode}
                                                        <br />
                                                        <span className="font-black text-gray-900 tracking-tight mt-1 inline-block">{addr.mobile}</span>
                                                    </p>

                                                    {selectedAddress?.id === addr.id && (
                                                        <motion.button
                                                            layoutId="deliverBtn"
                                                            onClick={() => setStep(2)}
                                                            className="mt-6 w-full py-4 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            Deliver Here <Zap className="w-3.5 h-3.5 fill-current" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={() => navigate('/profile')} className="w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-xs font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-widest">
                                                <Plus className="w-4 h-4" /> Add New Address
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step > 1 && selectedAddress && (
                                <div className="px-6 py-4 bg-gray-50/50">
                                    <p className="text-xs font-black text-gray-900 italic uppercase leading-none">{selectedAddress.name} <span className="opacity-30 font-thin ml-2">{selectedAddress.mobile}</span></p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate mt-1">{selectedAddress.street}, {selectedAddress.city}</p>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Order Summary */}
                        <div className={`bg-white md:rounded-2xl border-b md:border border-gray-100 overflow-hidden ${step < 2 ? 'opacity-50 pointer-events-none' : step > 2 ? 'opacity-70' : ''}`}>
                            <div className="p-6 flex items-center justify-between bg-white border-b border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black italic shadow-lg ${step >= 2 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>2</div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest italic leading-none">Order Summary</h2>
                                </div>
                            </div>

                            <AnimatePresence>
                                {step === 2 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6 space-y-6"
                                    >
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-5 group">
                                                <div className="w-24 h-32 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">{item.brand}</p>
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{item.title}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Seller: ModernShop Retails</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-gray-900 italic tracking-tighter">₹{item.price}</span>
                                                        <span className="text-xs text-gray-400 line-through font-bold opacity-50">₹{Math.round(item.price * 1.5)}</span>
                                                        <span className="text-[10px] font-black text-green-600 uppercase italic">33% Off</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-900 opacity-60 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                        <ShieldCheck className="w-3 h-3 text-indigo-600" /> 7 Days Replacement Policy
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order confirmation email will be sent to <span className="text-gray-900">{user.email}</span></p>
                                            <button
                                                onClick={() => setStep(3)}
                                                className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Step 3: Payment */}
                        <div className={`bg-white md:rounded-2xl border-b md:border border-gray-100 overflow-hidden ${step < 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="p-6 flex items-center bg-white border-b border-gray-50 gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black italic shadow-lg ${step >= 3 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>3</div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest italic leading-none">Payment Options</h2>
                            </div>

                            <AnimatePresence>
                                {step === 3 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6"
                                    >
                                        <div className="space-y-4">
                                            {[
                                                { id: 'upi', label: 'UPI (PhonePe, Google Pay)', desc: 'Pay instantly with your UPI apps' },
                                                { id: 'card', label: 'Credit / Debit / ATM Card', desc: 'Securely use any major card network' },
                                                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive the archive' }
                                            ].map((m) => (
                                                <label
                                                    key={m.id}
                                                    className={`block p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 hover:border-gray-200 bg-gray-50/20'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        className="hidden"
                                                        checked={paymentMethod === m.id}
                                                        onChange={() => setPaymentMethod(m.id as any)}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                                                {paymentMethod === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm text-gray-900 uppercase tracking-tight italic">{m.label}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{m.desc}</p>
                                                            </div>
                                                        </div>
                                                        <CreditCard className={`w-5 h-5 ${paymentMethod === m.id ? 'text-indigo-600' : 'text-gray-300'}`} />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="mt-10 p-6 bg-gray-900 rounded-3xl text-white">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Archive Total</p>
                                                    <p className="text-3xl font-black italic tracking-tighter">₹{total.toFixed(0)}</p>
                                                </div>
                                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                                    <Lock className="w-6 h-6 text-indigo-400" />
                                                </div>
                                            </div>
                                            <button
                                                disabled={loading}
                                                onClick={handlePlaceOrder}
                                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {loading ? 'Finalizing Archive...' : 'Confirm Order'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Price Details (Desktop Sidebar) */}
                    <div className="hidden lg:block space-y-6">
                        <PriceSummary />
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                            <ShieldCheck className="w-8 h-8 text-gray-300" />
                            <p className="text-[10px] font-bold text-gray-400 leading-tight uppercase tracking-tight">Safe and Secure Payments. 100% Authentic Products Only.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer (Flipkart Style) */}
            <AnimatePresence>
                {step < 4 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
                    >
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Package</p>
                            <p className="text-xl font-black text-gray-900 italic tracking-tighter mt-1">₹{total.toFixed(0)}</p>
                            <button onClick={() => toast.info(<PriceSummary />, { duration: 5000 })} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">View Breakdown</button>
                        </div>
                        {step === 1 ? (
                            <button
                                onClick={() => selectedAddress ? setStep(2) : toast.error("Select Address")}
                                className="bg-orange-500 text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-100"
                            >
                                Continue
                            </button>
                        ) : step === 2 ? (
                            <button
                                onClick={() => setStep(3)}
                                className="bg-gray-900 text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-200"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                disabled={loading}
                                onClick={handlePlaceOrder}
                                className="bg-indigo-600 text-white px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100"
                            >
                                {loading ? 'Finalizing...' : 'Pay Now'}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CheckoutPage;
