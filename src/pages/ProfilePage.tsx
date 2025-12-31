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
    Settings,
    Camera,
    Calendar,
    Phone,
    Map,
    Plus,
    Trash2,
    Edit2,
    CheckCircle,
    Package,
    Zap,
    Truck
} from 'lucide-react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order, UserProfile, Address } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ProfilePage = () => {
    const user = useAppSelector((state: any) => state.auth.user);
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

        // Safety timeout to prevent infinite loading if Firebase doesn't respond
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, photoURL: base64String }));
                if (user?.uid) {
                    await authService.updateProfileDetails(user.uid, { photoURL: base64String });
                    toast.success("Visual ID Synchronized");
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
                    {/* Desktop Sidebar (Hidden on Mobile) */}
                    <aside className="hidden lg:block w-56 space-y-8">
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
                            {user.email === 'sandeepdamera596@gmail.com' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                >
                                    <Package className="w-4 h-4" /> Admin Dashboard
                                </button>
                            )}
                            <button onClick={() => authService.logout().then(() => navigate('/'))} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg mt-4">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </nav>
                    </aside>

                    {/* Mobile Navigation Tabs (Horizontal Scroll) */}
                    <div className="lg:hidden sticky top-[64px] z-40 bg-white/80 backdrop-blur-md -mx-6 px-6 border-b border-gray-100 mb-8 pt-2">
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4">
                            {[
                                { id: 'overview', label: 'Overview', icon: UserIcon },
                                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                                { id: 'profile', label: 'Settings', icon: Settings },
                                { id: 'addresses', label: 'Addresses', icon: MapPin },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`flex items-center gap-2 whitespace-nowrap px-1 py-1 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'
                                        }`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                    {activeTab === item.id && (
                                        <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-600" />
                                    )}
                                </button>
                            ))}
                            {user.email === 'sandeepdamera596@gmail.com' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-2 whitespace-nowrap px-1 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-500"
                                >
                                    <Package className="w-3.5 h-3.5" />
                                    Admin
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-16"
                                >
                                    {/* Member Hero Card */}
                                    <div className="relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] bg-gray-950 text-white shadow-2xl shadow-indigo-200">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

                                        <div className="relative flex flex-col md:flex-row items-center gap-10">
                                            <div className="relative">
                                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] overflow-hidden bg-white/10 p-1.5 backdrop-blur-3xl ring-1 ring-white/20">
                                                    {formData.photoURL ? (
                                                        <img src={formData.photoURL} alt="User" className="w-full h-full object-cover rounded-[2rem]" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/20 bg-white/5 rounded-[2rem]">
                                                            {formData.fullName?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest border-2 border-gray-950">
                                                    Elite Tier
                                                </div>
                                            </div>
                                            <div className="text-center md:text-left space-y-4">
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{formData.fullName || 'Authorized User'}</h2>
                                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">{user.email}</p>
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
                                                        Member Since 2026
                                                    </div>
                                                    <div className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-600/20 text-[9px] font-black uppercase tracking-widest">
                                                        Authorized Access
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                        {[
                                            { label: 'Total Acquisitions', value: userOrders.length, icon: ShoppingBag, color: 'indigo' },
                                            { label: 'Verified Locations', value: profileData?.addresses?.length || 0, icon: MapPin, color: 'purple' },
                                            { label: 'Loyalty Points', value: '2,450', icon: Zap, color: 'orange' },
                                        ].map((stat, i) => (
                                            <div key={i} className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500">
                                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                                <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Welcome Message Card */}
                                    <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100/50">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">System Integrity Verified</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                                                    Welcome to your Command Center. Your authorized browsing history and acquisitions are perfectly synchronized for a seamless experience across all your digital devices.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="max-w-3xl mx-auto"
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                                                Profile <span className="text-indigo-600">Settings</span>
                                            </h2>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Personal Identity & Security</p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-500 shadow-xl ${isEditing
                                                ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-red-100'
                                                : 'bg-indigo-600 text-white hover:bg-gray-900'
                                                }`}
                                        >
                                            {isEditing ? (
                                                <>Cancel Editing</>
                                            ) : (
                                                <>
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Modify Identity
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="space-y-12 pb-20">
                                        {/* Profile Picture Card */}
                                        <div className="relative overflow-hidden p-8 md:p-12 rounded-[3rem] bg-gray-50 border border-gray-100 group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-110" />

                                            <div className="relative flex flex-col md:flex-row items-center gap-10">
                                                <div className="relative">
                                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-white p-2 shadow-2xl shadow-indigo-100 ring-1 ring-gray-100">
                                                        {formData.photoURL ? (
                                                            <img src={formData.photoURL} alt="User" className="w-full h-full object-cover rounded-[2rem]" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-indigo-100 bg-gray-50 rounded-[2rem]">
                                                                {formData.fullName?.[0] || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isEditing && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white"
                                                        >
                                                            <Camera className="w-5 h-5" />
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className="flex-1 text-center md:text-left space-y-6">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">Visual Identification</h4>
                                                        <p className="text-sm text-gray-400 font-medium">This image will be synced across your orders and reviews.</p>
                                                    </div>

                                                    {isEditing && (
                                                        <>
                                                            <button
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:border-indigo-600 hover:shadow-lg transition-all active:scale-95"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Select Media from Library
                                                            </button>
                                                            <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-4">
                                            {[
                                                { label: 'Display Name', name: 'fullName', type: 'text', icon: UserIcon, placeholder: 'Elite Member Name' },
                                                { label: 'Primary Contact', name: 'mobile', type: 'text', icon: Phone, placeholder: 'System Mobile' },
                                                { label: 'Date of Birth', name: 'dob', type: 'text', placeholder: 'DD/MM/YYYY', icon: Calendar },
                                                { label: 'Current Residence', name: 'location', type: 'text', icon: Map, placeholder: 'HQ Location' },
                                                { label: 'Alternate Contact', name: 'alternateMobile', type: 'text', icon: Phone, placeholder: 'Secondary System' },
                                                { label: 'Account Hint', name: 'hintName', type: 'text', icon: Edit2, placeholder: 'Profile Nickname' },
                                            ].map(field => (
                                                <div key={field.name} className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{field.label}</label>
                                                    {isEditing ? (
                                                        <div className="relative group/field">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-indigo-600 transition-colors">
                                                                <field.icon className="w-4.5 h-4.5" />
                                                            </div>
                                                            <input
                                                                name={field.name}
                                                                value={formData[field.name as keyof typeof formData]}
                                                                onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                                placeholder={field.placeholder}
                                                                className="w-full bg-white border-2 border-gray-50 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-gray-900 focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="px-7 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-black text-gray-900 italic shadow-sm flex items-center gap-4">
                                                            <field.icon className="w-4 h-4 text-indigo-500" />
                                                            {formData[field.name as keyof typeof formData] || <span className="text-gray-200">System Empty</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Bar */}
                                        <AnimatePresence>
                                            {isEditing && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100"
                                                >
                                                    <Button
                                                        onClick={handleSaveProfile}
                                                        loading={loading}
                                                        className="flex-1 py-5 rounded-2xl shadow-2xl shadow-indigo-100 font-black uppercase text-[11px] tracking-[0.2em]"
                                                    >
                                                        Finalize Changes
                                                    </Button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="px-10 py-5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                                    >
                                                        Discard
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-12"
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-100">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                                                Order <span className="text-indigo-600">Heritage</span>
                                            </h2>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Historical manifest of all unit acquisitions</p>
                                        </div>
                                        <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Real-time Feed Active</span>
                                        </div>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="space-y-8">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-64 bg-gray-50 rounded-[3rem] animate-pulse" />
                                            ))}
                                        </div>
                                    ) : userOrders.length > 0 ? (
                                        <div className="grid gap-10">
                                            {userOrders.map((order) => (
                                                <div key={order.id} className="group overflow-hidden bg-white border border-gray-100 rounded-[3.5rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500">
                                                    {/* Order Manifest Header */}
                                                    <div className="p-8 md:p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/30">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manifest ID</span>
                                                                <span className="text-sm font-black text-gray-900 tracking-tighter italic">#{order.id.slice(0, 12).toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border ${order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                order.status === 'processing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                                }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-indigo-500'}`} />
                                                                {order.status}
                                                            </div>
                                                            <div className="px-6 py-2 bg-gray-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg">
                                                                ₹{order.totalAmount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Item Sub-Manifest */}
                                                    <div className="p-8 md:p-10 space-y-8">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-0.5 w-6 bg-indigo-600 rounded-full" />
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Unit Breakdown</p>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-5 p-4 rounded-3xl bg-gray-50/50 border border-gray-50 hover:bg-white hover:border-indigo-50 transition-all">
                                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white p-1 border border-gray-100 shadow-sm flex-shrink-0">
                                                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                                                    </div>
                                                                    <div className="min-w-0 space-y-1">
                                                                        <h4 className="text-xs font-black text-gray-900 line-clamp-1 italic uppercase tracking-tight">{item.title}</h4>
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="text-[10px] font-bold text-indigo-600 tracking-tighter">Qty: {item.quantity}</span>
                                                                            <span className="text-[10px] font-black text-gray-400">×</span>
                                                                            <span className="text-xs font-black text-gray-950 tracking-tighter">₹{item.price.toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Order Footer - Track Link */}
                                                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                                                            <div className="flex items-center gap-4 text-gray-400">
                                                                <Truck className="w-4 h-4" />
                                                                <p className="text-[10px] font-bold uppercase tracking-widest">Premium Logistical Sync Active</p>
                                                            </div>
                                                            <button className="flex items-center gap-3 px-10 py-4 bg-white border border-gray-200 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:bg-indigo-50/30 transition-all active:scale-95 shadow-sm">
                                                                Review Manifest
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 border border-gray-50">
                                                <ShoppingBag className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2 italic">Null Heritage Detected</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Unlock your first unit to begin your digital heritage.</p>
                                            <Button onClick={() => navigate('/products')} className="mt-10 px-12 py-4 rounded-2xl shadow-2xl shadow-indigo-100">Browse Terminal</Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-12"
                                >
                                    {/* Address Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-100">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                                                Verified <span className="text-indigo-600">Locations</span>
                                            </h2>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Managing {profileData?.addresses?.length || 0} delivery points</p>
                                        </div>
                                        {!showAddressForm && (
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-900 transition-all duration-500 shadow-xl shadow-indigo-100 active:scale-95"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Register New Location
                                            </button>
                                        )}
                                    </div>

                                    {showAddressForm && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="bg-gray-950 p-10 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />

                                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-10 relative z-10">Location <span className="text-indigo-400">Registry</span></h3>

                                            <form onSubmit={handleAddressSubmit} className="space-y-8 relative z-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Recipient Legal Name</label>
                                                        <input required value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-400 text-sm font-medium transition-all" placeholder="Authorized receiver" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Contact Link</label>
                                                        <input required value={addressForm.mobile} onChange={e => setAddressForm({ ...addressForm, mobile: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-400 text-sm font-medium transition-all" placeholder="Primary mobile" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Geographic Pincode</label>
                                                        <input required value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-400 text-sm font-medium transition-all" placeholder="6-digit zone" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">City/Territory</label>
                                                        <input required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-400 text-sm font-medium transition-all" placeholder="Current city" />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Full Terrain Details</label>
                                                        <textarea required value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-400 text-sm font-medium transition-all min-h-[120px]" placeholder="Street name, landmark, gate info" />
                                                    </div>
                                                    <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox" id="default-addr" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-5 h-5 rounded-md border-white/20 bg-transparent text-indigo-400 focus:ring-indigo-400 cursor-pointer" />
                                                            <label htmlFor="default-addr" className="text-xs font-black uppercase tracking-widest text-gray-300 cursor-pointer">Set as Primary Location</label>
                                                        </div>
                                                        <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10">
                                                            {['Home', 'Work'].map(type => (
                                                                <button key={type} type="button" onClick={() => setAddressForm({ ...addressForm, type: type as any })} className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${addressForm.type === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{type}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 pt-6">
                                                    <Button type="submit" loading={loading} className="px-12 py-5 rounded-2xl bg-indigo-600 hover:bg-white hover:text-indigo-600 transition-all shadow-2xl shadow-indigo-400/20 font-black uppercase text-[11px] tracking-widest">Authorize Save</Button>
                                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-8 text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all">Cancel</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {profileData?.addresses?.map(addr => (
                                            <div key={addr.id} className={`group p-10 rounded-[3rem] border-2 transition-all relative overflow-hidden ${addr.isDefault ? 'border-indigo-600 bg-indigo-50/10' : 'border-gray-50 hover:border-indigo-100 bg-white'}`}>
                                                {addr.isDefault && (
                                                    <div className="absolute top-0 right-0 py-2 px-6 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-3xl">PRIMARY</div>
                                                )}

                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${addr.type === 'Home' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {addr.type === 'Home' ? <MapPin className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${addr.type === 'Home' ? 'text-orange-500' : 'text-blue-500'}`}>{addr.type}</span>
                                                </div>

                                                <h4 className="text-xl font-black text-gray-900 mb-2 truncate italic uppercase">{addr.name}</h4>
                                                <div className="space-y-1 mb-10">
                                                    <p className="text-sm text-gray-500 font-bold leading-relaxed line-clamp-2">{addr.street}</p>
                                                    <p className="text-sm text-gray-900 font-black uppercase italic tracking-tight">{addr.city}, {addr.zipCode}</p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100 group-hover:border-indigo-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><Phone className="w-3.5 h-3.5" /></div>
                                                        <span className="text-xs font-black tracking-tighter text-gray-900 italic">{addr.mobile}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {!addr.isDefault && (
                                                            <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-3">Make Default</button>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteAddress(addr.id)} className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!profileData?.addresses || profileData.addresses.length === 0) && !showAddressForm && (
                                            <div className="md:col-span-2 py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                                                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 border border-gray-50">
                                                    <MapPin className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2 italic">No Registry Found</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Add your authorized shipping terrain to continue.</p>
                                                <Button onClick={() => setShowAddressForm(true)} className="mt-10 px-12 py-4 rounded-2xl shadow-2xl shadow-indigo-100">Init New Location</Button>
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
