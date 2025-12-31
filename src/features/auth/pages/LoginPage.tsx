import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { setUser, setError } from '../authSlice';
import { authService } from '../../../services/authService';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoadingState] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem('last_login_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingState(true);
        try {
            const user = await authService.login(email, password);
            dispatch(setUser(user));
            localStorage.setItem('last_login_email', email);
            toast.success('Welcome back, ' + (user.displayName || 'User') + '!');
            navigate('/');
        } catch (err: any) {
            dispatch(setError(err.message));
            toast.error('Login Failed', { description: err.message });
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_transparent_25%),_radial-gradient(circle_at_bottom_left,_#f5f3ff_0%,_transparent_25%)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50"
            >
                <div>
                    <h2 className="text-center text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                        Login <span className="text-indigo-600 italic">Account</span>
                    </h2>
                    <p className="mt-4 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4 decoration-2 transition-all">
                            Sign Up
                        </Link>
                    </p>
                </div>

                <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail className="h-4.5 w-4.5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-12 pr-5 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock className="h-4.5 w-4.5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-50 bg-gray-50/50 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all"
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

                    <div className="flex items-center justify-end">
                        <Link to="#" className="text-xs font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest transition-all">
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 border-none"
                    >
                        {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-50">
                    <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                        Secure Encryption Enabled
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
