import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    ShoppingBag,
    Heart,
    MapPin,
    User as UserIcon,
    LogOut,
    Settings,
    Camera,
    Calendar,
    Phone,
    Map,
    Plus,
    Trash2,
    Edit2,
    CheckCircle
} from 'lucide-react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, UserProfile, Address } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProfilePage = () => {
    const user = useAppSelector((state: any) => state.auth.user);
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
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile;
                setProfileData(data);
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
        });
        return () => { unsubProfile(); unsubOrders(); };
    }, [user?.uid]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, photoURL: base64String }));
                if (user?.uid) {
                    await authService.updateProfileDetails(user.uid, { photoURL: base64String });
                    toast.success("Profile photo updated");
                }
            };
            reader.readAsDataURL(file);
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
            toast.success('Profile updated');
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
            toast.success('Address added');
        } catch (error) {
            toast.error('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user?.uid || !profileData?.addresses) return;
        try {
            const updatedAddresses = profileData.addresses.filter(a => a.id !== addressId);
            await authService.updateAddresses(user.uid, updatedAddresses);
            toast.success('Address removed');
        } catch (error) {
            toast.error('Failed to remove address');
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
            toast.success('Default address updated');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Minimal Sidebar */}
                    <aside className="w-full lg:w-56 space-y-8">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Account</h1>
                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        </div>

                        <nav className="flex flex-col space-y-1">
                            {[
                                { id: 'overview', label: 'Overview', icon: UserIcon },
                                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                                { id: 'profile', label: 'Profile Settings', icon: Settings },
                                { id: 'addresses', label: 'Addresses', icon: MapPin },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                            <button onClick={() => navigate('/wishlist')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                                <Heart className="w-4 h-4" /> Wishlist
                            </button>
                            <button onClick={() => authService.logout().then(() => navigate('/'))} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg mt-4">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                                {formData.photoURL ? (
                                                    <img src={formData.photoURL} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
                                                        {formData.fullName?.[0] || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-1 -right-1 p-2 bg-white text-indigo-600 rounded-full shadow-md border border-gray-100 hover:scale-110 transition-transform"
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{formData.fullName || 'User'}</h2>
                                            <p className="text-sm text-gray-500">Premium Member Since 2024</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Orders</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-2xl font-bold text-gray-900">{profileData?.addresses?.length || 0}</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Saved Addresses</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-2xl font-bold text-gray-900">Elite</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status Tier</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-bold">Account Information</h3>
                                        <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-indigo-600 hover:underline">
                                            {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { label: 'Full Name', name: 'fullName', type: 'text', icon: UserIcon },
                                            { label: 'Mobile', name: 'mobile', type: 'text', icon: Phone },
                                            { label: 'Date of Birth', name: 'dob', type: 'text', placeholder: 'DD/MM/YYYY', icon: Calendar },
                                            { label: 'Location', name: 'location', type: 'text', icon: Map },
                                        ].map(field => (
                                            <div key={field.name}>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{field.label}</label>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                        <input
                                                            name={field.name}
                                                            value={formData[field.name as keyof typeof formData]}
                                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-indigo-600 outline-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-medium text-gray-700 py-2 border-b border-gray-50">{formData[field.name as keyof typeof formData] || 'Not provided'}</p>
                                                )}
                                            </div>
                                        ))}

                                        {isEditing && (
                                            <Button onClick={handleSaveProfile} loading={loading} className="w-full md:w-auto px-10 mt-4 rounded-lg">Save Changes</Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 italic">Order Heritage</h3>
                                        <button onClick={() => setActiveTab('overview')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Return to Gallery</button>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="py-20 flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Retrieving your collection...</p>
                                        </div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                                                <ShoppingBag className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Your bag is empty of history</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Start your journey into luxury today.</p>
                                            <Button onClick={() => navigate('/products')} className="mt-8 px-10 py-3 rounded-xl">Shop the Collection</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {userOrders.map(order => (
                                                <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all group overflow-hidden relative">
                                                    {/* Background Pattern */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-bl-[5rem] -z-0 transition-transform group-hover:scale-110"></div>

                                                    <div className="relative z-10">
                                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-6 border-b border-gray-50">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200">
                                                                    <ShoppingBag className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Reference #{order.id.slice(-8).toUpperCase()}</p>
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                                                                            }`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Acquired on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-gray-900 tracking-tight">₹{order.totalAmount.toLocaleString()}</p>
                                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{order.items.length} Curated Items</p>
                                                            </div>
                                                        </div>

                                                        {/* Tracking Timeline */}
                                                        <div className="mb-10 px-4">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Logistics Timeline</p>
                                                            <div className="relative flex justify-between">
                                                                {/* Progress Bar Line */}
                                                                <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-100 -z-10">
                                                                    <div
                                                                        className="h-full bg-indigo-600 transition-all duration-1000"
                                                                        style={{
                                                                            width:
                                                                                order.status === 'delivered' ? '100%' :
                                                                                    order.status === 'shipped' ? '66%' :
                                                                                        order.status === 'processing' ? '33%' : '5%'
                                                                        }}
                                                                    ></div>
                                                                </div>

                                                                {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step) => {
                                                                    const isActive =
                                                                        (step === 'Placed') ||
                                                                        (step === 'Processing' && ['processing', 'shipped', 'delivered'].includes(order.status)) ||
                                                                        (step === 'Shipped' && ['shipped', 'delivered'].includes(order.status)) ||
                                                                        (step === 'Delivered' && order.status === 'delivered');

                                                                    return (
                                                                        <div key={step} className="flex flex-col items-center">
                                                                            <div className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${isActive ? 'bg-indigo-600 border-indigo-100 scale-125' : 'bg-white border-gray-100'}`}></div>
                                                                            <span className={`mt-3 text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-300'}`}>{step}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-50/50">
                                                            <div className="flex -space-x-4 overflow-hidden py-1">
                                                                {order.items.slice(0, 4).map((item, i) => (
                                                                    <div key={i} className="relative group/img">
                                                                        <img src={item.image} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-white object-cover bg-gray-50 shadow-sm transition-transform group-hover/img:scale-110" />
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 4 && (
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 ring-4 ring-white text-[10px] font-black text-gray-400">+{order.items.length - 4}</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-[200px]">
                                                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic uppercase truncate">
                                                                    Delivering to: <span className="text-gray-900 not-italic">{order.shippingAddress.name}, {order.shippingAddress.city}</span>
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-3 ml-auto">
                                                                <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-100 active:scale-95 leading-none">View Details</button>
                                                                <button className="px-6 py-2.5 bg-white border border-gray-100 text-gray-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 leading-none">Download Invoice</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold">Saved Addresses</h3>
                                        <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:scale-105 transition-transform">
                                            <Plus className="w-4 h-4" /> Add Address
                                        </button>
                                    </div>

                                    {showAddressForm && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 overflow-hidden">
                                            <form onSubmit={handleAddressSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Recipient Name</label>
                                                        <input placeholder="Enter name" required value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                                                        <input placeholder="10-digit mobile" required value={addressForm.mobile} onChange={e => setAddressForm({ ...addressForm, mobile: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pincode</label>
                                                        <input placeholder="6-digit code" required value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                                                        <input placeholder="City/Town" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all" />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Address</label>
                                                        <textarea placeholder="House No, Building, Street, Area" required value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 transition-all min-h-[100px]" />
                                                    </div>
                                                    <div className="md:col-span-2 flex items-center justify-between bg-white p-4 py-3 rounded-xl border border-gray-200">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="default-addr"
                                                                checked={addressForm.isDefault}
                                                                onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                            <label htmlFor="default-addr" className="text-xs font-bold text-gray-700 cursor-pointer">Set as default address</label>
                                                        </div>
                                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAddressForm({ ...addressForm, type: 'Home' })}
                                                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${addressForm.type === 'Home' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                            >Home</button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAddressForm({ ...addressForm, type: 'Work' })}
                                                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${addressForm.type === 'Work' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                            >Work</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <Button type="submit" loading={loading} className="px-12 py-3.5 rounded-xl shadow-xl shadow-indigo-100">Save Address</Button>
                                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-8 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                        {profileData?.addresses?.map(addr => (
                                            <div key={addr.id} className={`group p-8 rounded-[2rem] border-2 transition-all relative ${addr.isDefault ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-50 hover:border-indigo-100 hover:bg-gray-50/30'}`}>
                                                {addr.isDefault && (
                                                    <div className="absolute top-4 right-8 flex items-center gap-1.5 py-1 px-3 bg-indigo-600 rounded-full">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Default</span>
                                                    </div>
                                                )}

                                                <div className="mb-6 flex items-center justify-between">
                                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${addr.type === 'Home' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {addr.type}
                                                    </span>
                                                </div>

                                                <h4 className="text-base font-black text-gray-900 mb-2 truncate">{addr.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">
                                                    {addr.street}, {addr.locality && `${addr.locality}, `}{addr.city}, {addr.state} - {addr.zipCode}
                                                </p>

                                                <div className="flex items-center gap-2 mb-8">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-900">{addr.mobile}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100/50">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                                            className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest transition-all"
                                                        >Set as Default</button>
                                                    )}
                                                    <div className="flex items-center gap-4 ml-auto">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors group-hover:bg-white rounded-lg shadow-sm">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors group-hover:bg-white rounded-lg shadow-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!profileData?.addresses || profileData.addresses.length === 0) && !showAddressForm && (
                                            <div className="md:col-span-2 py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                                    <MapPin className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Saved Addresses</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Add your shipping details for faster checkout.</p>
                                                <Button onClick={() => setShowAddressForm(true)} className="mt-8 px-10 py-3 rounded-xl border-none">Add My First Address</Button>
                                            </div>
                                        )}
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
