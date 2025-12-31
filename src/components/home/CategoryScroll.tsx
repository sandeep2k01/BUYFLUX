import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setSearch, clearFilters } from '../../features/products/productSlice';

const categories = [
    { title: 'Men', query: 'men', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-blue-600' },
    { title: 'Women', query: 'women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-pink-600' },
    { title: 'Kids', query: 'kids', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-orange-600' },
    { title: 'Beauty', query: 'beauty & skincare', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-rose-600' },
    { title: 'Grocery', query: 'food & grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-emerald-600' },
    { title: 'Anime', query: 'anime', image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-purple-600' },
    { title: 'Gadgets', query: 'gadgets', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-indigo-600' }
];

const CategoryScroll = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.7;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleCategoryClick = (query: string) => {
        dispatch(clearFilters());
        dispatch(setSearch(query));
        navigate('/products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-4 md:py-8 bg-white w-full overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase italic leading-tight mb-2">
                            SELECT <span className="text-indigo-600">UNITS</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="bg-black text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase">
                                Season 2025
                            </span>
                            <span className="text-gray-400 font-bold text-[10px] tracking-wide uppercase italic">The peak of digital curation</span>
                        </div>
                    </motion.div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-950 transition-all hover:bg-black hover:text-white active:scale-90 shadow-sm z-10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-950 transition-all hover:bg-black hover:text-white active:scale-90 shadow-sm z-10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Categories (Flipkart Style) */}
            <div className="md:hidden px-4 flex overflow-x-auto gap-6 scrollbar-hide pb-4 snap-x">
                {categories.map((cat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleCategoryClick(cat.query)}
                        className="flex-shrink-0 flex flex-col items-center gap-2 snap-start"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden active:scale-90 transition-transform shadow-sm">
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-[10px] font-black text-gray-950 uppercase tracking-tighter whitespace-nowrap">
                            {cat.title}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Desktop Categories (Premium Cards) */}
            <div
                ref={scrollRef}
                className="hidden md:flex flex-nowrap overflow-x-auto gap-6 md:gap-10 px-4 sm:px-6 lg:px-[max(1rem,calc((100vw-80rem)/2))] scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
            >
                {categories.map((cat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -10 }}
                        onClick={() => handleCategoryClick(cat.query)}
                        className="flex-shrink-0 w-[80vw] sm:w-[50vw] md:w-[320px] lg:w-[380px] snap-start group cursor-pointer"
                    >
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg bg-gray-100">
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                            <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${cat.color} border-2 border-white`} />
                                        <span className="text-white text-[9px] font-black tracking-[0.2em] uppercase opacity-70">
                                            Live Collection
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                                        {cat.title}
                                    </h3>
                                    <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] group/btn">
                                        Explore
                                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
};

export default CategoryScroll;
