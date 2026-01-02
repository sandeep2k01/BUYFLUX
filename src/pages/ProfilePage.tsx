import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    ShoppingBag,
    MapPin,
    User as UserIcon,
    LogOut,
    Camera,
    Calendar,
    Phone,
    Map,
    Edit2,
    Package,
    Zap,
    Truck,
    Heart,
    ArrowRight,
    ChevronRight,
    CreditCard,
    ShieldCheck,
    Settings
} from 'lucide-react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, UserProfile, Address } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProfilePage = () => {
    const user = useAppSelector((state: any) => state.auth.user);
    const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Form States
    const [formData, setFormData] = useState({
        mobile: '',
        fullName: '',
        gender: '',
        dob: '',
        location: '',
        alternateMobile: '',
        hintName: '',
        photoURL: ''
    });

    // Address Modal State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
        name: '',
        mobile: '',
        zipCode: '',
        state: '',
        street: '',
        locality: '',
        city: '',
        type: 'Home',
        isDefault: false
    });

    // Real-time Sync
    useEffect(() => {
        if (!user?.uid) return;

        const safetyTimeout = setTimeout(() => {
            setOrdersLoading(false);
        }, 3000);

        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile;
                setProfileData(data);
                dispatch(setUser(data));
                setFormData({
                    mobile: data.mobile || '',
                    fullName: data.displayName || user.displayName || '',
                    gender: data.gender || '',
                    dob: data.dob || '',
                    location: data.location || '',
                    alternateMobile: data.alternateMobile || '',
                    hintName: data.hintName || '',
                    photoURL: data.photoURL || user.photoURL || ''
                });
            }
        });

        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setUserOrders(orders);
            setOrdersLoading(false);
            clearTimeout(safetyTimeout);
        }, (error) => {
            console.error("Orders Snapshot Error:", error);
            setOrdersLoading(false);
            clearTimeout(safetyTimeout);
        });

        return () => {
            unsubProfile();
            unsubOrders();
            clearTimeout(safetyTimeout);
        };
    }, [user?.uid]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.uid) {
            try {
                toast.loading("Uploading Identity Media...");
                const { productService } = await import('../services/productService');
                const photoURL = await productService.uploadImage(file);
                await authService.updateProfileDetails(user.uid, { photoURL });
                setFormData(prev => ({ ...prev, photoURL }));
                toast.success("Profile visual updated via Cloudinary!", { id: 'upload' });
            } catch (err) {
                toast.error("Upload failed. Switch to local?");
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            await authService.updateProfileDetails(user.uid, {
                mobile: formData.mobile,
                displayName: formData.fullName,
                gender: formData.gender,
                dob: formData.dob,
                location: formData.location,
                alternateMobile: formData.alternateMobile,
                hintName: formData.hintName
            });
            setIsEditing(false);
            toast.success('Profile preferences updated');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid || !profileData) return;
        setLoading(true);
        try {
            const newAddress: Address = { ...addressForm, id: Date.now().toString() };
            let updatedAddresses = [...(profileData.addresses || [])];

            if (newAddress.isDefault) {
                updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
            }

            updatedAddresses.push(newAddress);
            await authService.updateAddresses(user.uid, updatedAddresses);

            setShowAddressForm(false);
            setAddressForm({ name: '', mobile: '', zipCode: '', state: '', street: '', locality: '', city: '', type: 'Home', isDefault: false });
            toast.success('Delivery location authorized');
        } catch (error) {
            toast.error('Location synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user?.uid || !profileData?.addresses) return;
        try {
            const updatedAddresses = profileData.addresses.filter(a => a.id !== addressId);
            await authService.updateAddresses(user.uid, updatedAddresses);
            toast.success('Location removed');
        } catch (error) {
            toast.error('De-authorization failed');
        }
    };

    const handleSetDefaultAddress = async (addressId: string) => {
        if (!user?.uid || !profileData?.addresses) return;
        try {
            const updatedAddresses = profileData.addresses.map(a => ({
                ...a,
                isDefault: a.id === addressId
            }));
            await authService.updateAddresses(user.uid, updatedAddresses);
            toast.success('Primary orientation updated');
        } catch (error) {
            toast.error('Orientation failed');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Abort acquisition manifest? This action is permanent.")) return;

        try {
            await authService.cancelOrder(orderId);
            toast.success('Order Aborted');
        } catch (error) {
            toast.error('Abort failed');
        }
    };

    if (!user) return null;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: UserIcon },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'profile', label: 'Settings', icon: Settings },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
    ];

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Minimal Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                {formData.photoURL ? (
                                    <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-indigo-400 bg-indigo-50/50">
                                        {formData.fullName?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-gray-500 hover:text-indigo-600 transition-all hover:scale-110"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">{formData.fullName || 'Authorized User'}</h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user.email === 'sandeepdamera596@gmail.com' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <Package className="w-3.5 h-3.5" /> Admin Console
                            </button>
                        )}
                        <button
                            onClick={() => authService.logout().then(() => navigate('/'))}
                            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Exit
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-64 flex flex-col gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                    : 'bg-white/50 text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                {activeTab === item.id && <ChevronRight className="w-3 h-3 text-white/50" />}
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter italic mb-1">{userOrders.length}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Successful Acquisitions</p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                                            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                                                <Heart className="w-6 h-6" />
                                            </div>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter italic mb-1">{wishlistItems.length}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Curated Favorites</p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter italic mb-1">2,450</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Available Credits</p>
                                        </div>
                                    </div>

                                    {/* Security & Welcome */}
                                    <div className="bg-gray-900 p-10 md:p-12 rounded-[3.5rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative flex flex-col md:flex-row items-center gap-10">
                                            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                                                <ShieldCheck className="w-10 h-10 text-indigo-400" />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-white text-2xl font-black uppercase italic tracking-tight mb-3">Membership status: Elite</h3>
                                                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xl">
                                                    Welcome back to your dashboard. Your account is secured with 256-bit encryption and all your preferences are synchronized across your devices.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('profile')}
                                                className="md:ml-auto px-8 py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95"
                                            >
                                                Security Center
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-black uppercase italic text-gray-900 leading-none">Recent Shipments</h2>
                                        <div className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                            Real-time monitoring
                                        </div>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="space-y-4 animate-pulse">
                                            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100" />)}
                                        </div>
                                    ) : userOrders.length > 0 ? (
                                        <div className="space-y-6">
                                            {userOrders.map((order) => (
                                                <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500">
                                                    <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-indigo-600">
                                                                <Truck className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #{order.id.slice(-8).toUpperCase()}</p>
                                                                <p className="text-sm font-black text-gray-900 uppercase italic mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                        'bg-orange-50 text-orange-600 border-orange-100'
                                                                }`}>
                                                                {order.status}
                                                            </div>
                                                            <div className="text-lg font-black text-gray-950 italic">₹{order.totalAmount.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-8">
                                                        <div className="flex overflow-x-auto gap-4 scrollbar-hide mb-8">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex-shrink-0 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 min-w-[200px]">
                                                                    <img src={item.image} className="w-10 h-10 object-cover rounded-lg bg-white" alt="" />
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tight">{item.title}</p>
                                                                        <p className="text-[9px] text-gray-400 font-bold uppercase italic mt-0.5">{item.quantity} Unit(s)</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-end gap-3">
                                                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                                <button
                                                                    onClick={() => handleCancelOrder(order.id)}
                                                                    className="px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    Abort Manifest
                                                                </button>
                                                            )}
                                                            <button className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">
                                                                Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-gray-900 font-black uppercase italic">No Orders Yet</h3>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Acquire your first curated piece today</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'wishlist' && (
                                <motion.div
                                    key="wishlist"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {wishlistItems.length > 0 ? (
                                        wishlistItems.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 group transition-all hover:shadow-2xl hover:border-pink-100">
                                                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-50 relative mb-4">
                                                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-indigo-600">
                                                        {item.brand}
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-black text-gray-900 uppercase truncate px-2 italic">{item.title}</h4>
                                                <div className="flex justify-between items-center mt-3 px-2">
                                                    <span className="text-sm font-black text-gray-950 italic">₹{item.price.toLocaleString()}</span>
                                                    <button onClick={() => navigate(`/product/${item.id}`)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-gray-900 font-black uppercase italic">Wishlist Empty</h3>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Shortlist pieces that inspire you</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-4xl mx-auto space-y-8"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-black uppercase italic text-gray-900 leading-none">Settings</h2>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identity & Security Manager</p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-red-50 text-red-600' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
                                        >
                                            {isEditing ? 'Discard Changes' : 'Modify Core Details'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Legal Name', name: 'fullName', type: 'text', icon: UserIcon },
                                            { label: 'Mobile Primary', name: 'mobile', type: 'text', icon: Phone },
                                            { label: 'Birth Registry', name: 'dob', type: 'text', icon: Calendar, placeholder: 'DD/MM/YYYY' },
                                            { label: 'Residential Zone', name: 'location', type: 'text', icon: Map },
                                            { label: 'Shadow Mobile', name: 'alternateMobile', type: 'text', icon: Phone },
                                            { label: 'Alias/Hint', name: 'hintName', type: 'text', icon: Edit2 },
                                        ].map(field => (
                                            <div key={field.name} className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">{field.label}</label>
                                                {isEditing ? (
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-indigo-600 transition-colors">
                                                            <field.icon className="w-4 h-4" />
                                                        </div>
                                                        <input
                                                            value={formData[field.name as keyof typeof formData]}
                                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:border-indigo-600 outline-none transition-all shadow-sm focus:shadow-indigo-50"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="px-6 py-5 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-900 italic shadow-sm flex items-center gap-4">
                                                        <field.icon className="w-4 h-4 text-indigo-400" />
                                                        {formData[field.name as keyof typeof formData] || <span className="text-gray-200">Empty Record</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {isEditing && (
                                        <div className="pt-8 text-center">
                                            <Button onClick={handleSaveProfile} loading={loading} className="px-12 py-5 rounded-2xl w-full md:w-auto font-black italic uppercase tracking-widest shadow-2xl">
                                                Finalize and Secure Records
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-black uppercase italic text-gray-900 leading-none">Coordinates</h2>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Managing {profileData?.addresses?.length || 0} Registered Locations</p>
                                        </div>
                                        {!showAddressForm && (
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                            >
                                                Register Contact Point
                                            </button>
                                        )}
                                    </div>

                                    {showAddressForm && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden"
                                        >
                                            <h3 className="text-lg font-black uppercase italic tracking-tight mb-8">Registry Entry</h3>
                                            <form onSubmit={handleAddressSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <input required placeholder="Legal Name" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-400 text-xs font-medium" />
                                                    <input required placeholder="Contact Mobile" value={addressForm.mobile} onChange={e => setAddressForm({ ...addressForm, mobile: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-400 text-xs font-medium" />
                                                    <input required placeholder="Pincode" value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-400 text-xs font-medium" />
                                                    <input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-400 text-xs font-medium" />
                                                    <textarea required placeholder="Full Coordinates Detail" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="md:col-span-2 w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-400 text-xs font-medium min-h-[100px]" />
                                                </div>
                                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                                    <input type="checkbox" id="profile-default" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                                                    <label htmlFor="profile-default" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Authorized as Primary Coordinate</label>
                                                </div>
                                                <div className="flex gap-4">
                                                    <Button type="submit" loading={loading} className="px-10 py-4 rounded-xl font-black italic uppercase tracking-widest text-[10px]">Verify & Save</Button>
                                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase">Discard</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profileData?.addresses?.map(addr => (
                                            <div key={addr.id} className={`p-8 rounded-[2.5rem] bg-white border-2 transition-all relative ${addr.isDefault ? 'border-indigo-600 shadow-xl' : 'border-gray-50 hover:border-gray-100 hover:shadow-lg'}`}>
                                                {addr.isDefault && (
                                                    <div className="absolute top-4 right-6 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Primary</div>
                                                )}
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${addr.type === 'Home' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {addr.type === 'Home' ? <Truck className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 uppercase italic">{addr.name}</h4>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">{addr.type} Entry</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-xs font-medium text-gray-600 leading-relaxed max-w-[200px] italic">
                                                        {addr.street}, {addr.locality}, {addr.city} - {addr.zipCode}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-gray-400 pt-2">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold tracking-widest">{addr.mobile}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-gray-50 flex gap-4">
                                                    {!addr.isDefault && (
                                                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Set Active</button>
                                                    )}
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-black text-red-400 uppercase hover:text-red-600">Flush</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
