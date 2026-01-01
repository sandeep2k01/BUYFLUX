import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, Briefcase, Mail, MapPin, Phone, Send, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    const socials = [
        { Icon: Linkedin, href: "https://www.linkedin.com/in/sandeep-damera", label: "LinkedIn", color: "hover:text-blue-400" },
        { Icon: Briefcase, href: "https://www.naukri.com/mnj/v3/ms/login", label: "Naukri", color: "hover:text-blue-500" },
        { Icon: Github, href: "https://github.com/sandeep2k01", label: "GitHub", color: "hover:text-gray-400" },
        { Icon: Instagram, href: "https://www.instagram.com/sandeep_damera_/", label: "Instagram", color: "hover:text-pink-500" }
    ];

    const shopLinks = [
        { label: "Men's Fashion", href: "/products/Men" },
        { label: "Women's Collection", href: "/products/Women" },
        { label: "Gadgets & Tech", href: "/products/Gadgets" },
        { label: "Beauty & Skincare", href: "/products/Beauty & Skincare" },
        { label: "Anime Merch", href: "/products/Anime" },
    ];

    const supportLinks = [
        { label: "Track Order", href: "#" },
        { label: "Shipping Policy", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
    ];

    return (
        <footer className="bg-[#0A0A0B] text-white pt-20 pb-10 relative overflow-hidden border-t border-white/5">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link to="/" className="inline-block group transition-transform hover:scale-105 active:scale-95">
                            <img src="/logomain.png" alt="Buyflux" className="h-16 w-auto brightness-0 invert" />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                            Buyflux is a premium couture destination for those who seek excellence in every stitch. Curated by creators, for the modern visionary.
                        </p>
                        <div className="flex gap-4">
                            {socials.map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    whileHover={{ y: -5 }}
                                    className={`w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
                                >
                                    <social.Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links Group */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Collections</h3>
                            <ul className="space-y-4">
                                {shopLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium hover:translate-x-1 inline-block transform duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Assistance</h3>
                            <ul className="space-y-4">
                                {supportLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium hover:translate-x-1 inline-block transform duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter / CTA Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:scale-110 transition-transform">
                                <Zap className="w-12 h-12 text-indigo-500/20" />
                            </div>
                            <h3 className="text-lg font-black italic uppercase tracking-tight mb-2">Join the Flux</h3>
                            <p className="text-gray-400 text-xs mb-6 font-medium">Subscribe for early access to drops and exclusive offers.</p>

                            <form className="relative group/form" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-gray-600"
                                />
                                <button className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 group/btn shadow-lg shadow-indigo-600/20">
                                    <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>

                        <div className="flex flex-col gap-4 pl-4">
                            <div className="flex items-center gap-3 text-gray-500">
                                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Secure Payments</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Shipping</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-white/5 mb-10">
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                            <Mail className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Write to us</p>
                            <p className="text-xs font-bold text-gray-300">sandeepdamera596@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                            <Phone className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Call center</p>
                            <p className="text-xs font-bold text-gray-300">+91 1234567890</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                            <MapPin className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Our location</p>
                            <p className="text-xs font-bold text-gray-300">Warangal, India</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-medium text-gray-600 tracking-wider">
                        &copy; 2026 BUYFLUX. HAND-CRAFTED FOR THE FUTURE BY <span className="text-white font-black hover:text-indigo-400 cursor-pointer transition-colors">SANDEEP DAMERA</span>
                    </p>
                    <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-4" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-6" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="Paypal" className="h-5" />
                        <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="Google Pay" className="h-6" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
