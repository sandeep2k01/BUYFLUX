import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { setUser, setError } from '../authSlice';
import { authService } from '../../../services/authService';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

const SignupPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Details
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.sendVerificationCode(email);
            toast.success('Verification code sent!', {
                description: `Please check your email (${email}) for the 6-digit code.`
            });
            setStep(2);
        } catch (err: any) {
            toast.error('Failed to send code', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.verifyCode(email, code);
            toast.success('Email verified successfully!');
            setStep(3);
        } catch (err: any) {
            toast.error('Verification failed', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await authService.register(name, email, password);
            dispatch(setUser(user));
            toast.success('Account created!', {
                description: `Welcome to Buyflux, ${name}! Your email is verified.`
            });
            navigate('/');
        } catch (err: any) {
            dispatch(setError(err.message));
            toast.error('Signup Failed', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_transparent_25%),_radial-gradient(circle_at_bottom_left,_#f5f3ff_0%,_transparent_25%)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 overflow-hidden"
            >
                <div className="relative">
                    <div className="flex justify-between items-center mb-10">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-indigo-600' : 'text-gray-300'}`}>
                                    {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Final'}
                                </span>
                            </div>
                        ))}
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-50 -z-10 mx-auto" />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                                        Verify <span className="text-indigo-600">Email</span>
                                    </h2>
                                    <p className="mt-4 text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Step 1: Enter your email to receive a 6-digit verification code.
                                    </p>
                                </div>

                                <form onSubmit={handleSendCode} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Mail className="h-4.5 w-4.5" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="block w-full pl-12 pr-5 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 border-none"
                                    >
                                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                                        Enter <span className="text-indigo-600">OTP</span>
                                    </h2>
                                    <p className="mt-4 text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Enter the 6-digit code sent to <span className="text-gray-900">{email}</span>.
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Verification Code</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <ShieldCheck className="h-4.5 w-4.5" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                className="block w-full pl-12 pr-5 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-center text-xl font-black tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="000000"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 border-none"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Continue'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                    >
                                        Back to change email
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                                        Final <span className="text-indigo-600">Details</span>
                                    </h2>
                                    <p className="mt-4 text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Your email is verified! Now set up your account profile.
                                    </p>
                                </div>

                                <form onSubmit={handleFinalSignup} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full px-5 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Create Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    className="block w-full px-5 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 border-none"
                                    >
                                        {loading ? 'Creating Archive...' : 'Finish Signup'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-10 pt-8 border-t border-gray-50">
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Log In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
