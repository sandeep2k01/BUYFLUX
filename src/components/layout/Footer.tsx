import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const Footer = () => {

    const footerSections = [
        {
            title: "Collections",
            links: [
                { name: "Men's Fashion", path: "/products/men" },
                { name: "Women's Styles", path: "/products/women" },
                { name: "Kids & Toys", path: "/products/kids" },
                { name: "Beauty & Grooming", path: "/products/beauty & skincare" },
                { name: "New Arrivals", path: "/products" }
            ]
        }
    ];

    const socials = [
        { Icon: Facebook, href: "#", label: "Facebook" },
        { Icon: Twitter, href: "#", label: "Twitter" },
        { Icon: Instagram, href: "#", label: "Instagram" },
        { Icon: Youtube, href: "#", label: "Youtube" }
    ];

    return (
        <footer className="bg-gray-950 pt-24 pb-12 overflow-hidden relative">
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
                    {/* Brand Info */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase transition-colors group-hover:text-indigo-500">
                                Buyflux
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                            Redefining the digital shopping experience with curated premium units and next-gen logistics. Fast, secure, and purely elite.
                        </p>
                        <div className="flex gap-4">
                            {socials.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    title={social.label}
                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white hover:-translate-y-2 transition-all duration-300"
                                >
                                    <social.Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerSections.map((section, i) => (
                        <div key={i} className="space-y-8">
                            <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] italic">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 text-sm font-semibold hover:text-indigo-500 transition-colors flex items-center group gap-2"
                                        >
                                            <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-white/5 mb-10">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Email Support</p>
                            <p className="text-sm font-bold text-white">sandeepdamera596@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Call Center</p>
                            <p className="text-sm font-bold text-white">+1 (888) BUY-FLUX</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Hq Address</p>
                            <p className="text-sm font-bold text-white">Warangal, India</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            &copy; 2026 BUYFLUX. DEVELOPED BY <span className="text-indigo-500">SANDEEP DAMERA</span>
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/10 hidden md:block" />
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            Purely Elite Experience
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-4 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-6 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="Paypal" className="h-5 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
