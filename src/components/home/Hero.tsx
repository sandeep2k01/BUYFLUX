import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop',
        title: 'End of Season Sale',
        subtitle: 'UP TO 70% OFF',
        color: 'from-blue-600/20'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2000&auto=format&fit=crop',
        title: 'New Gadgets Launch',
        subtitle: 'PRE-ORDER NOW',
        color: 'from-indigo-600/20'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
        title: 'Premium Couture',
        subtitle: 'EXCLUSIVE COLLECTION',
        color: 'from-purple-600/20'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop',
        title: 'Sports Essentials',
        subtitle: 'MIN. 40% OFF',
        color: 'from-red-600/20'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop',
        title: 'Tech & Appliances',
        subtitle: 'SMART SAVINGS',
        color: 'from-teal-600/20'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=2000&auto=format&fit=crop',
        title: 'Epic Anime Hub',
        subtitle: 'NARUTO • ONE PIECE • JUJUTSU',
        color: 'from-pink-600/20'
    }
];

const Hero = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    useEffect(() => {
        if (!isPaused) {
            const timer = setInterval(nextSlide, 3000);
            return () => clearInterval(timer);
        }
    }, [isPaused, nextSlide]);

    return (
        <section
            className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] bg-white overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 3, ease: "linear" }}
                        src={SLIDES[currentIndex].image}
                        alt={SLIDES[currentIndex].title}
                        className="w-full h-full object-cover"
                    />

                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${SLIDES[currentIndex].color} to-transparent z-10`} />

                    <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-start px-4 md:px-24 z-20 pb-20 md:pb-0">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="flex items-center gap-3 mb-2 md:mb-6"
                            >
                                <span className="h-[2px] w-8 md:w-12 bg-white rounded-full shadow-lg" />
                                <span className="text-white font-black text-[10px] md:text-sm tracking-[0.4em] uppercase">
                                    {SLIDES[currentIndex].subtitle}
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-white text-4xl md:text-6xl font-black uppercase italic leading-[1.1] tracking-tighter mb-6 md:mb-10 drop-shadow-2xl"
                            >
                                {SLIDES[currentIndex].title.split(' ').map((word, i) => (
                                    <span key={i} className="inline md:block mr-3 md:mr-0">{word}</span>
                                ))}
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                <button
                                    onClick={() => navigate('/products')}
                                    className="group relative px-6 md:px-12 py-3 md:py-5 bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-[0.4em] italic rounded-full overflow-hidden transition-all hover:bg-indigo-600 hover:text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 flex items-center gap-3"
                                >
                                    <span className="relative z-10">Acquire Now</span>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Premium Navigation Controls */}
            <div className="absolute right-6 md:right-12 bottom-12 md:bottom-24 z-30 flex flex-col gap-4">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 md:w-16 md:h-16 glass-light rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all active:scale-90"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="w-12 h-12 md:w-16 md:h-16 bg-black text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90 shadow-2xl"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>

            {/* Minimalist Progress Indicators */}
            <div className="absolute left-6 md:left-24 bottom-12 md:bottom-24 z-30 flex items-center gap-4">
                <span className="text-white/50 font-black text-[10px] md:text-xs tracking-widest uppercase">
                    0{currentIndex + 1}
                </span>
                <div className="w-24 md:w-48 h-[1px] bg-white/20 relative overflow-hidden">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute inset-0 bg-white"
                    />
                </div>
                <span className="text-white/50 font-black text-[10px] md:text-xs tracking-widest uppercase">
                    0{SLIDES.length}
                </span>
            </div>
        </section>
    );
};

export default Hero;
