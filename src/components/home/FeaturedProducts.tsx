import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../features/products/productSlice';
import ProductCard from '../../features/products/components/ProductCard';

const FeaturedProducts = () => {
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector((state) => state.products);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, items.length]);

    // Show first 8 items
    const featuredItems = items.slice(0, 8);

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Curating your style...</p>
        </div>
    );

    if (error) return <div className="text-center py-20 text-red-500 font-bold uppercase tracking-widest">Error: {error}</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                >
                    <div className="text-left">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                            Featured <span className="text-indigo-600">Drops</span>
                        </h2>
                        <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-sm italic">
                            Handpicked and strictly limited
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10"
                >
                    {featuredItems.map((product) => (
                        <motion.div variants={itemVariants} key={product.id}>
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
