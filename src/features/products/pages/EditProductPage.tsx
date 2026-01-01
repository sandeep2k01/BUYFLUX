import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Button } from '../../../components/ui/Button';
import { productService } from '../../../services/productService';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../../../types';

const EditProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '',
        brand: '',
        price: 0,
        category: '',
        description: '',
        image: '',
        discountPercentage: 0
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                console.error("No product ID found in URL");
                toast.error("Invalid product ID");
                navigate('/admin');
                return;
            }

            try {
                setLoading(true);
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Product;
                    setFormData(data);
                    setPreviewUrl(data.image);
                } else {
                    toast.error("Product not found");
                    navigate('/admin');
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to fetch product data");
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        return () => {
            toast.dismiss();
        };
    }, [id, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        try {
            let finalImageUrl = formData.image;

            if (selectedFile) {
                toast.loading("Uploading image...");
                try {
                    finalImageUrl = await productService.uploadImage(selectedFile);
                    toast.success("Image uploaded!");
                } catch (uploadError: any) {
                    toast.error(`Upload failed: ${uploadError.message}`);
                    setSaving(false);
                    return;
                }
            }

            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, {
                ...formData,
                price: Number(formData.price),
                discountPercentage: Number(formData.discountPercentage),
                image: finalImageUrl
            });
            toast.success("Product updated!");
            navigate('/admin');
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'image') {
            setPreviewUrl(value);
            setSelectedFile(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Product...</p>
                </div>
            </div>
        );
    }

    if (!formData.title && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-black mb-2 uppercase">Something went wrong</h2>
                    <p className="text-sm text-gray-500 mb-6 font-medium">We couldn't load the product details. Please try again.</p>
                    <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-12">
            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-bold transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs uppercase tracking-widest">Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-100/10 overflow-hidden">
                <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase italic leading-none">Edit Product</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Update details for {formData.title || 'Product'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side: Form Fields */}
                        <div className="lg:col-span-7 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Product Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-bold text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Brand Name</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-bold text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-bold text-sm cursor-pointer"
                                    >
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Beauty & Skincare">Beauty & Skincare</option>
                                        <option value="Gadgets">Gadgets</option>
                                        <option value="Anime">Anime</option>
                                        <option value="Food & Grocery">Food & Grocery</option>
                                        <option value="Home Appliances">Home Appliances</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Discount (%)</label>
                                        <input
                                            type="number"
                                            name="discountPercentage"
                                            value={formData.discountPercentage}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-black text-sm text-orange-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Product Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Right Side: Image Setup */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Media Setup</label>

                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="Cloudinary or Unsplash URL..."
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-100 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-mono text-[9px]"
                                    />
                                    <label className="p-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                                        <Upload className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>

                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-white border border-indigo-50 flex items-center justify-center relative shadow-inner group">
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            {selectedFile && (
                                                <div className="absolute top-3 right-3 bg-green-600 text-[8px] font-black text-white px-2 py-1 rounded-full shadow-xl animate-bounce">
                                                    STAGED
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No Image</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest italic text-center">
                                    * Cloudinary Active • 100% Free Hosting
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Update Product
                        </Button>
                        <Button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 border-none shadow-none"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductPage;
