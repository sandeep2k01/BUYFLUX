import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
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

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFormData(docSnap.data() as Product);
                } else {
                    toast.error("Product not found");
                    navigate('/admin');
                }
            } catch (error) {
                toast.error("Failed to fetch product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        try {
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, {
                ...formData,
                price: Number(formData.price),
                discountPercentage: Number(formData.discountPercentage)
            });
            toast.success("Product updated successfully!");
            navigate('/admin');
        } catch (error) {
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-100/20 overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Edit Product</h1>
                    <p className="text-gray-500 font-medium">Update details for {formData.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Product Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-black text-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-medium cursor-pointer"
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
                        </div>

                        {/* Right: Image & Description */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                                <div className="space-y-4">
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-mono text-xs"
                                    />
                                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative group">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Image Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Product Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Update Product
                        </Button>
                        <Button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 border-none shadow-none"
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
