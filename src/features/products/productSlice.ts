import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import Fuse from 'fuse.js';

// Categories for the app - Final unified list
const CATEGORIES = ['Men', 'Women', 'Kids', 'Beauty & Skincare', 'Food & Grocery', 'Gadgets', 'Anime', 'Home Appliances'];

interface ProductState {
    items: Product[];
    filteredItems: Product[];
    categories: string[];
    brands: [] | string[];
    loading: boolean;
    error: string | null;
    filters: {
        category: string | null;
        sort: string | null;
        search: string;
        priceRange: [number, number];
        selectedBrands: string[];
    };
}

const initialState: ProductState = {
    items: [],
    filteredItems: [],
    categories: CATEGORIES,
    brands: [],
    loading: false,
    error: null,
    filters: {
        category: null,
        sort: null,
        search: '',
        priceRange: [0, 1000000],
        selectedBrands: []
    }
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    try {
        // Fetch ONLY from Firebase to ensure 1:1 sync with Admin Dashboard
        const firebaseProducts = await productService.getProducts();
        return firebaseProducts;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
    }
});

const applyFilters = (items: Product[], filters: ProductState['filters']) => {
    let result = [...items];
    let queryCategory: string | null = null;
    let rawSearch = filters.search.toLowerCase().trim();

    // 1. Smart Category Detection
    if (rawSearch) {
        if (/\b(men|mens|man|gentle|boys)\b/i.test(rawSearch)) queryCategory = 'Men';
        else if (/\b(women|womens|woman|lady|ladies|girls)\b/i.test(rawSearch)) queryCategory = 'Women';
        else if (/\b(kid|kids|child|children|toy|toys|baby|babies)\b/i.test(rawSearch)) queryCategory = 'Kids';
        else if (/\b(beauty|skin|care|cosmetic|makeup|fragrance|perfume)\b/i.test(rawSearch)) queryCategory = 'Beauty & Skincare';
        else if (/\b(food|grocery|groceries|snack|drink|organic|fruit|chocolate)\b/i.test(rawSearch)) queryCategory = 'Food & Grocery';
        else if (/\b(gadget|tech|electronic|smart|mobile|phone|watch|audio)\b/i.test(rawSearch)) queryCategory = 'Gadgets';
        else if (/\b(anime|naruto|manga|itachi|sasuke)\b/i.test(rawSearch)) queryCategory = 'Anime';
        else if (/\b(home|appliance|kitchen|vacuum|fryer|bulb)\b/i.test(rawSearch)) queryCategory = 'Home Appliances';
    }

    const activeCategory = filters.category || queryCategory;

    // 1. Strict Category Filtering
    if (activeCategory && !rawSearch) {
        const cat = activeCategory.toLowerCase();
        result = result.filter(item => {
            const itemCat = item.category?.toLowerCase() || '';
            if (!itemCat) return false;

            // Specific protection for Men vs Women
            if (cat === 'men') {
                return (itemCat.includes('men') || itemCat === 'tops') && !itemCat.includes('women');
            }
            if (cat === 'women') {
                return itemCat.includes('women') || itemCat.includes('dress') || itemCat.includes('jewel') || itemCat.includes('bag');
            }

            // Broad category groups
            if (cat === 'beauty & skincare' || cat === 'beauty') {
                return itemCat.includes('beauty') || itemCat.includes('skin') || itemCat.includes('fragrance') || itemCat.includes('cosmetic') || itemCat === 'fragrances';
            }
            if (cat === 'food & grocery' || cat === 'food') {
                return itemCat.includes('food') || itemCat.includes('groc') || itemCat.includes('drink') || itemCat.includes('snack') || itemCat === 'groceries';
            }
            if (cat === 'kids') {
                return itemCat.includes('kids') || itemCat.includes('toy') || itemCat.includes('child') || itemCat.includes('baby');
            }
            if (cat === 'home appliances') {
                return itemCat.includes('home') || itemCat.includes('appliance') || itemCat.includes('kitchen') || itemCat.includes('furnit');
            }
            if (cat === 'gadgets') {
                return itemCat.includes('gadget') || itemCat.includes('phone') || itemCat.includes('laptop') || itemCat.includes('electronic');
            }

            // Default contains check with boundary awareness
            return itemCat === cat || itemCat.includes(cat);
        });
    }

    // 2. Advanced Fuzzy Search with Fuse.js (Handles typos, plurals, and case)
    if (rawSearch) {
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'category', weight: 0.3 },
                { name: 'brand', weight: 0.2 },
                { name: 'description', weight: 0.1 }
            ],
            threshold: 0.35, // Adjust for more/less strict fuzzy matching
            distance: 100,
            ignoreLocation: true,
            minMatchCharLength: 2
        };

        const fuse = new Fuse(result, fuseOptions);
        const searchResults = fuse.search(rawSearch);
        result = searchResults.map(r => r.item);
    }

    // 4. Standard Filters
    const isDefaultPriceRange = filters.priceRange[0] === 0 && filters.priceRange[1] >= 1000000;
    if (filters.priceRange && !isDefaultPriceRange) {
        result = result.filter(item => {
            const price = Number(item.price);
            if (isNaN(price)) return true;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
    }

    if (filters.selectedBrands.length > 0) {
        result = result.filter(item => item.brand && filters.selectedBrands.includes(item.brand));
    }

    // 5. Sorting
    if (filters.sort === 'low-high') {
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (filters.sort === 'high-low') {
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (filters.sort === 'rating') {
        result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    } else if (filters.sort === 'recommended' || !filters.sort) {
        // Default sort: Newer first or keep original order
        result.sort((a, b) => (b.id > a.id ? 1 : -1));
    }
    return result;
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        filterByCategory: (state, action: PayloadAction<string | null>) => {
            state.filters.category = action.payload;
            state.filters.search = '';
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setCategoryFromUrl: (state, action: PayloadAction<string | null>) => {
            state.filters.category = action.payload;
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.filters.category = null;
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setSort: (state, action: PayloadAction<string>) => {
            state.filters.sort = action.payload;
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setPriceRange: (state, action: PayloadAction<[number, number]>) => {
            state.filters.priceRange = action.payload;
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        toggleBrand: (state, action: PayloadAction<string>) => {
            const brand = action.payload;
            if (state.filters.selectedBrands.includes(brand)) {
                state.filters.selectedBrands = state.filters.selectedBrands.filter(b => b !== brand);
            } else {
                state.filters.selectedBrands.push(brand);
            }
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        clearFilters: (state) => {
            state.filters = {
                category: null,
                sort: null,
                search: '',
                priceRange: [0, 1000000],
                selectedBrands: []
            };
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setFirebaseProducts: (state, action: PayloadAction<Product[]>) => {
            state.items = action.payload;
            state.filteredItems = applyFilters(state.items, state.filters);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.filteredItems = applyFilters(state.items, state.filters);
            });
    }
});

export const { filterByCategory, setCategoryFromUrl, setSearch, setSort, setPriceRange, toggleBrand, clearFilters, setFirebaseProducts } = productSlice.actions;
export default productSlice.reducer;
