import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSearch } from '../../features/products/productSlice';
import { authService } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const cartItems = useAppSelector((state) => state.cart.items);
    const user = useAppSelector((state) => state.auth.user);
    const allProducts = useAppSelector((state) => state.products.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const wishlistCount = wishlistItems.length;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setSearch(searchTerm));
        navigate('/products');
    };



    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    return (
        <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center mr-6 hover:opacity-100 transition-all active:scale-95 group">
                        <img
                            src="/logomain.png"
                            alt="Buyflux"
                            className="h-20 w-auto drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Men', 'Women', 'Kids', 'Beauty', 'Food & Grocery'].map((cat) => (
                            <Link
                                key={cat}
                                to={`/products/${cat.toLowerCase()}`}
                                className="text-gray-800 hover:text-indigo-600 font-black text-[13px] uppercase tracking-widest transition-colors relative group py-2"
                            >
                                {cat}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-gray-200 ml-2 hidden lg:block"></div>
                        {user?.email === 'sandeepdamera596@gmail.com' && (
                            <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 transition-all">
                                Admin <span className="text-[8px] bg-indigo-600 text-white px-1 rounded-sm">LIVE</span>
                            </Link>
                        )}
                    </div>

                    {/* Search Bar with Live Suggestions */}
                    <div className="hidden lg:flex items-center flex-1 max-w-md mx-10 relative group">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="SEARCH PREMIUM COUTURE..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                                <Search className="h-3.5 w-3.5" />
                            </button>
                        </form>

                        {/* Search Suggestions Dropdown */}
                        <AnimatePresence>
                            {isSearchFocused && searchTerm.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-50 py-3 z-[100] overflow-hidden"
                                >
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Suggestions</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {allProducts
                                            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .slice(0, 6)
                                            .map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        navigate(`/product/${product.id}`);
                                                        setSearchTerm('');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group/item"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                                                        <img src={product.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-900 group-hover/item:text-indigo-600 truncate transition-colors uppercase tracking-tight">{product.title}</p>
                                                        <p className="text-[9px] font-black text-indigo-500 mt-0.5">₹{product.price.toLocaleString()}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        {allProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                            <div className="px-5 py-8 text-center">
                                                <Search className="w-5 h-5 text-gray-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No matching couture</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-50 mt-1 bg-gray-50/30">
                                        <button
                                            onClick={handleSearch}
                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                        >
                                            View all results for "{searchTerm}"
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-7">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex flex-col items-center cursor-pointer hover:text-indigo-600 outline-none"
                                >
                                    <User className="h-5 w-5 text-gray-900 group-hover:text-indigo-600 transition-colors" />
                                    <span className="text-[9px] text-gray-400 font-black mt-1 uppercase tracking-widest leading-none">Hello, {user.displayName?.split(' ')[0] || 'User'}</span>
                                </button>
                                {userDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-indigo-100 py-2 ring-1 ring-black ring-opacity-5 transition-all transform origin-top-right z-50 overflow-hidden border border-gray-100">
                                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.displayName}</p>
                                                    {user.emailVerified ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                    ) : (
                                                        <span className="text-[7px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Unverified</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="block px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors uppercase tracking-widest">Track Orders</Link>
                                                <Link to="/wishlist" onClick={() => setUserDropdownOpen(false)} className="block px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors uppercase tracking-widest">My Wishlist</Link>
                                                <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="block px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors uppercase tracking-widest">Profile Settings</Link>
                                                <div className="border-t border-gray-50 my-1"></div>
                                                <button onClick={() => { setUserDropdownOpen(false); handleLogout(); }} className="block w-full text-left px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest">Logout Session</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => navigate('/login')}
                                className="flex flex-col items-center cursor-pointer hover:text-indigo-600 group"
                            >
                                <User className="h-5 w-5 text-gray-900 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">Login</span>
                            </div>
                        )}

                        <Link to="/wishlist" className="flex flex-col items-center cursor-pointer hover:text-pink-600 group relative">
                            <div className="relative">
                                <Heart className="h-5 w-5 text-gray-900 group-hover:text-pink-600 transition-colors" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">
                                        {wishlistCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">Wishlist</span>
                        </Link>
                        <Link to="/cart" className="flex flex-col items-center cursor-pointer hover:text-indigo-600 group relative">
                            <div className="relative">
                                <ShoppingCart className="h-5 w-5 text-gray-900 group-hover:text-indigo-600 transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">Bag</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-indigo-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar (Flipkart Style) */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[60]">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl flex flex-col animate-slide-right">
                        {/* Header (Flipkart Style) */}
                        <div className="bg-indigo-600 p-4 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 overflow-hidden">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-black tracking-tight leading-none">Hello, {user?.displayName?.split(' ')[0] || 'Guest'}</p>
                                    <p className="text-[10px] opacity-70 mt-1 font-bold uppercase tracking-widest">{user ? 'Premium Member' : 'Welcome to Shop'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto py-2">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shop Categories</h3>
                            </div>
                            <Link to="/products/men" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5 opacity-50" /> Men's Fashion
                            </Link>
                            <Link to="/products/women" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5 opacity-50" /> Women's Fashion
                            </Link>
                            <Link to="/products/kids" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5 opacity-50" /> Kids Collection
                            </Link>
                            <Link to="/products/beauty" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5 opacity-50" /> Beauty & Health
                            </Link>
                            <Link to="/products/food & grocery" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5 opacity-50" /> Food & Grocery
                            </Link>

                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 mt-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Details</h3>
                            </div>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <User className="w-5 h-5 opacity-50" /> My Account
                            </Link>
                            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <Heart className="w-5 h-5 opacity-50" /> My Wishlist
                            </Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 transition-colors">
                                <ShoppingCart className="w-5 h-5 opacity-50" /> My Bag
                            </Link>

                            {/* Admin Link for Sandeep */}
                            {user?.email === 'sandeepdamera596@gmail.com' && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-black text-indigo-600 bg-indigo-50/50 transition-colors">
                                    <TrendingUp className="w-5 h-5" /> Admin Dashboard
                                </Link>
                            )}

                            <div className="border-t border-gray-100 my-4"></div>
                            {!user ? (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-sm font-black text-indigo-600 uppercase tracking-widest">
                                    Login Session
                                </Link>
                            ) : (
                                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="flex items-center gap-4 px-6 py-4 text-sm font-black text-red-500 uppercase tracking-widest text-left w-full">
                                    Logout Exit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
