import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ToyBrick, ShoppingBag, Laptop } from 'lucide-react';

const categories = [
    {
        id: 'anime',
        name: 'The Anime Hub',
        desc: 'Naruto, One Piece & More',
        image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=800&auto=format&fit=crop',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-purple-600/20',
        query: 'Anime'
    },
    {
        id: 'kids',
        name: 'Kids & Toys',
        desc: 'Educational & Fun Toys',
        image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800&auto=format&fit=crop',
        icon: <ToyBrick className="w-5 h-5" />,
        color: 'from-orange-600/20',
        query: 'Kids & Toys'
    },
    {
        id: 'home',
        name: 'Home Appliances',
        desc: 'Smart Living Essentials',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
        icon: <ShoppingBag className="w-5 h-5" />,
        color: 'from-teal-600/20',
        query: 'Home Appliances'
    },
    {
        id: 'gadgets',
        name: 'Gadgets',
        desc: 'Tech Focused Modern Gear',
        image: 'https://images.unsplash.com/photo-1508685096489-775b31117cbb?q=80&w=800&auto=format&fit=crop',
        icon: <Laptop className="w-5 h-5" />,
        color: 'from-blue-600/20',
        query: 'Gadgets'
    }
];

const CategoryGrid = () => {
    const navigate = useNavigate();

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            onClick={() => navigate(`/products/${cat.query.toLowerCase()}`)}
                            className="group relative h-[250px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-gray-100/50"
                        >
                            {/* Background Image */}
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/20 to-transparent transition-opacity group-hover:opacity-90`} />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                        {cat.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Explore</span>
                                </div>
                                <h3 className="text-2xl font-black text-white leading-tight uppercase italic mb-1">{cat.name}</h3>
                                <p className="text-[11px] font-medium text-gray-200 uppercase tracking-widest">{cat.desc}</p>

                                <div className="mt-4 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                    Shop Collection <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
