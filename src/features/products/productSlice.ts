import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

// Categories for the app
const CATEGORIES = ['Men', 'Women', 'Kids', 'Beauty', 'Food & Grocery', 'Home'];

// Category-specific brands/types for filtering
const CLOTHING_BRANDS = ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Levis', 'Gucci', 'Roadster'];
const BEAUTY_BRANDS = ['Loreal', 'Maybelline', 'MAC', 'Estee Lauder', 'Clinique', 'Neutrogena', 'Mamaearth', 'Lakme'];
const GROCERY_BRANDS = ['Amul', 'Nestle', 'Mother Dairy', 'ITC', 'Hindustan Unilever', 'P&G', 'Coca Cola', 'Pepsi', 'FarmFresh', 'Organic Tattva'];

// For Food & Grocery specific types as requested: fresh, meat, vegetables, non-vegetables
// const GROCERY_TYPES = ['Fresh', 'Meat', 'Vegetables', 'Non-Vegetables', 'Dairy', 'Beverages', 'Snacks'];

interface ApiProduct {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    thumbnail: string;
    rating: number;
    brand?: string;
    discountPercentage?: number;
}

interface ProductState {
    items: Product[];
    filteredItems: Product[];
    categories: string[];
    brands: string[];
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
    brands: [], // Will be dynamically populated or determined by category
    loading: false,
    error: null,
    filters: {
        category: null,
        sort: null,
        search: '',
        priceRange: [0, 10000],
        selectedBrands: []
    }
};

import { productService } from '../../services/productService';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    try {
        // 1. Fetch from Public API
        const apiResponse = await fetch('https://dummyjson.com/products?limit=200');
        const apiData = await apiResponse.json();

        // 2. Fetch from Firebase
        const firebaseProducts = await productService.getProducts();

        const mappedProducts: Product[] = [];

        // Map API products
        apiData.products.forEach((p: ApiProduct) => {
            const cat = p.category.toLowerCase();
            const fullTitle = p.title.toLowerCase();
            const desc = p.description.toLowerCase();
            let appCategory: string | null = null;
            let title = p.title;

            // Robust Category Mapping
            if (cat.includes('groceries') || cat.includes('food') || cat.includes('drink') || fullTitle.includes('potato') || fullTitle.includes('fish') || fullTitle.includes('honey') || fullTitle.includes('oil') || fullTitle.includes('coke') || fullTitle.includes('soda')) {
                appCategory = 'Food & Grocery';
            } else if (cat.includes('women') || cat.includes('dress') || cat.includes('jewel') || cat.includes('bag') || cat === 'tops' || fullTitle.includes('women') || desc.includes('women')) {
                appCategory = 'Women';
            } else if (cat.includes('shirt') || cat.includes('mens-watch') || cat.includes('watch') || cat.includes('men') || cat.includes('suit') || fullTitle.includes('men') || desc.includes('men')) {
                // If it mentions women first, it's already caught. This handles the rest for Men.
                if (!appCategory) appCategory = 'Men';
            } else if (cat.includes('beauty') || cat.includes('skin') || cat.includes('fragrance') || cat.includes('lip') || cat.includes('care')) {
                appCategory = 'Beauty';
            } else if (cat.includes('sunglass') || cat.includes('laptop') || cat.includes('mobile') || cat.includes('smartwatch')) {
                appCategory = 'Kids';
            } else if (cat.includes('furniture') || cat.includes('home') || cat.includes('kitchen') || cat.includes('appliance') || fullTitle.includes('furniture') || fullTitle.includes('home') || fullTitle.includes('kitchen') || fullTitle.includes('appliance')) {
                appCategory = 'Home';
            }

            // Fallback for Shoes
            if (cat.includes('shoes') || fullTitle.includes('shoes')) {
                if (cat.includes('women') || fullTitle.includes('women')) appCategory = 'Women';
                else appCategory = (p.id % 2 === 0) ? 'Kids' : 'Men';
            }

            if (appCategory) {
                let availableBrands: string[] = [];
                if (appCategory === 'Food & Grocery') availableBrands = GROCERY_BRANDS;
                else if (appCategory === 'Beauty') availableBrands = BEAUTY_BRANDS;
                else availableBrands = CLOTHING_BRANDS;

                // Extra logic for grocery types in titles/brands
                let brand = p.brand;
                if (!brand || !availableBrands.includes(brand)) {
                    // Try to match specific fish/meat/veg types for grocery
                    if (appCategory === 'Food & Grocery') {
                        const t = fullTitle + " " + desc;
                        if (t.includes('fish') || t.includes('meat') || t.includes('chicken') || t.includes('steak')) brand = 'Meat';
                        else if (t.includes('potato') || t.includes('vegetable') || t.includes('carrot') || t.includes('onion')) brand = 'Vegetables';
                        else if (t.includes('fruit') || t.includes('fresh') || t.includes('apple') || t.includes('berry')) brand = 'Fresh';
                        else if (t.includes('egg') || t.includes('milk') || t.includes('dairy')) brand = 'Non-Vegetables'; // Dairy/Eggs often grouped
                        else if (t.includes('juice') || t.includes('soda') || t.includes('drink') || t.includes('beverage')) brand = 'Beverages';
                        else brand = 'Fresh'; // Default for grocery
                    } else if (appCategory === 'Beauty') {
                        const t = (fullTitle + " " + desc + " " + cat).toLowerCase();
                        if (t.includes('skin') || t.includes('face') || t.includes('serum') || t.includes('cream')) brand = 'Skincare';
                        else if (t.includes('hair') || t.includes('shampoo') || t.includes('conditioner')) brand = 'Haircare';
                        else if (t.includes('perfume') || t.includes('fragrance') || t.includes('scent')) brand = 'Fragrance';
                        else if (t.includes('lip') || t.includes('makeup') || t.includes('nail') || t.includes('eye shadow')) brand = 'Makeup';
                        else brand = BEAUTY_BRANDS[Math.floor(Math.random() * BEAUTY_BRANDS.length)];
                    } else {
                        brand = availableBrands[Math.floor(Math.random() * availableBrands.length)];
                    }
                }

                const price = Math.round(p.price * 85);

                mappedProducts.push({
                    id: p.id.toString(),
                    title: title,
                    price: price,
                    description: p.description,
                    category: appCategory,
                    image: p.thumbnail,
                    rating: {
                        rate: p.rating,
                        count: Math.floor(Math.random() * 500) + 10
                    },
                    brand,
                    discountPercentage: p.discountPercentage ? Math.round(p.discountPercentage) : undefined
                });
            }
        });

        // Merge and return (Firebase products go first for visibility)
        return [...firebaseProducts, ...mappedProducts];

    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
    }
});

