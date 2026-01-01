import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, TrendingUp, Users, ShoppingBag, Loader2, Database, Edit3, Trash2, Octagon, Search } from 'lucide-react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
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
    const [searchQuery, setSearchQuery] = useState('');
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
            console.error("Failed to delete product:", error);
            toast.error("Failed to delete product");
        }
    };

    const handleSeedPremiumCollection = async () => {
        const confirmSeed = window.confirm("This will overwrite your existing data and populate exactly 175 curated products (25 per category) with high-quality synced images. Proceed?");
        if (!confirmSeed) return;

        setIsSeeding(true);
        stopSeedingRef.current = false;
        toast.loading("Clearing and Seeding Store with Synced Images...", { id: 'seed' });

        try {
            const { writeBatch, collection, getDocs, doc } = await import('firebase/firestore');

            // Step 1: Clear everything first for a clean slate
            const snapshot = await getDocs(collection(db, 'products'));
            const clearBatch = writeBatch(db);
            snapshot.docs.forEach((d) => {
                clearBatch.delete(d.ref);
            });
            await clearBatch.commit();
            console.log("Deleted old products:", snapshot.size);

            const categoryData = [
                {
                    name: "Men",
                    items: [
                        { name: "Formal Tailored Suit", id: "1598961976249-459005e3f4e1", desc: "Expertly cut formal suit for professional excellence." },
                        { name: "Classic Street Sneakers", id: "1542291026-7eec264c27ff", desc: "Iconic comfort and style for daily urban wear." },
                        { name: "Luxury Chronograph Watch", id: "1523275335684-37898b6baf30", desc: "Precision engineering meets timeless aesthetic." },
                        { name: "Vintage Denim Jacket", id: "1551028719-00167b16eac5", desc: "Rugged durability with a classic heritage wash." },
                        { name: "Slim Leather Wallet", id: "1627123424574-724758594e93", desc: "Handcrafted top-grain leather minimalist essential." }
                    ]
                },
                {
                    name: "Women",
                    items: [
                        { name: "Silk Evening Gown", id: "1566174053879-31528523f8ae", desc: "Elegant silk drape for unforgettable evenings." },
                        { name: "Diamond Pendant Necklace", id: "1515562141521-736ceac5406c", desc: "Sophisticated brilliance for any occasion." },
                        { name: "Designer Leather Handbag", id: "1584917865442-de89df76afd3", desc: "Hand-stitched premium calfskin luxury bag." },
                        { name: "Stiletto High Heels", id: "1543163521-1bf539c55dd2", desc: "Graceful silhouette with superior comfort." },
                        { name: "Floral Eau de Parfum", id: "1541108564883-b51ccfde289a", desc: "A captivating blend of jasmine and rose." }
                    ]
                },
                {
                    name: "Kids",
                    items: [
                        { name: "STEM Robotics Kit", id: "1485827404703-89b55fcc595e", desc: "Interactive learning for future engineers." },
                        { name: "Giant Plush Teddy Bear", id: "1559454403-b8fb88521f11", desc: "Ultra-soft companion for cozy nights." },
                        { name: "Ultimate Brick Sets", id: "1587654780291-39c9404d746b", desc: "Infinite creativity with architectural blocks." },
                        { name: "Junior Active Sneakers", id: "1514989940723-e8e51635b782", desc: "Durable comfort for all-day play." },
                        { name: "Organic Cotton Baby Jumpsuit", id: "1522771935876-2497aa70caee", desc: "Softest fabric for delicate skin." }
                    ]
                },
                {
                    name: "Beauty & Skincare",
                    items: [
                        { name: "Vitamin C Radiance Serum", id: "1556228720-195a672e8a03", desc: "Brightening complex for a natural glow." },
                        { name: "Velvet Matte Lipstick", id: "1586790170083-2f9ceadc732d", desc: "Long-lasting color with hydrating silk." },
                        { name: "Hyaluronic Night Cream", id: "1556228570-419a7c27d530", desc: "Deep hydration for overnight recovery." },
                        { name: "Herbal Essence Shampoo", id: "1526947425960-9851927ef044", desc: "Natural botanicals for shiny, healthy hair." },
                        { name: "Professional Brush Set", id: "1522338242992-e1a54906a8da", desc: "Master-craft tools for flawless application." }
                    ]
                },
                {
                    name: "Food & Grocery",
                    items: [
                        { name: "Artisanal Dark Chocolate", id: "1575037614876-c38428c02b42", desc: "Single-origin cocoa for intense flavor." },
                        { name: "Raw Wildflower Honey", id: "1587049352846-4a222e789038", desc: "Unfiltered honey from pristine meadows." },
                        { name: "Tropical Fruit Basket", id: "1610832958506-ee5636637671", desc: "Fresh selection of sun-ripened exotic fruits." },
                        { name: "Gourmet Roasted Nuts", id: "1514733670139-4d87a19da1f2", desc: "Premium energy-packed dry fruit mix." },
                        { name: "Premium Arabica Coffee", id: "1495474472287-4d71bcdd2085", desc: "Freshly roasted beans for the perfect brew." }
                    ]
                },
                {
                    name: "Anime",
                    items: [
                        { name: "Limitless Sage Figure", id: "1612036782134-451bc0d14b32", desc: "Highly detailed collector's edition statue." },
                        { name: "Neon Street Anime Hoodie", id: "1551488831-00ddcb6c6bd3", desc: "Oversized fit with cybernetic graphic art." },
                        { name: "Collector's Manga Set", id: "1542314831-068cd1dbfeeb", desc: "First edition volumes with exclusive artwork." },
                        { name: "Cyberpunk Portrait Scroll", id: "1627435601361-ec25f5b1d0e5", desc: "Premium matte finish artistic wall scroll." },
                        { name: "Spirit Blade Decor", id: "1599508704512-2f19ff976223", desc: "Safe decorative replica for anime enthusiasts." }
                    ]
                },
                {
                    name: "Gadgets",
                    items: [
                        { name: "Titan Gaming Laptop", id: "1517336715181-e523f3144c12", desc: "Unmatched performance for elite gaming." },
                        { name: "Active Pro Smartwatch", id: "1507764923212-00362e481df4", desc: "The ultimate health and fitness companion." },
                        { name: "Elite Noise-Canceling Buds", id: "1505740420928-5e560c06d30e", desc: "Immersive sound with adaptive tech." },
                        { name: "Vanguard VR System", id: "1592477976562-f46d16cc5614", desc: "Step into ultra-realistic virtual worlds." },
                        { name: "Aero Stealth Drone", id: "1508614589041-895b9bc996ea", desc: "4K cinematic aerial photography master." }
                    ]
                }
            ];

            const brands = ["Aura Premium", "Luxe Gear", "Moda Elite", "Quantum X", "Peak Pro", "Pure Essence"];
            const seedBatch = writeBatch(db);

            for (const cat of categoryData) {
                for (let i = 1; i <= 25; i++) {
                    const itemTemplate = cat.items[i % cat.items.length];
                    const price = Math.floor(Math.random() * (25000 - 1500) + 1500);
                    const productRef = doc(collection(db, 'products'));

                    const p = {
                        title: `${itemTemplate.name} #${i}`,
                        brand: brands[i % brands.length],
                        price: price,
                        category: cat.name,
                        description: itemTemplate.desc,
                        image: `https://images.unsplash.com/photo-${itemTemplate.id}?auto=format&fit=crop&w=800&q=80`,
                        rating: {
                            rate: Number((Math.random() * (5 - 4.5) + 4.5).toFixed(1)),
                            count: Math.floor(Math.random() * 2000) + 500
                        },
                        discountPercentage: Math.floor(Math.random() * 25) + 10,
                        createdAt: new Date().toISOString()
                    };

                    seedBatch.set(productRef, p);
                }
            }

            await seedBatch.commit();
            toast.success("175 Products Synced with High-Res Images!", { id: 'seed' });
        } catch (error: any) {
            console.error("Seeding error:", error);
            toast.error(`Sync Failed: ${error.message}`, { id: 'seed' });
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

                    {/* Add Search Input */}
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

                <div className="p-6 md:p-8">
                    {allProducts.filter(p =>
                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase italic tracking-widest uppercase bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                            {searchQuery ? `No matches for "${searchQuery}"` : "Empty Store. Seed products to begin."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {allProducts
                                .filter(p =>
                                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((product) => (
                                    <div key={product.id} className="bg-gray-50/50 rounded-xl md:rounded-2xl border border-gray-100 p-2.5 md:p-4 hover:border-indigo-100 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                                        {/* Image Section */}
                                        <div className="aspect-square rounded-xl overflow-hidden bg-white border border-indigo-50/50 mb-4 relative">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); navigate(`/admin/edit-product/${product.id}`); }}
                                                    className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-indigo-600 shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleDeleteProduct(product.id, product.title); }}
                                                    className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-red-600 shadow-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2">
                                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Section */}
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

                                        {/* Footer Button - Always Visible on Small Screens */}
                                        <div className="mt-4 pt-3 border-t border-indigo-50/50 flex gap-2 md:hidden">
                                            <button
                                                onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                                                className="flex-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id, product.title)}
                                                className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
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
