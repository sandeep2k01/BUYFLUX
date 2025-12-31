import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient Background Blur */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]" />

            <div className="max-w-xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                >
                    <h1 className="text-[12rem] md:text-[20rem] font-black text-gray-900/5 leading-none absolute inset-0 flex items-center justify-center -z-10 tracking-tighter italic">
                        404
                    </h1>

                    <div className="bg-white/40 backdrop-blur-xl border border-gray-100 rounded-[3rem] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]">
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-600/30">
                            <Search className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-gray-950 uppercase italic tracking-tighter mb-4">
                            Unit Not Located
                        </h2>

                        <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed mb-12 uppercase tracking-wide">
                            The requested resource has been shifted or no longer exists in our current synchronized collection.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-4 bg-gray-950 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 bg-white text-gray-950 border border-gray-100 font-black text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                        </div>
                    </div>
                </motion.div>

                <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
                    Buyflux Synchronization Error 0x404
                </p>
            </div>
        </div>
    );
};

export default NotFoundPage;
