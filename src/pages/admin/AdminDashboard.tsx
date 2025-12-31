import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, TrendingUp, Users, ShoppingBag, Loader2, Database, Edit3, Trash2, Octagon } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setFirebaseProducts } from '../../features/products/productSlice';
import { Product } from '../../types';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const stopSeedingRef = useRef(false);

    // RESTRICT ACCESS TO BUILDER ONLY
    useEffect(() => {
        if (!user || user.email !== 'sandeepdamera596@gmail.com') {
            toast.error("Security Alert: Unauthorized Access Attempt", {
                description: "This portal is reserved for the primary developer only."
            });
            navigate('/');
        }
    }, [user, navigate]);

    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        revenue: 0,
        loading: true
    });
    const [isSeeding, setIsSeeding] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!user || user.email !== 'sandeepdamera596@gmail.com') return;

        // Real-time listener for Product collection
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const products: Product[] = [];
            snapshot.docs.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() } as Product);
            });
            setAllProducts(products);
            setStats(prev => ({ ...prev, products: snapshot.size, loading: false }));
            dispatch(setFirebaseProducts(products));
        });

        // Real-time listener for Orders
        const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            let totalRevenue = 0;
            const orders: any[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalRevenue += data.totalAmount || 0;
                orders.push({ id: doc.id, ...data });
            });
            setRecentOrders(orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 10));
            setStats(prev => ({
                ...prev,
                orders: snapshot.size,
                revenue: totalRevenue,
                loading: false
            }));
        });

        // Real-time listener for Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const users: any[] = [];
            snapshot.docs.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            setAllUsers(users);
            setStats(prev => ({ ...prev, users: snapshot.size, loading: false }));
        });

        return () => {
            unsubProducts();
            unsubOrders();
            unsubUsers();
        };
    }, [dispatch, user]);

    if (!user || user.email !== 'sandeepdamera596@gmail.com') return null;

    const handleDeleteProduct = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleSeedPremiumCollection = async () => {
        setIsSeeding(true);
        stopSeedingRef.current = false;
        toast.loading("Populating Premium Store...", { id: 'seed' });
        try {
            const premiumProducts = [
                // Anime
                { title: "Naruto Sage Mode Figure", brand: "Bandai", price: 3499, category: "Anime", description: "Highly detailed Naruto action figure in Sage Mode.", image: "https://images.unsplash.com/photo-1611001716885-b3402558a62b?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 420 }, discountPercentage: 10 },
                { title: "Akatsuki Cloud Hoodie", brand: "Hidden Leaf", price: 2899, category: "Anime", description: "Premium cotton hoodie with Akatsuki embroidery.", image: "https://images.unsplash.com/photo-1618331812471-de3230bc5a4e?auto=format&fit=crop&w=800", rating: { rate: 4.8, count: 850 }, discountPercentage: 15 },
                { title: "Itachi Crow Graphic Tee", brand: "Grand Line", price: 1299, category: "Anime", description: "100% cotton tee with Itachi graphic.", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800", rating: { rate: 4.7, count: 320 }, discountPercentage: 5 },

                // Men
                { title: "Essential Oversized Tee", brand: "Modern Men", price: 1299, category: "Men", description: "Premium heavy cotton t-shirt with a relaxed fit.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800", rating: { rate: 4.8, count: 240 }, discountPercentage: 10 },
                { title: "Classic Indigo Denim", brand: "Denim Co", price: 3499, category: "Men", description: "Vintage wash denim jacket with copper hardware.", image: "https://images.unsplash.com/photo-1576874620030-9b6e828f7312?auto=format&fit=crop&w=800", rating: { rate: 4.6, count: 180 }, discountPercentage: 20 },
                { title: "Heritage Leather Backpack", brand: "Traveler", price: 6500, category: "Men", description: "Rugged water-resistant leather backpack for daily essentials.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800", rating: { rate: 4.7, count: 210 }, discountPercentage: 15 },

                // Women
                { title: "Silk Evening Gown", brand: "Vogue Aura", price: 8499, category: "Women", description: "Pure silk gown with elegant drape and finish.", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 110 }, discountPercentage: 15 },
                { title: "Starlight Diamond Pendant", brand: "Orra Luxe", price: 15999, category: "Women", description: "18k white gold pendant with a certified 0.5ct diamond.", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800", rating: { rate: 5.0, count: 42 }, discountPercentage: 10 },

                // Beauty
                { title: "Radiance Vitamin C Serum", brand: "GlowRx", price: 1899, category: "Beauty & Skincare", description: "Active Vitamin C for a bright, even skin tone.", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800", rating: { rate: 4.8, count: 1240 }, discountPercentage: 30 },
                { title: "Hydrating Night Cream", brand: "Pure Bliss", price: 3200, category: "Beauty & Skincare", description: "Overnight recovery cream with hyaluronic acid.", image: "https://images.unsplash.com/photo-1556228570-419a7c27d530?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 560 }, discountPercentage: 15 },

                // Food
                { title: "Exotic Fruit Basket", brand: "FarmFresh", price: 1499, category: "Food & Grocery", description: "Handpicked organic seasonal exotic fruits.", image: "https://images.unsplash.com/photo-1610832958506-ee5636637671?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 420 }, discountPercentage: 5 },
                { title: "Pure Wildflower Honey", brand: "Henry's", price: 594, category: "Food & Grocery", description: "100% pure raw wildflower honey. Unfiltered and rich in antioxidants.", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 135 }, discountPercentage: 14 },

                // Gadgets
                { title: "Titan Gen 4 Watch", brand: "NovaTech", price: 3499, category: "Gadgets", description: "Premium smartwatch with always-on AMOLED display.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800", rating: { rate: 4.6, count: 860 }, discountPercentage: 15 },

                // Kids
                { title: "STEM Robotics Kit", brand: "EduPlay", price: 3499, category: "Kids", description: "Build and code your own robots.", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800", rating: { rate: 4.9, count: 156 }, discountPercentage: 12 },
                { title: "Hyper-Drift RC Car", brand: "TurboX", price: 1800, category: "Kids", description: "1:16 scale rechargeable drift car with LED lights.", image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800", rating: { rate: 4.5, count: 240 }, discountPercentage: 25 },
                { title: "Soft Plush Bunny", brand: "SnuggleSafe", price: 999, category: "Kids", description: "The softest bunny friend for your little ones.", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800", rating: { rate: 5.0, count: 520 }, discountPercentage: 5 }
            ];


            for (const p of premiumProducts) {
                if (stopSeedingRef.current) {
                    toast.info("Seeding stopped by user", { id: 'seed' });
                    break;
                }
                await addDoc(collection(db, 'products'), p);
            }

            if (!stopSeedingRef.current) {
                toast.success("Premium Collection is now LIVE!", { id: 'seed' });
            }
        } catch (error) {
            toast.error("Failed to seed premium collection.", { id: 'seed' });
        } finally {
            setIsSeeding(false);
            stopSeedingRef.current = false;
        }
    };

    const statCards = [
        { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500' },
        { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-green-500' },
        { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-purple-500' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic leading-none">Admin <span className="text-indigo-600">Portal</span></h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Firestore Connection
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={isSeeding ? () => { stopSeedingRef.current = true; } : handleSeedPremiumCollection}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${isSeeding
                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 shadow-lg shadow-red-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 shadow-sm'
                            }`}
                    >
                        {isSeeding ? <Octagon className="w-4 h-4 animate-pulse" /> : <Database className="w-4 h-4" />}
                        {isSeeding ? 'Stop Seeding' : 'Populate Store'}
                    </button>
                    <Link
                        to="/admin/add-product"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-2.5 md:p-3 rounded-xl text-white`}>
                            <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
                            {stats.loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto md:mx-0" />
                            ) : (
                                <p className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Manage Products Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Package className="w-6 h-6 text-indigo-600" /> MANAGE PRODUCTS
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 font-medium tracking-tight">Update your live inventory status</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="hidden md:table w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-400 font-bold uppercase italic tracking-widest uppercase">
                                        Empty Store. Seed products to begin.
                                    </td>
                                </tr>
                            ) : (
                                allProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-black text-gray-900 truncate uppercase tracking-tight text-xs">{product.brand}</p>
                                                    <p className="text-[11px] text-gray-400 truncate font-bold">{product.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-black text-gray-900 tracking-tighter">₹{product.price}</p>
                                            {product.discountPercentage && <p className="text-[9px] text-orange-500 font-black">-{product.discountPercentage}% OFF</p>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => navigate(`/admin/edit-product/${product.id}`)} className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id, product.title)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="md:hidden divide-y divide-gray-100">
                        {allProducts.map((product) => (
                            <div key={product.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 truncate text-xs uppercase tracking-tight">{product.brand}</p>
                                        <p className="text-[10px] text-gray-400 truncate font-bold mb-1">{product.title}</p>
                                        <p className="font-black text-indigo-600 text-sm italic tracking-tighter">₹{product.price}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => navigate(`/admin/edit-product/${product.id}`)} className="p-2 rounded-lg bg-gray-50 text-gray-600">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id, product.title)} className="p-2 rounded-lg bg-red-50 text-red-600">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-indigo-600" /> RECENT ORDERS
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold">
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="p-4">
                                        <p className="text-xs font-black text-gray-900 uppercase">#{order.id.slice(-6)}</p>
                                        <p className="text-[10px] text-gray-400">{order.shippingAddress?.name}</p>
                                    </td>
                                    <td className="p-4 text-xs font-black">₹{order.totalAmount}</td>
                                    <td className="p-4 text-[9px]">
                                        <span className={`px-2 py-1 rounded-full uppercase tracking-widest font-black ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registered Users Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" /> REGISTERED USERS
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold">
                            {allUsers.map((u) => (
                                <tr key={u.uid || u.id}>
                                    <td className="p-4 flex items-center gap-3 font-black text-gray-900 uppercase text-xs tracking-tighter">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-[10px]">
                                            {u.displayName?.[0] || 'U'}
                                        </div>
                                        {u.displayName || 'Unnamed'}
                                    </td>
                                    <td className="p-4 text-xs font-black text-gray-400">{u.email}</td>
                                    <td className="p-4 text-[9px]">
                                        <span className={`px-2 py-1 rounded-full uppercase tracking-widest font-black ${u.emailVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {u.emailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 italic tracking-tight uppercase font-black">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/products" className="p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all text-center group">
                            <Package className="w-8 h-8 mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Catalog</span>
                        </Link>
                        <Link to="/admin/add-product" className="p-6 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all text-center group">
                            <Plus className="w-8 h-8 mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Add Item</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 italic tracking-tight uppercase font-black">Sync Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-green-700">Firebase Active</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">
                            Total users count (Auth vs Firestore): Please note that counts only reflect users who have logged in or saved profile details in the 'users' collection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
