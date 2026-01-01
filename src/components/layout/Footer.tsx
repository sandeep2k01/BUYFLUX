import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, Briefcase } from 'lucide-react';

const Footer = () => {

    const socials = [
        { Icon: Linkedin, href: "https://www.linkedin.com/in/sandeep-damera", label: "LinkedIn" },
        { Icon: Briefcase, href: "https://www.naukri.com/mnj/v3/ms/login", label: "Naukri" },
        { Icon: Github, href: "https://github.com/sandeep2k01", label: "GitHub" },
        { Icon: Instagram, href: "https://www.instagram.com/sandeep_damera_/", label: "Instagram" }
    ];

    return (
        <footer className="bg-white border-t border-gray-100 py-10 md:py-16 relative overflow-hidden">
            {/* Minimalist Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 md:gap-10 mb-12 text-center md:text-left">
                    {/* Brand & Socials */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">
                                Buyflux
                            </span>
                        </Link>
                        <div className="flex gap-4">
                            {socials.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    title={social.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
                                >
                                    <social.Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info - Minimalist Row */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Support</p>
                            <p className="text-sm font-bold text-gray-900">sandeepdamera596@gmail.com</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Connect</p>
                            <p className="text-sm font-bold text-gray-900">+1 (888) BUY-FLUX</p>
                        </div>
                        <div className="space-y-1 md:text-right">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Location</p>
                            <p className="text-sm font-bold text-gray-900">Warangal, India</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Ultra Clean */}
                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] order-2 md:order-1">
                        &copy; 2026 BUYFLUX. BY <span className="text-indigo-600">SANDEEP DAMERA</span>
                    </p>
                    <div className="flex items-center gap-8 opacity-40 grayscale order-1 md:order-2">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-3" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-5" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="Paypal" className="h-4" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
