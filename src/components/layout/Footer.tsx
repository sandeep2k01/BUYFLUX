import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, Briefcase, Mail, MapPin, Phone, ShieldCheck, Zap, Globe } from 'lucide-react';
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

    return (
        <footer className="bg-[#0A0A0B] text-white pt-20 pb-10 relative overflow-hidden border-t border-white/5">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link to="/" className="inline-block group transition-transform hover:scale-105 active:scale-95">
                            <img src="/logomain.png" alt="Buyflux" className="h-14 w-auto brightness-0 invert" />
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
                                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-white/10 hover:border-white/20`}
                                >
                                    <social.Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Collections Links */}
                    <div className="lg:col-span-3 space-y-6">
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

                    {/* Contact Info Group */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 group text-gray-400">
                                <Mail className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-medium">sandeepdamera596@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3 group text-gray-400">
                                <Phone className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-medium">+91 1234567890</span>
                            </div>
                            <div className="flex items-center gap-3 group text-gray-400">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-medium">Warangal, India</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Compact Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-white/5 mb-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-500/80" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-orange-500/80" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Express Shipping</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500/80" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Worldwide Access</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-indigo-400/80" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Premium Quality</span>
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
