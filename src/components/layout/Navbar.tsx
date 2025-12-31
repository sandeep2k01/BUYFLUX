import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Package } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSearch } from '../../features/products/productSlice';
import { authService } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const cartItems = useAppSelector((state) => state.cart.items);
    const user = useAppSelector((state) => state.auth.user);
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

    const navCategories = [
        { name: 'Men', path: 'men' },
        { name: 'Women', path: 'women' },
        { name: 'Kids', path: 'kids' },
        { name: 'Beauty', path: 'beauty & skincare' },
        { name: 'Food & Grocery', path: 'food & grocery' }
    ];

    return (
        <nav className="bg-white sticky top-0 z-[100] border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Main Header Row as per reference image */}
                <div className="flex justify-between items-center h-16 md:h-24 gap-4">
                    {/* Mobile Menu Trigger (Left) */}
                    <div className="flex md:hidden items-center w-10">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="text-gray-950 p-1"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Logo & Category Links Group */}
                    <div className="flex items-center gap-6 lg:gap-8 flex-1 md:flex-initial justify-center md:justify-start">
                        <Link to="/" className="flex-shrink-0 group">
                            <img
                                src="/logomain.png"
                                alt="Buyflux"
                                className="h-14 md:h-20 w-auto group-hover:scale-105 transition-transform object-contain"
                            />
                        </Link>

                        {/* Desktop Categories */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-7">
                            {navCategories.map((cat) => (
                                <Link
                                    key={cat.name}
                                    to={`/products/${cat.path}`}
                                    className="text-[10px] lg:text-[11px] font-black text-gray-950 hover:text-indigo-600 uppercase tracking-[0.15em] transition-all whitespace-nowrap"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>

                        {/* Vertical Separator */}
                        <div className="hidden md:block w-px h-8 bg-gray-100 mx-2" />
                    </div>

                    {/* Integrated Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-[400px] relative group">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="SEARCH PREMIUM COUTURE..."
                                className="w-full bg-gray-50 border border-transparent rounded-lg py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-100 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                        </form>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-8">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex flex-col items-center group outline-none"
                                >
                                    <User className="h-4.5 w-4.5 text-gray-950 group-hover:text-indigo-600 transition-colors" />
                                    <span className="text-[9px] text-gray-950 font-black mt-1 uppercase tracking-widest leading-none">
                                        {user.displayName?.split(' ')[0] || 'Acc'}
                                    </span>
                                </button>
                                {userDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2.5 z-50 overflow-hidden border border-gray-100 backdrop-blur-xl">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Account</p>
                                                <p className="text-[11px] font-black text-indigo-600 truncate">{user.displayName || 'Guest User'}</p>
                                            </div>

                                            <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all uppercase tracking-wider">
                                                <User className="w-3.5 h-3.5" />
                                                Profile
                                            </Link>

                                            {user?.email === 'sandeepdamera596@gmail.com' && (
                                                <Link to="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition-all uppercase tracking-wider border-y border-indigo-100/30">
                                                    <Package className="w-3.5 h-3.5" />
                                                    Admin Dashboard
                                                </Link>
                                            )}

                                            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-50 transition-all uppercase tracking-wider mt-1">
                                                <X className="w-3.5 h-3.5" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex flex-col items-center group">
                                <User className="h-4.5 w-4.5 text-gray-950 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[9px] text-gray-950 font-black mt-1 uppercase tracking-widest leading-none">Login</span>
                            </button>
                        )}

                        <Link to="/wishlist" className="flex flex-col items-center relative group">
                            <Heart className="h-4.5 w-4.5 text-gray-950 group-hover:text-pink-600 transition-colors" />
                            <span className="text-[9px] text-gray-950 font-black mt-1 uppercase tracking-widest leading-none">Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[8px] min-w-[14px] h-3.5 flex items-center justify-center rounded-full font-black px-1">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <Link to="/cart" className="flex flex-col items-center relative group">
                            <ShoppingCart className="h-4.5 w-4.5 text-gray-950 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-[9px] text-gray-950 font-black mt-1 uppercase tracking-widest leading-none">Bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[8px] min-w-[14px] h-3.5 flex items-center justify-center rounded-full font-black px-1">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Actions (Wishlist + Cart) */}
                    <div className="flex md:hidden items-center justify-end gap-3 w-20">
                        <Link to="/wishlist" className="relative text-gray-950 p-1">
                            <Heart className="h-5.5 w-5.5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[8px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/cart" className="relative text-gray-950 p-1">
                            <ShoppingCart className="h-5.5 w-5.5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[8px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>


                {/* Mobile Search Row */}
                <div className="pb-3 md:hidden px-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="SEARCH FOR PRODUCTS..."
                            className="w-full bg-gray-50 border border-transparent rounded-xl py-2 pl-10 pr-4 text-[11px] font-black uppercase tracking-widest placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                    </form>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120]"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl flex flex-col"
                        >
                            <div className="bg-indigo-600 p-6 text-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm border border-white/20">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest whitespace-nowrap">Hello, {user?.displayName?.split(' ')[0] || 'Guest'}</p>
                                            <p className="text-xs font-black uppercase tracking-tight truncate w-32">Premium Member</p>
                                        </div>
                                    </div>
                                    <X className="h-5 w-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => setIsMenuOpen(false)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    <p className="text-lg font-black italic uppercase tracking-tighter">Buyflux</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4">
                                <div className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 font-inter">Synchronized Sections</div>
                                {navCategories.map((cat) => (
                                    <Link
                                        key={cat.name}
                                        to={`/products/${cat.path}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 px-6 py-3.5 text-[11px] font-black text-gray-950 active:bg-indigo-50 active:text-indigo-600 uppercase tracking-widest border-b border-gray-50 transition-colors font-inter"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}

                                <div className="mt-8 px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 font-inter">Account Settings</div>
                                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-3.5 text-[11px] font-black text-gray-700 uppercase tracking-widest border-b border-gray-50 font-inter">My Wishlist</Link>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-6 py-3.5 text-[11px] font-black text-gray-700 uppercase tracking-widest border-b border-gray-50 font-inter">Edit Profile</Link>

                                {user?.email === 'sandeepdamera596@gmail.com' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 px-6 py-3.5 text-[11px] font-black text-indigo-600 bg-indigo-50 uppercase tracking-widest border-b border-indigo-100 font-inter"
                                    >
                                        <Package className="w-4 h-4" />
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100">
                                {user ? (
                                    <button onClick={handleLogout} className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all font-inter">Logout</button>
                                ) : (
                                    <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all font-inter">Initialize Login</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
