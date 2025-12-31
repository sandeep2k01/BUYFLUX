import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

const Hero = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "circOut" as any }
        }
    };

    return (
        <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gray-900 overflow-hidden">
            {/* Background Image with Parallax-like motion */}
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0"
            >
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
                    alt="New Season Arrivals"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </motion.div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 h-full flex items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full text-left"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] md:text-xs font-black mb-8 tracking-[0.2em] uppercase shadow-lg shadow-indigo-600/20"
                    >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Premium Collection 2025
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase italic"
                    >
                        Fresh Style <br />
                        <span className="text-indigo-500 drop-shadow-2xl">
                            Starts Here
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-base sm:text-lg md:text-xl text-gray-200 mb-12 leading-relaxed max-w-xl font-medium opacity-90"
                    >
                        Experience the peak of modern fashion with our curated premium collection. Quality craftsmanship meets contemporary design.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap gap-6"
                    >
                        <Button
                            onClick={() => navigate('/products')}
                            className="bg-white hover:bg-gray-100 text-black px-10 md:px-14 py-4 md:py-5 rounded-full text-lg md:text-xl font-black transition-all hover:scale-105 active:scale-95 border-none shadow-2xl shadow-white/10"
                        >
                            Shop All
                        </Button>
                        <Button
                            onClick={() => navigate('/products/men')}
                            className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 px-10 md:px-14 py-4 md:py-5 rounded-full text-lg md:text-xl font-black backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
                        >
                            Explore Men
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-16 flex items-center gap-12 border-t border-white/10 pt-10"
                    >
                        <div className="flex flex-col">
                            <span className="text-2xl md:text-4xl font-black text-indigo-400 tracking-tighter">50k+</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Clients</span>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-2xl md:text-4xl font-black text-indigo-400 tracking-tighter">4.9/5</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Rating</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
