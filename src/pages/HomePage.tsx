import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import CategoryScroll from '../components/home/CategoryScroll';
import ProductHorizontalScroll from '../components/home/ProductHorizontalScroll';
import RecentlyViewed from '../components/home/RecentlyViewed';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProducts } from '../features/products/productSlice';
import { Shield, Truck, Zap } from 'lucide-react';

const HomePage = () => {
    const dispatch = useAppDispatch();
    const allProducts = useAppSelector((state) => state.products.items);

    useEffect(() => {
        // Essential: Fetch products on mount to ensure homepage sections are populated
        dispatch(fetchProducts());
    }, [dispatch]);

    // Categories Filtering - Robust, synced with productSlice logic
    const filterByCat = (catName: string) => {
        const cat = catName.toLowerCase();
        return allProducts.filter(item => {
            const itemCat = item.category?.toLowerCase() || '';
            if (!itemCat) return false;

            if (cat === 'men') return (itemCat.includes('men') || itemCat === 'tops') && !itemCat.includes('women');
            if (cat === 'women') return itemCat.includes('women') || itemCat.includes('dress') || itemCat.includes('jewel') || itemCat.includes('bag');
            if (cat === 'kids' || cat.includes('kid')) return itemCat.includes('kids') || itemCat.includes('toy') || itemCat.includes('child') || itemCat.includes('baby');
            if (cat === 'beauty') return itemCat.includes('beauty') || itemCat.includes('skin') || itemCat.includes('fragrance') || itemCat.includes('cosmetic') || itemCat === 'fragrances';
            if (cat === 'food') return itemCat.includes('food') || itemCat.includes('groc') || itemCat.includes('drink') || itemCat.includes('snack') || itemCat === 'groceries';
            if (cat === 'anime') return itemCat.includes('anime');
            if (cat === 'gadgets') return itemCat.includes('gadget') || itemCat.includes('phone') || itemCat.includes('electronic');

            return itemCat.includes(cat);
        }).slice(0, 25);
    };

    const menProducts = filterByCat('Men').slice(0, 25);
    const womenProducts = filterByCat('Women').slice(0, 25);
    const kidProducts = filterByCat('Kids').slice(0, 25);
    const beautyProducts = filterByCat('Beauty').slice(0, 25);
    const groceryProducts = filterByCat('Food').slice(0, 25);

    // 2 NEW Dedicated Categories (Select Units)
    const animeProducts = filterByCat('Anime').slice(0, 25);
    const gadgetProducts = filterByCat('Gadgets').slice(0, 25);

    const valueProps = [
        {
            title: "Premium Quality",
            desc: "Every product is handpicked for its superior craft and style.",
            icon: <Shield className="w-8 h-8" />
        },
        {
            title: "Express Shipping",
            desc: "Get your favorites delivered to your doorstep in 24-48 hours.",
            icon: <Truck className="w-8 h-8" />
        },
        {
            title: "Secure Checkout",
            desc: "Your data is protected with 256-bit military-grade encryption.",
            icon: <Zap className="w-8 h-8" />
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Hero />

            <div className="z-20">
                <CategoryScroll />
            </div>

            <main>
                {/* 1. Men's Fashion */}
                {menProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-8">
                        <ProductHorizontalScroll
                            title="Elite Men's Fashion"
                            products={menProducts}
                            category="Men"
                        />
                    </section>
                )}

                {/* 2. Women's Styles */}
                {womenProducts.length > 0 && (
                    <section className="bg-gray-50/40 py-4 md:py-8 border-y border-gray-100">
                        <ProductHorizontalScroll
                            title="Supreme Women's Styles"
                            products={womenProducts}
                            category="Women"
                        />
                    </section>
                )}

                {/* 3. Kids' Adventure */}
                {kidProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-8">
                        <ProductHorizontalScroll
                            title="Kids' Adventure & Style"
                            products={kidProducts}
                            category="Kids"
                        />
                    </section>
                )}

                {/* 4. Beauty & Skincare */}
                {beautyProducts.length > 0 && (
                    <section className="bg-pink-50/10 py-4 md:py-8 border-y border-pink-100/30">
                        <ProductHorizontalScroll
                            title="Beauty & Skincare Essentials"
                            products={beautyProducts}
                            category="Beauty & Skincare"
                        />
                    </section>
                )}

                {/* 5. Food & Grocery */}
                {groceryProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-8">
                        <ProductHorizontalScroll
                            title="Fresh Food & Daily Grocery"
                            products={groceryProducts}
                            category="Food & Grocery"
                        />
                    </section>
                )}

                {/* 6. Anime */}
                {animeProducts.length > 0 && (
                    <section className="bg-indigo-50/10 py-4 md:py-8 border-y border-indigo-100/20">
                        <ProductHorizontalScroll
                            title="Exclusive Anime Merchandise"
                            products={animeProducts}
                            category="Anime"
                        />
                    </section>
                )}


                {/* 9. Gadgets */}
                {gadgetProducts.length > 0 && (
                    <section className="bg-blue-50/5 py-4 md:py-8 border-y border-blue-100/20">
                        <ProductHorizontalScroll
                            title="Next-Gen Tech & Gadgets"
                            products={gadgetProducts}
                            category="Gadgets"
                        />
                    </section>
                )}

                {/* Recently Viewed (Bottom) */}
                <RecentlyViewed />
            </main>

            {/* Value Propositions */}
            <section className="bg-gray-950 py-10 md:py-16 overflow-hidden relative">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-3 gap-6 md:gap-12 items-start">
                        {valueProps.map((prop, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className="w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 md:mb-8 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                                    <div className="text-white scale-50 md:scale-125 transition-transform">
                                        {prop.icon}
                                    </div>
                                </div>
                                <h3 className="text-[7px] md:text-[14px] font-black text-white uppercase tracking-[0.1em] md:tracking-[0.2em] italic leading-tight px-1">
                                    {prop.title}
                                </h3>
                                <p className="hidden md:block text-sm text-gray-400 font-medium leading-relaxed max-w-[280px] mt-4">
                                    {prop.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>

    );
};

export default HomePage;
