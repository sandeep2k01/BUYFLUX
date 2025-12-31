import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { motion } from 'framer-motion';

const CategoryShowcase = () => {
    const navigate = useNavigate();
    const allProducts = useAppSelector((state) => state.products.items);

    const categories = [
        {
            title: 'Anime',
            query: 'Anime',
            desc: 'Naruto, One Piece & More'
        },
        {
            title: 'Kids & Toys',
            query: 'Kids & Toys',
            desc: 'Educational & Fun Toys'
        },
        {
            title: 'Home Appliances',
            query: 'Home Appliances',
            desc: 'Smart Living Essentials'
        },
        {
            title: 'Gadgets',
            query: 'Gadgets',
            desc: 'Tech Focused Modern Gear'
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => {
                        const products = allProducts
                            .filter(p => p.category === cat.query)
                            .slice(0, 4);

                        return (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col h-full"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.title}</h3>
                                <p className="text-xs text-gray-400 mb-6 font-medium tracking-tight">{cat.desc}</p>

                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2 p-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-700 truncate">{product.title}</p>
                                            <p className="text-[10px] font-black text-indigo-600">₹{product.price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="col-span-2 py-10 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-lg">
                                            Loading Collection...
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate(`/products/${cat.query.toLowerCase()}`)}
                                    className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1 group w-fit"
                                >
                                    Explore More
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