// Helper to filter items
const applyFilters = (items: Product[], filters: ProductState['filters']) => {
    let result = [...items];

    let queryCategory: string | null = null;
    let rawSearch = filters.search.toLowerCase().trim();

    // 1. Intelligent Category Detection (Enhanced)
    if (rawSearch) {
        if (/\b(men|mens|man|menswear|gent|gents)\b/i.test(rawSearch)) {
            queryCategory = 'Men';
            rawSearch = rawSearch.replace(/\b(men|mens|man|menswear|gent|gents)\b/gi, '').trim();
        } else if (/\b(women|womens|woman|ladies|womenswear|lady|girl|girls)\b/i.test(rawSearch)) {
            queryCategory = 'Women';
            rawSearch = rawSearch.replace(/\b(women|womens|woman|ladies|womenswear|lady|girl|girls)\b/gi, '').trim();
        } else if (/\b(kid|kids|child|children|boy|boys|infant|toddler)\b/i.test(rawSearch)) {
            queryCategory = 'Kids';
            rawSearch = rawSearch.replace(/\b(kid|kids|child|children|boy|boys|infant|toddler)\b/gi, '').trim();
        } else if (/\b(beauty|fragrance|makeup|skin|face|lipstick|perfume)\b/i.test(rawSearch)) {
            queryCategory = 'Beauty';
        } else if (/\b(food|grocery|groceries|potato|fish|honey|oil|drink|beverage)\b/i.test(rawSearch)) {
            queryCategory = 'Food & Grocery';
        } else if (/\b(home|furniture|kitchen|appliance)\b/i.test(rawSearch)) {
            queryCategory = 'Home';
        }
    }

    // 2. Combine Search-Query Category with UI Filter Category
    const activeCategory = filters.category || queryCategory;
    if (activeCategory) {
        result = result.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // 3. Robust Fuzzy Search (Handles Singular/Plural and Partial)
    if (rawSearch) {
        const terms = rawSearch.split(/\s+/).filter(t => t.length > 0);
        result = result.filter(item => {
            const searchContent = `${item.title} ${item.brand} ${item.category} ${item.description}`.toLowerCase();

            // Check if ALL terms (or their roots) match the content
            return terms.every(term => {
                // If the word ends in 's', try both plural and singular
                const root = (term.length > 3 && term.endsWith('s')) ? term.slice(0, -1) : term;

                // Matches if content contains the term, OR the term contains a word from the title (partial)
                return searchContent.includes(term) || searchContent.includes(root);
            });
        });
    }

    // 4. Price Range
    if (filters.priceRange) {
        result = result.filter(item => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]);
    }

    // 5. Brands
    if (filters.selectedBrands.length > 0) {
        result = result.filter(item => item.brand && filters.selectedBrands.includes(item.brand));
    }

    // 6. Sort
    if (filters.sort === 'low-high') {
        result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'high-low') {
        result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'rating') {
        result.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    return result;
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        filterByCategory: (state, action: PayloadAction<string | null>) => {
            state.filters.category = action.payload;
            state.filters.search = ''; // Clear search when changing category explicitly
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setCategoryFromUrl: (state, action: PayloadAction<string | null>) => {
            // Does NOT clear search. Used for syncing URL.
            state.filters.category = action.payload;
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            // Optional: reset category on global search, or keep it. 
            // For "Search bar is not working" complaints, resetting is safer to ensure results.
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
                priceRange: [0, 10000],
                selectedBrands: []
            };
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setFirebaseProducts: (state, action: PayloadAction<Product[]>) => {
            const firebaseItems = action.payload;
            // Filter out any duplicates from API items if necessary
            // For now, we just merge them
            const apiItems = state.items.filter(item => !item.id.includes('-fb')); // Assuming we might mark them

            // To be safe, we'll keep a clean merge
            // We'll trust the thunk has the API items
            state.items = [...firebaseItems, ...apiItems.filter(api => !firebaseItems.find(fb => fb.title === api.title))];
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
