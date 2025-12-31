import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Send, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setUser } from '../../features/auth/authSlice';
import { toast } from 'sonner';

export const VerificationBanner = () => {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1); // 1: Banner, 2: Code Entry
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    if (!user || user.emailVerified || !isVisible) return null;

    const handleSendCode = async () => {
        setLoading(true);
        try {
            await authService.sendVerificationCode(user.email!);
            setStep(2);
            toast.success('Check your email!', { description: 'We sent a 6-digit code to ' + user.email });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send code');
        } finally {
            setLoadingState(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.verifyCode(user.email!, code);
            await authService.confirmUserVerification(user.uid);

            // Update local state instantly
            dispatch(setUser({ ...user, emailVerified: true }));

            toast.success('Account verified!', { icon: <CheckCircle2 className="text-green-500" /> });
            setIsVisible(false);
        } catch (error: any) {
            toast.error('Invalid Code', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Helper to fix a small mistake in the previous state name
    const setLoadingState = (val: boolean) => setLoading(val);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-indigo-600 text-white relative overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap gap-4 min-h-[44px]">
                        {step === 1 ? (
                            <div className="flex-1 flex items-center gap-3">
                                <span className="flex p-2 rounded-lg bg-indigo-800 shadow-inner">
                                    <Mail className="h-5 w-5 text-indigo-100" />
                                </span>
                                <p className="font-bold text-sm tracking-tight italic">
                                    Your email is not verified. Please verify to access checkout.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleVerify} className="flex-1 flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-indigo-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Enter OTP:</span>
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="bg-indigo-800/50 border-2 border-indigo-400/30 rounded-lg px-4 py-1.5 text-center text-sm font-black tracking-[0.3em] focus:outline-none focus:border-white transition-all w-32 placeholder-white/20"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Now'}
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold text-indigo-200 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
                            </form>
                        )}

                        <div className="flex items-center gap-3">
                            {step === 1 && (
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                    <Send className="h-3 w-3" />
                                </button>
                            )}

                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
