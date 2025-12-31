import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { productService } from '../../services/productService';

// Categories for the app - Final unified list
const CATEGORIES = ['Men', 'Women', 'Kids', 'Beauty & Skincare', 'Food & Grocery', 'Gadgets', 'Anime', 'Home Appliances'];

// --- PREMIUM HARDCODED MOCK PRODUCTS ---
// Expanded to ensure all homepage sections have enough data (min 4 products per category)
const PREMIUM_MOCK_PRODUCTS: Product[] = [
    // ANIME (Naruto Theme)
    {
        id: 'anime-v1',
        title: 'Naruto Sage Mode Action Figure',
        price: 3499,
        description: 'Highly detailed Naruto Uzumaki action figure in Sage Mode with Rasenshuriken effect.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1611001716885-b3402558a62b?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 420 },
        brand: 'Bandai',
        discountPercentage: 10
    },
    {
        id: 'anime-v2',
        title: 'Akatsuki Red Cloud Hoodie',
        price: 2899,
        description: 'Premium cotton hoodie featuring the iconic Akatsuki red cloud embroidery.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1618331812471-de3230bc5a4e?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 850 },
        brand: 'Hidden Leaf',
        discountPercentage: 15
    },
    {
        id: 'anime-v3',
        title: 'Uchiha Itachi Crow Graphic Tee',
        price: 1299,
        description: '100% combed cotton tee with Itachi Mangekyo Sharingan and crow silhouette.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 320 },
        brand: 'Grand Line',
        discountPercentage: 5
    },
    {
        id: 'anime-v4',
        title: 'Hidden Leaf Metal Headband',
        price: 499,
        description: 'Authentic stainless steel headband with the Konoha leaf symbol on durable fabric.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 1200 },
        brand: 'Ninja Gear',
        discountPercentage: 20
    },
    {
        id: 'anime-v5',
        title: 'Kakashi Hatake Chidori Poster',
        price: 899,
        description: 'High-quality matte finish poster depicting Kakashi using his signature Chidori.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1594732832278-abd644401416?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 215 },
        brand: 'Studio Art',
        discountPercentage: 10
    },
    {
        id: 'anime-v6',
        title: 'Kurama Nine-Tails Plush Toy',
        price: 1999,
        description: 'Soft and huggable plush version of the Nine-Tailed Fox, Kurama.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 5.0, count: 156 },
        brand: 'ToyCo',
        discountPercentage: 12
    },
    {
        id: 'anime-v7',
        title: 'Sasuke Uchiha Rinnegan Keychain',
        price: 299,
        description: 'Metal keychain featuring Sasuke with his Rinnegan and Sharingan activated.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1608889175250-c3b0c1667d3a?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.5, count: 540 },
        brand: 'Ninja Gear',
        discountPercentage: 0
    },
    {
        id: 'anime-v8',
        title: 'Ichiraku Ramen Bowl Set',
        price: 2499,
        description: 'Get the full Naruto experience with this authentic Ichiraku Ramen bowl and chopsticks.',
        category: 'Anime',
        image: 'https://images.unsplash.com/photo-1614583225154-5feaba1bd5fc?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 89 },
        brand: 'Home Style',
        discountPercentage: 5
    },

    // WOMEN
    {
        id: 'women-v1',
        title: 'Ethereal Silk Evening Gown',
        price: 8499,
        description: 'Floor-length pure silk gown with delicate hand-embroidery and flowing silhouette.',
        category: 'Women',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
        rating: { rate: 4.9, count: 85 },
        brand: 'Vogue Aura',
        discountPercentage: 15
    },
    {
        id: 'women-v2',
        title: 'Starlight Diamond Pendant',
        price: 15999,
        description: '18k white gold banner with a certified 0.5ct brilliant-cut diamond.',
        category: 'Women',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
        rating: { rate: 5.0, count: 42 },
        brand: 'Orra Luxe',
        discountPercentage: 10
    },
    {
        id: 'women-v3',
        title: 'Midnight Velvet Stilettos',
        price: 5999,
        description: 'Premium Italian velvet heels with memory foam cushioning and gold hardware.',
        category: 'Women',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
        rating: { rate: 4.7, count: 128 },
        brand: 'Step Luxe',
        discountPercentage: 20
    },
    {
        id: 'women-v4',
        title: 'Blush Pink Sun Dress',
        price: 2499,
        description: 'Lightweight linen dress perfect for summer outings and beach walks.',
        category: 'Women',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.5, count: 320 },
        brand: 'Vogue Aura',
        discountPercentage: 25
    },
    {
        id: 'women-v5',
        title: 'Designer Quilted Handbag',
        price: 7200,
        description: 'Genuine leather quilted bag with chain strap and gold-tone logo.',
        category: 'Women',
        image: 'https://images.unsplash.com/photo-1584917033904-47e147791ed5?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 190 },
        brand: 'Luxe Goods',
        discountPercentage: 15
    },

    // MEN
    {
        id: 'men-v1',
        title: 'Classic Indigo Denim Jacket',
        price: 3499,
        description: 'Authentic heavy-duty denim with a vintage wash and copper hardware.',
        category: 'Men',
        image: 'https://images.unsplash.com/photo-1576874620030-9b6e828f7312?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 310 },
        brand: 'Denim Co',
        discountPercentage: 15
    },
    {
        id: 'men-v2',
        title: 'Premium Leather Biker Jacket',
        price: 8999,
        description: 'Full-grain lambskin leather with asymmetric zip and quilted lining.',
        category: 'Men',
        image: 'https://images.unsplash.com/photo-1551028711-13aa55da68e3?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 120 },
        brand: 'Garrison',
        discountPercentage: 10
    },
    {
        id: 'men-v3',
        title: 'Oxford Cotton Slim Fit Shirt',
        price: 1800,
        description: 'Crisp white oxford cotton with a tailored fit and button-down collar.',
        category: 'Men',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 540 },
        brand: 'Modern Men',
        discountPercentage: 20
    },
    {
        id: 'men-v4',
        title: 'Urban Explorer Waterproof Parka',
        price: 5499,
        description: 'Insulated waterproof parka with faux-fur hood and multiple utility pockets.',
        category: 'Men',
        image: 'https://images.unsplash.com/photo-1539533377285-bb41e8c4d43b?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 85 },
        brand: 'Swift',
        discountPercentage: 25
    },
    {
        id: 'men-v5',
        title: 'Heritage Leather Backpack',
        price: 6500,
        description: 'Rugged water-resistant leather backpack for daily essentials.',
        category: 'Men',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 210 },
        brand: 'Traveler',
        discountPercentage: 15
    },

    // BEAUTY & SKINCARE
    {
        id: 'beauty-v1',
        title: 'Radiance Vitamin C Serum',
        price: 1899,
        description: 'Pure 15% Vitamin C serum for bright and glowing skin. Enhances skin texture.',
        category: 'Beauty & Skincare',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 1240 },
        brand: 'GlowRx',
        discountPercentage: 30
    },
    {
        id: 'beauty-v2',
        title: 'Matte Liquid Lipstick Set',
        price: 2499,
        description: 'Set of 6 long-lasting matte lipsticks in trending nude and bold shades.',
        category: 'Beauty & Skincare',
        image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 850 },
        brand: 'Luxe Glam',
        discountPercentage: 15
    },
    {
        id: 'beauty-v3',
        title: 'Hydrating Night Repair Cream',
        price: 3200,
        description: 'Deep hydration with hyaluronic acid and ceramides. Repairs skin overnight.',
        category: 'Beauty & Skincare',
        image: 'https://images.unsplash.com/photo-1556228570-419a7c27d530?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 560 },
        brand: 'Pure Bliss',
        discountPercentage: 10
    },
    {
        id: 'beauty-v4',
        title: 'Charcoal Detox Face Mask',
        price: 899,
        description: 'Deep pore cleansing with activated charcoal and volcanic clay.',
        category: 'Beauty & Skincare',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 1100 },
        brand: 'SkinZen',
        discountPercentage: 20
    },

    // FOOD & GROCERY
    {
        id: 'food-v1',
        title: 'Organic Exotic Fruit Basket',
        price: 1499,
        description: 'Assorted seasonal exotic fruits picked fresh from organic farms.',
        category: 'Food & Grocery',
        image: 'https://images.unsplash.com/photo-1610832958506-ee5636637671?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 420 },
        brand: 'Farm Fresh',
        discountPercentage: 5
    },
    {
        id: 'food-v2',
        title: 'Cold Pressed Olive Oil 1L',
        price: 1299,
        description: 'Premium extra virgin olive oil from early harvest Spanish olives.',
        category: 'Food & Grocery',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 1100 },
        brand: 'Oleum',
        discountPercentage: 10
    },
    {
        id: 'food-v3',
        title: 'Artisan Dark Chocolate Box',
        price: 799,
        description: 'Handcrafted dark chocolates with 75% cocoa solids and sea salt.',
        category: 'Food & Grocery',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 230 },
        brand: 'ChocoArt',
        discountPercentage: 20
    },
    {
        id: 'food-v4',
        title: 'Pure Wildflower Honey',
        price: 594,
        description: '100% pure raw wildflower honey. Unfiltered and rich in antioxidants.',
        category: 'Food & Grocery',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 135 },
        brand: 'Henry\'s',
        discountPercentage: 14
    },

    // KIDS (12 Products)
    {
        id: 'kids-v1',
        title: 'STEM Curiosity Robotics Kit',
        price: 3499,
        description: 'Building blocks meet coding. Assemble 5 different robot models with app control.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 156 },
        brand: 'EduPlay',
        discountPercentage: 12
    },
    {
        id: 'kids-v2',
        title: 'Hyper-Drift RC Racing Car',
        price: 1800,
        description: '1:16 scale rechargeable drift car with LED lights and 2.4GHz remote.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.5, count: 240 },
        brand: 'TurboX',
        discountPercentage: 25
    },
    {
        id: 'kids-v3',
        title: 'Ultra-Plush Pastel Bunny',
        price: 999,
        description: 'Velvety soft plush toy made from baby-safe hypoallergenic fabric.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 5.0, count: 520 },
        brand: 'SnuggleSafe',
        discountPercentage: 10
    },
    {
        id: 'kids-v4',
        title: 'Solar System 200pc Puzzle',
        price: 599,
        description: 'Glow-in-the-dark educational puzzle featuring all planets.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 310 },
        brand: 'BrainyGames',
        discountPercentage: 15
    },
    {
        id: 'kids-v5',
        title: 'Little Architect Building Blocks',
        price: 1499,
        description: '100 pieces of colorful wooden blocks for creative building.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 180 },
        brand: 'BuildIt',
        discountPercentage: 10
    },
    {
        id: 'kids-v6',
        title: 'Junior Chef Kitchen Set',
        price: 2500,
        description: 'Complete play kitchen with realistic sounds and accessories.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 95 },
        brand: 'HappyKids',
        discountPercentage: 5
    },
    {
        id: 'kids-v7',
        title: 'Dino-Discovery Dig Kit',
        price: 799,
        description: 'Excavate 12 different dinosaur fossils and learn about history.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 420 },
        brand: 'BioWorld',
        discountPercentage: 15
    },
    {
        id: 'kids-v8',
        title: 'Princess Dream Castle Tent',
        price: 1299,
        description: 'Large indoor/outdoor play tent with fairy lights.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1519340333755-900a6dba2903?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.8, count: 210 },
        brand: 'Dreamland',
        discountPercentage: 20
    },
    {
        id: 'kids-v9',
        title: 'Magnetic Drawing Board',
        price: 499,
        description: 'Mess-free drawing with magnetic pen and stamps.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.5, count: 650 },
        brand: 'Artify',
        discountPercentage: 0
    },
    {
        id: 'kids-v10',
        title: 'Balance Bike for Toddlers',
        price: 3999,
        description: 'Lightweight aluminum bike to help kids learn balance.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.9, count: 125 },
        brand: 'SwiftRide',
        discountPercentage: 10
    },
    {
        id: 'kids-v11',
        title: 'Space Explorer Telescope',
        price: 5500,
        description: 'Powerful entry-level telescope for young astronomers.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1516339901600-2e1a62986347?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 88 },
        brand: 'CosmoView',
        discountPercentage: 5
    },
    {
        id: 'kids-v12',
        title: 'Musical Keyboard for Kids',
        price: 1599,
        description: '37-key keyboard with various instrument sounds and recording feature.',
        category: 'Kids',
        image: 'https://images.unsplash.com/photo-1520529615822-67807a049d5c?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 140 },
        brand: 'MelodyGo',
        discountPercentage: 20
    },

    // HOME APPLIANCES
    {
        id: 'home-v1',
        title: 'Quick-Crisp 4.5L Air Fryer',
        price: 5499,
        description: 'Enjoy guilt-free fried food with 90% less oil. Built-in presets.',
        category: 'Home Appliances',
        image: 'https://images.unsplash.com/photo-1621236304195-03713835bd69?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 1200 },
        brand: 'CookMaster',
        discountPercentage: 35
    },
    {
        id: 'home-v2',
        title: 'Smart Wi-Fi RGB Night Bulb',
        price: 899,
        description: '16 million colors, voice control via Alexa/Google Assistant and scheduling.',
        category: 'Home Appliances',
        image: 'https://images.unsplash.com/photo-1552590635-27c2c21287f5?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 3400 },
        brand: 'PureH2O',
        discountPercentage: 30
    },
    {
        id: 'home-v3',
        title: 'Turbo-Suction Cordless Vacuum',
        price: 9999,
        description: 'Powerful handheld cleaning for sofas and cars with 40min battery life.',
        category: 'Home Appliances',
        image: 'https://images.unsplash.com/photo-1614359833855-886ec859114b?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.4, count: 620 },
        brand: 'SwiftClean',
        discountPercentage: 20
    },

    // GADGETS
    {
        id: 'gadget-v1',
        title: 'Nova Titan Gen 4 Smart Watch',
        price: 3499,
        description: '1.8" AMOLED display, GPS tracking, and advanced health sensors.',
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.5, count: 4200 },
        brand: 'NovaTech',
        discountPercentage: 40
    },
    {
        id: 'gadget-v2',
        title: 'DeepBase Pro Wireless Buds',
        price: 1999,
        description: 'Active Noise Cancellation and IPX5 sweat resistance. Clear voice mic.',
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.7, count: 8500 },
        brand: 'SonicAudio',
        discountPercentage: 50
    },
    {
        id: 'gadget-v3',
        title: 'Rugged Waterproof Bluetooth Speaker',
        price: 2499,
        description: '360-degree sound with deep bass and shockproof adventurous design.',
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1608156639585-34a0a562559a?auto=format&fit=crop&w=800&q=80',
        rating: { rate: 4.6, count: 1200 },
        brand: 'BoomBox',
        discountPercentage: 20
    }
];

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
    brands: [],
    loading: false,
    error: null,
    filters: {
        category: null,
        sort: null,
        search: '',
        priceRange: [0, 100000],
        selectedBrands: []
    }
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    try {
        const apiResponse = await fetch('https://dummyjson.com/products?limit=200');
        const apiData = await apiResponse.json();
        const firebaseProducts = await productService.getProducts();

        const mappedProducts: Product[] = [];

        apiData.products.forEach((p: ApiProduct) => {
            const cat = p.category.toLowerCase();
            const fullTitle = p.title.toLowerCase();
            let appCategory: string | null = null;

            if (cat.includes('groceries') || cat.includes('food')) {
                appCategory = 'Food & Grocery';
            } else if (cat.includes('women') || cat.includes('dress') || cat.includes('jewel')) {
                appCategory = 'Women';
            } else if (cat.includes('men') || cat.includes('shirt') || fullTitle.includes('men')) {
                appCategory = 'Men';
            } else if (cat.includes('beauty') || cat.includes('skin')) {
                appCategory = 'Beauty & Skincare';
            } else if (cat.includes('toy') || cat.includes('kids') || cat.includes('baby')) {
                appCategory = 'Kids';
            } else if (cat.includes('mobile') || cat.includes('laptop')) {
                appCategory = 'Gadgets';
            } else if (fullTitle.includes('anime')) {
                appCategory = 'Anime';
            } else if (cat.includes('home') || cat.includes('appliance')) {
                appCategory = 'Home Appliances';
            }

            if (appCategory) {
                mappedProducts.push({
                    id: `api-${p.id}`,
                    title: p.title,
                    price: Math.round(p.price * 85),
                    description: p.description,
                    category: appCategory,
                    image: p.thumbnail,
                    rating: { rate: p.rating, count: Math.floor(Math.random() * 500) + 10 },
                    brand: p.brand || 'Global',
                    discountPercentage: p.discountPercentage ? Math.round(p.discountPercentage) : undefined
                });
            }
        });

        // Combine all products: Mock -> Firebase -> API
        return [...PREMIUM_MOCK_PRODUCTS, ...firebaseProducts, ...mappedProducts];
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

    // If we have an active category, we prioritize it, but we don't return early 
    // because we still want to apply the fuzzy search within that category.
    if (activeCategory) {
        // Soft filter: boost results in category but don't strictly exclude if search is broad
        // Actually, for most e-commerce apps, if categorized, they stay in category.
        result = result.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // 2. Advanced Fuzzy Search with Plural/Singular & Synonym mapping
    if (rawSearch) {
        // Basic normalization: remove common possessives and plurals
        const normalize = (word: string) => {
            return word.replace(/'s$/g, '').replace(/s$/g, '').replace(/es$/g, '');
        };

        const searchTerms = rawSearch.split(/\s+/).filter(t => t.length > 2);
        const normalizedTerms = searchTerms.map(normalize);

        // Synonym mapping for broader matches
        const synonymMap: Record<string, string[]> = {
            'shirt': ['tee', 't-shirt', 'hoodie', 'top', 'apparel', 'clothing'],
            'shoe': ['sneaker', 'boot', 'heel', 'footwear', 'stiletto', 'sandal'],
            'watch': ['timepiece', 'clock', 'smartwatch', 'wrist'],
            'kit': ['set', 'box', 'bundle'],
            'toy': ['game', 'play', 'puzzle', 'figure'],
            'beauty': ['skin', 'makeup', 'glam', 'serum', 'cream'],
        };

        result = result.filter(item => {
            const title = item.title.toLowerCase();
            const desc = item.description.toLowerCase();
            const brand = (item.brand || '').toLowerCase();
            const category = item.category.toLowerCase();
            const combinedContent = `${title} ${desc} ${brand} ${category}`;

            // Check if every term match (regular or normalized or synonym)
            return searchTerms.every((term, idx) => {
                const normTerm = normalizedTerms[idx];

                // Direct match
                if (combinedContent.includes(term) || combinedContent.includes(normTerm)) return true;

                // Synonym match
                const synonyms = synonymMap[normTerm] || [];
                if (synonyms.some(syn => combinedContent.includes(syn))) return true;

                // Also check individual words in title for better weight
                const titleWords = title.split(/\s+/).map(normalize);
                if (titleWords.some(tw => tw === normTerm)) return true;

                return false;
            });
        });

        // 3. Fallback: If result is empty, try a lighter search (any term matches)
        if (result.length === 0 && searchTerms.length > 1) {
            result = items.filter(item => {
                const content = `${item.title} ${item.description} ${item.category}`.toLowerCase();
                return searchTerms.some(term => content.includes(term) || content.includes(normalize(term)));
            });
            // Limit to category if it was detected
            if (activeCategory) {
                result = result.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());
            }
        }
    }

    // 4. Standard Filters
    if (filters.priceRange) {
        result = result.filter(item => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]);
    }

    if (filters.selectedBrands.length > 0) {
        result = result.filter(item => item.brand && filters.selectedBrands.includes(item.brand));
    }

    // 5. Sorting
    if (filters.sort === 'low-high') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'high-low') result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating') result.sort((a, b) => b.rating.rate - a.rating.rate);

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
                priceRange: [0, 100000],
                selectedBrands: []
            };
            state.filteredItems = applyFilters(state.items, state.filters);
        },
        setFirebaseProducts: (state, action: PayloadAction<Product[]>) => {
            state.items = [...action.payload, ...state.items.filter(api => !action.payload.find(fb => fb.title === api.title))];
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
