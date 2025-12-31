import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import CategoryScroll from '../components/home/CategoryScroll';
import FeaturedProducts from '../components/home/FeaturedProducts';

const HomePage = () => {
    const valueProps = [
        {
            title: "Quality & Style",
            desc: "Curated collection of premium brands and trendy designs.",
            icon: (
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        {
            title: "Fast Delivery",
            desc: "Quick shipping on all orders with real-time tracking.",
            icon: (
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "24/7 Support",
            desc: "Our dedicated support team is here to help you anytime.",
            icon: (
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    } as any;

    return (
        <div className="flex flex-col min-h-screen">
            <Hero />
            <CategoryScroll />
            <FeaturedProducts />

            {/* Value Props Section */}
            <section className="bg-gray-900 py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20"
                    >
                        {valueProps.map((prop, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group relative"
                            >
                                <div className="absolute -inset-4 bg-indigo-500/5 rounded-[2rem] scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                <div className="relative flex flex-col items-center md:items-start text-center md:text-left">
                                    <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-indigo-600/5">
                                        <div className="group-hover:text-white group-hover:-rotate-12 transition-all duration-500">
                                            {prop.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
                                        {prop.title}
                                    </h3>
                                    <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
                                        {prop.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
