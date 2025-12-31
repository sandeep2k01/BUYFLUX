import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Linkedin, Github, Briefcase } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center group">
                            <img
                                src="/logomain.png"
                                alt="Buyflux"
                                className="h-20 w-auto group-hover:scale-105 transition-transform"
                            />
                        </Link>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                            Crafting a new era of digital commerce with curated premium collections and lightning-fast experiences.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Linkedin, href: "https://www.linkedin.com/in/sandeep-damera596/" },
                                { Icon: Briefcase, href: "https://www.naukri.com/mnjuser/profile?id=&altresid", label: "Naukri" },
                                { Icon: Instagram, href: "https://www.instagram.com/sandeep_sandy_00/" },
                                { Icon: Github, href: "https://github.com/sandeep2k01" }
                            ].map((social, i) => (
                                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" title={social.label} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1">
                                    <social.Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Categories */}
                    <div>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Shop Selection</h4>
                        <ul className="space-y-4">
                            {['Men', 'Women', 'Kids', 'Beauty', 'Food & Grocery'].map((cat) => (
                                <li key={cat}>
                                    <Link to={`/products/${cat.toLowerCase()}`} className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Links */}
                    <div>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Customer Care</h4>
                        <ul className="space-y-4">
                            {['Track Order', 'Return Policy', 'Gift Cards', 'Contact Us'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Reach Us</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 text-gray-500 group">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Our Location</p>
                                    <p className="text-sm font-bold text-gray-900 uppercase">Warangal, India</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-gray-500 group">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Send us a mail</p>
                                    <p className="text-sm font-bold text-gray-900">sandeepdamera596@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        @ 2025 BUYFLUX. DEVELOPED BY SANDEEP DAMERA.
                    </p>
                    <div className="flex gap-8">
                        {['Privacy', 'Terms', 'Security'].map((link) => (
                            <a key={link} href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
