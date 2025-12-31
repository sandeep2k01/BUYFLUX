import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchProducts } from '../productSlice';
import ProductCard from '../components/ProductCard';
import SidebarFilter from '../components/SidebarFilter';
import { useParams } from 'react-router-dom';
import { setSort, setCategoryFromUrl } from '../productSlice';
import { ProductSkeleton } from '../../../components/ui/Skeleton';
import { Filter, Search } from 'lucide-react';

const ProductListingPage = () => {
    const dispatch = useAppDispatch();
    const { filteredItems, loading } = useAppSelector((state) => state.products);
    const { category } = useParams<{ category?: string }>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Sync URL category param with Redux filter
    useEffect(() => {
        if (category) {
            const formattedCat = category.charAt(0).toUpperCase() + category.slice(1);
            dispatch(setCategoryFromUrl(formattedCat));
        } else {
            dispatch(setCategoryFromUrl(null));
        }
    }, [category, dispatch]);


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative min-h-screen">
            {/* Breadcrumbs */}
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                Home <span className="opacity-30">/</span> Products {category && <><span className="opacity-30">/</span> <span className="text-indigo-600 uppercase">{category}</span></>}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar */}
                <div className="hidden md:block">
                    <SidebarFilter />
                </div>

                {/* Mobile Filter Drawer */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                        <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-slide-right">
                            <SidebarFilter onClose={() => setIsFilterOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Floating Filter Button for Mobile */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl active:scale-95 transition-transform border border-white/20"
                >
                    <Filter className="w-4 h-4" /> Filter
                </button>

                {/* Product Grid */}
                <div className="flex-1">
                    {/* Sorting Header */}
                    <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                                {category ? category : 'Collection'}
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {filteredItems.length} curated pieces
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Sort:</span>
                            <select
                                onChange={(e) => dispatch(setSort(e.target.value))}
                                className="text-xs font-black text-gray-900 border-none focus:ring-0 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl focus:outline-none uppercase tracking-widest"
                            >
                                <option value="recommended">Best Match</option>
                                <option value="low-high">Price: Low</option>
                                <option value="high-low">Price: High</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <ProductSkeleton key={n} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {filteredItems.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-32 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 mt-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-black uppercase tracking-widest text-sm mb-2">No Match Found</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Try adjusting your filters or search keywords.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListingPage;
