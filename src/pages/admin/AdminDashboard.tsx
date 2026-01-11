import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Package, TrendingUp, ShoppingBag, Edit3, Trash2, AlertCircle, Loader2, Octagon } from 'lucide-react';
import { collection, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setFirebaseProducts } from '../../features/products/productSlice';
import { Product } from '../../types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
const AdminDashboard = () => {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // RESTRICT ACCESS TO BUILDER ONLY - No redirection, just UI block
    const isAdmin = user?.email === 'sandeepdamera596@gmail.com';

    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        revenue: 0,
        lowStock: 0,
        loading: true
    });
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

    const categories = ['All', 'Men', 'Women', 'Kids', 'Beauty & Skincare', 'Food & Grocery', 'Gadgets', 'Anime'];

    useEffect(() => {
        if (!user || user.email !== 'sandeepdamera596@gmail.com') return;

        // Real-time listener for Product collection
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const products: Product[] = [];
            let lowCount = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data() as Product;
                products.push({ ...data, id: doc.id });
                if ((data.stock ?? 20) < 10) lowCount++;
            });
            setAllProducts(products);
            setStats(prev => ({ ...prev, products: snapshot.size, lowStock: lowCount }));
            dispatch(setFirebaseProducts(products));
        });

        // Real-time listener for Orders
        const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            let totalRevenue = 0;
            const orders: any[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                orders.push({ ...data, id: doc.id });
                if (data.status === 'PAID' || data.status === 'SHIPPED' || data.status === 'DELIVERED') {
                    totalRevenue += data.totalAmount || 0;
                }
            });
            setAllOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setStats(prev => ({
                ...prev,
                orders: snapshot.size,
                revenue: totalRevenue,
                loading: false
            }));
        });

        // Real-time listener for Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setStats(prev => ({ ...prev, users: snapshot.size, loading: false }));
        });

        return () => {
            unsubProducts();
            unsubOrders();
            unsubUsers();
        };
    }, [dispatch, user]);

    if (!isAdmin) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 text-center"
                >
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Octagon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">Developer Portal Locked</h1>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        The BUYFLUX Registry and Catalog Control Systems are encrypted. Access is restricted to the primary builder account.
                    </p>

                    <div className="space-y-3">
                        <Link to="/" className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200">
                            Return to Storefront
                        </Link>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest pt-2">Unauthorized Attempt Logged</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleDeleteProduct = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            toast.success("Product deleted successfully");
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Failed to delete product");
        }
    };



    const statCards = [
        { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500' },
        { label: 'Low Stock Items', value: stats.lowStock, icon: AlertCircle, color: 'bg-red-500' },
        { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-green-500' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic leading-none">Admin <span className="text-indigo-600">Portal</span></h1>
                    <div className="flex items-center gap-4 mt-4">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Orders {allOrders.length > 0 && `(${allOrders.length})`}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/add-product')}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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

            {/* Content Section */}
            {activeTab === 'products' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Package className="w-6 h-6 text-indigo-600" /> MANAGE PRODUCTS
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 font-medium tracking-tight">Update your live inventory status</p>
                        </div>

                        <div className="w-full md:w-72 relative">
                            <input
                                type="text"
                                placeholder="Search by name or brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="px-6 md:px-8 pb-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-gray-100">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {(() => {
                            const filteredProducts = allProducts.filter(p =>
                                (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                                (selectedCategory === 'All' || p.category === selectedCategory)
                            );

                            if (filteredProducts.length === 0) {
                                return (
                                    <div className="py-20 text-center text-gray-400 font-bold uppercase italic tracking-widest bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                        {searchQuery ? `No matches for "${searchQuery}"` : "Empty Store. Seed products to begin."}
                                    </div>
                                );
                            }

                            // If a specific category is selected, show standard grid
                            if (selectedCategory !== 'All') {
                                return (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} navigate={navigate} handleDelete={handleDeleteProduct} />
                                        ))}
                                    </div>
                                );
                            }

                            // If 'All' is selected, group by category
                            const grouped = categories.filter(c => c !== 'All').map(cat => ({
                                name: cat,
                                products: filteredProducts.filter(p => p.category === cat)
                            })).filter(g => g.products.length > 0);

                            return (
                                <div className="space-y-12">
                                    {grouped.map(group => (
                                        <div key={group.name} className="mb-10 md:mb-14">
                                            <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-3 md:gap-4">
                                                <span className="w-1 md:w-1.5 h-4 md:h-5 bg-indigo-600 rounded-full" />
                                                <span className="text-gray-900 italic">{group.name}</span>
                                                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 via-gray-100 to-transparent" />
                                                <span className="text-[8px] md:text-[10px] text-gray-300 font-bold uppercase tracking-widest">{group.products.length} Units</span>
                                            </h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                                {group.products.map((product) => (
                                                    <ProductCard key={product.id} product={product} navigate={navigate} handleDelete={handleDeleteProduct} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Handle products with no category or unknown category */}
                                    {filteredProducts.filter(p => !categories.includes(p.category || '')).length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                                <span className="text-indigo-600">/</span> Other Items
                                                <div className="h-[1px] flex-1 bg-gray-100" />
                                            </h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                                {filteredProducts.filter(p => !categories.includes(p.category || '')).map((product) => (
                                                    <ProductCard key={product.id} product={product} navigate={navigate} handleDelete={handleDeleteProduct} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/10">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
                            <ShoppingBag className="w-6 h-6 text-indigo-600" /> RECENT ORDERS
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30 border-b border-gray-100">
                                    <th className="px-8 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Order Details</th>
                                    <th className="px-8 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Recipient</th>
                                    <th className="px-8 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black tracking-widest text-gray-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase italic tracking-widest">
                                            No orders synchronized yet.
                                        </td>
                                    </tr>
                                ) : (
                                    allOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-gray-900 tracking-tight uppercase">#{order.id.slice(-8).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium tracking-tight mt-1">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-900 uppercase tracking-tight italic">{order.shippingAddress?.name}</p>
                                                <p className="text-[10px] text-gray-400 tracking-tight mt-0.5">{order.userEmail}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900 italic tracking-tighter">₹{order.totalAmount}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{order.paymentMethod}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase italic shadow-sm ${order.status === 'PAID' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' :
                                                        order.status === 'DELIVERED' ? 'bg-indigo-100 text-indigo-600' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                                'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <select
                                                    className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
                                                    value={order.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            await setDoc(doc(db, 'orders', order.id), {
                                                                status: newStatus,
                                                                updatedAt: new Date().toISOString()
                                                            }, { merge: true });
                                                            toast.success("Manifest updated successfully!");
                                                        } catch (err) {
                                                            toast.error("Bridge failure: permission denied");
                                                        }
                                                    }}
                                                >
                                                    <option value="CREATED">Created (Pending)</option>
                                                    <option value="PAID">Paid</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


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

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
                    <h2 className="text-lg font-bold mb-4 italic tracking-tight uppercase font-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                        Registry Sync Portal
                    </h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-4">Bridge the identity gap: Force sync Firebase Auth users to Database</p>
                    <div className="flex gap-2">
                        <input
                            id="admin-sync-email"
                            placeholder="Enter user email..."
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all"
                        />
                        <button
                            onClick={async () => {
                                const email = (document.getElementById('admin-sync-email') as HTMLInputElement).value;
                                if (!email) return toast.error("Sync Error: Email required");
                                try {
                                    const normalizedEmail = email.toLowerCase().trim();
                                    const syncId = `synced_${btoa(normalizedEmail).slice(0, 10)}`;

                                    await setDoc(doc(db, 'users', syncId), {
                                        email: normalizedEmail,
                                        displayName: normalizedEmail.split('@')[0],
                                        createdAt: new Date().toISOString(),
                                        addresses: [],
                                        isSyncedProfile: true
                                    }, { merge: true });

                                    toast.success("Identity manifest broadcasted!");
                                    (document.getElementById('admin-sync-email') as HTMLInputElement).value = '';
                                } catch (e) {
                                    toast.error("Bridge failure: check permissions");
                                }
                            }}
                            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            Sync ID
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Extract ProductCard to its own sub-component for reuse in categorized lists
const ProductCard = ({ product, navigate, handleDelete }: { product: Product, navigate: any, handleDelete: any }) => (
    <div className="bg-gray-50/50 rounded-xl md:rounded-2xl border border-gray-100 p-2.5 md:p-4 hover:border-indigo-100 hover:bg-white transition-all group shadow-sm hover:shadow-md">
        <div className="aspect-square rounded-xl overflow-hidden bg-white border border-indigo-50/50 mb-4 relative">
            <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-black text-[10px] text-gray-300"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <button
                    onClick={(e) => { e.preventDefault(); navigate(`/admin/edit-product/${product.id}`); }}
                    className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-indigo-600 shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); handleDelete(product.id, product.title); }}
                    className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-red-600 shadow-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none md:justify-start md:gap-1.5">
                <span className="px-1.5 py-1 md:px-2 md:py-0.5 bg-indigo-600 text-white text-[6px] md:text-[8px] font-black uppercase tracking-[0.1em] md:tracking-widest rounded-md shadow-lg border border-white/10">
                    {product.category}
                </span>
                <span className={`px-1.5 py-1 md:px-2.5 md:py-1 text-white text-[6px] md:text-[9px] font-black uppercase tracking-[0.05em] md:tracking-widest rounded-md shadow-lg border border-white/5 ${(product.stock ?? 20) === 0 ? 'bg-red-600/90 animate-pulse' :
                    (product.stock ?? 20) < 10 ? 'bg-orange-500/90' :
                        'bg-gray-900/40 backdrop-blur-md'
                    }`}>
                    {(product.stock ?? 20) === 0 ? 'OUT OF STOCK' : `${product.stock ?? 20} UNITS LEFT`}
                </span>
            </div>
        </div>

        <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                    <p className="font-black text-gray-900 truncate uppercase tracking-tighter text-[10px] leading-none mb-1 opacity-40">{product.brand}</p>
                    <h3 className="font-black text-gray-900 text-xs uppercase tracking-tight truncate leading-tight group-hover:text-indigo-600 transition-colors">{product.title}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-950 text-sm tracking-tighter leading-none italic">₹{product.price}</p>
                    {product.discountPercentage && (
                        <p className="text-[8px] text-orange-500 font-extrabold uppercase mt-0.5">-{product.discountPercentage}%</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
