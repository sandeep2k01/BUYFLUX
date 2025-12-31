import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setSearch, clearFilters } from '../../features/products/productSlice';

const categories = [
    { title: 'T-Shirts', query: 'shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-blue-600' },
    { title: 'Denim', query: 'jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-indigo-600' },
    { title: 'Sneakers', query: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-red-600' },
    { title: 'Watches', query: 'watch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&h=800&auto=format&fit=crop', color: 'bg-amber-600' },
    { title: 'Bags', query: 'bag', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-purple-600' },
    { title: 'Sunglasses', query: 'sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-green-600' },
    { title: 'Food & Grocery', query: 'food', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-emerald-600' },
    { title: 'Fragrance', query: 'perfume', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-pink-600' },
    { title: 'Outerwear', query: 'jacket', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=400&h=500&auto=format&fit=crop', color: 'bg-orange-600' }
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
        <section className="py-20 bg-gray-50/50 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.8]">
                            BIGGEST DEALS
                        </h2>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full animate-pulse tracking-widest uppercase">
                                Live Now
                            </span>
                            <span className="text-gray-400 font-bold text-sm tracking-wide uppercase">Shop by top categories</span>
                        </div>
                    </motion.div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-900 transition-all hover:bg-black hover:text-white active:scale-90 shadow-xl shadow-black/5 z-10"
                        >
                            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-900 transition-all hover:bg-black hover:text-white active:scale-90 shadow-xl shadow-black/5 z-10"
                        >
                            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Area */}
            <div
                ref={scrollRef}
                className="flex flex-nowrap overflow-x-auto gap-6 md:gap-10 px-4 sm:px-6 lg:px-[max(1rem,calc((100vw-80rem)/2))] scrollbar-hide pb-12 snap-x snap-mandatory scroll-smooth"
            >
                {categories.map((cat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -15, scale: 1.02 }}
                        onClick={() => handleCategoryClick(cat.query)}
                        className="flex-shrink-0 w-[70vw] sm:w-[40vw] md:w-[280px] lg:w-[320px] snap-start group cursor-pointer"
                    >
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-6 shadow-2xl shadow-indigo-100/50">
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                            {/* Card Content */}
                            <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex flex-col gap-2">
                                    <span className={`${cat.color} text-white w-fit px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg shadow-black/20`}>
                                        UP TO 60% OFF
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-lg">
                                        {cat.title}
                                    </h3>
                                </div>
                                <motion.div
                                    className="h-1.5 bg-white mt-6 rounded-full"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default CategoryScroll;
