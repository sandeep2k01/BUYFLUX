import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPriceRange, toggleBrand, clearFilters } from '../productSlice';
import { X } from 'lucide-react';

const SidebarFilter = ({ onClose }: { onClose?: () => void }) => {
    const dispatch = useAppDispatch();
    const { filters, items } = useAppSelector((state) => state.products);

    // Get unique "Brands" or "Types" based on the current active category
    const availableFilters = useMemo(() => {
        const categoryItems = filters.category
            ? items.filter(item => item.category?.toLowerCase() === filters.category?.toLowerCase())
            : items;

        const unique = Array.from(new Set(categoryItems.map(item => item.brand).filter(Boolean)));
        return unique.sort();
    }, [items, filters.category]);

    const filterLabel = useMemo(() => {
        const cat = filters.category?.toLowerCase() || '';
        if (cat === 'food & grocery') return 'Types';
        if (cat.includes('beauty')) return 'Categories';
        if (cat === 'anime') return 'Series & Gear';
        if (cat.includes('kids')) return 'Types';
        return 'Brands';
    }, [filters.category]);

    return (
        <div className="bg-white p-6 md:border md:border-gray-100 md:rounded-sm w-full md:w-64 flex-shrink-0 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    {onClose && <button onClick={onClose} className="md:hidden p-1 -ml-1"><X className="w-5 h-5 text-gray-500" /></button>}
                    <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Filters</h3>
                </div>
                <button
                    onClick={() => dispatch(clearFilters())}
                    className="text-[10px] text-pink-500 font-black hover:underline uppercase tracking-tighter"
                >
                    CLEAR ALL
                </button>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <h4 className="font-bold text-sm text-gray-900 mb-4">Price Range</h4>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="100000"
                        step="500"
                        value={filters.priceRange[1]}
                        onChange={(e) => dispatch(setPriceRange([0, parseInt(e.target.value)]))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>₹0</span>
                        <span>₹{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Brands/Types */}
            <div className="mb-8">
                <h4 className="font-bold text-sm text-gray-900 mb-4">{filterLabel}</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {availableFilters.length > 0 ? (
                        availableFilters.map((brand) => (
                            <label key={brand} className="flex items-center cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedBrands.includes(brand!)}
                                        onChange={() => dispatch(toggleBrand(brand!))}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-600"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="ml-3 text-sm text-gray-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight font-medium">
                                    {brand}
                                </span>
                            </label>
                        ))
                    ) : (
                        <p className="text-[10px] text-gray-400 font-bold uppercase py-2">No {filterLabel.toLowerCase()} available</p>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                    {filters.selectedBrands.map(b => (
                        <div key={b} className="bg-gray-100 text-gray-600 text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                            {b}
                            <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => dispatch(toggleBrand(b))} />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default SidebarFilter;
