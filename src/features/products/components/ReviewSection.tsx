import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Review } from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { Star, Camera, Send, User as UserIcon, ThumbsUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ReviewSectionProps {
    productId: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
    const user = useAppSelector((state) => state.auth.user);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (selectedFiles.length + files.length > 3) {
            toast.error("Maximum 3 images allowed");
            return;
        }

        const newFiles = Array.from(files);
        setSelectedFiles(prev => [...prev, ...newFiles]);

        // Create local URLs for preview
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setReviewImages(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setReviewImages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (!productId) return;

        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', productId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews: Review[] = [];
            snapshot.docs.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
            });
            setReviews(fetchedReviews);
        });

        return () => unsubscribe();
    }, [productId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to post a review");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        setIsSubmitting(true);
        setUploading(true);

        try {
            // Uplod to Cloudinary
            const { productService } = await import('../../../services/productService');
            const uploadedUrls = [];

            if (selectedFiles.length > 0) {
                toast.loading("Synchronizing Images with Cloudinary...", { id: 'upload' });
                for (const file of selectedFiles) {
                    const url = await productService.uploadImage(file);
                    uploadedUrls.push(url);
                }
                toast.success("Visual Data Secured!", { id: 'upload' });
            }

            const reviewData = {
                productId,
                userId: user.uid,
                userName: user.displayName || 'Anonymous User',
                userPhoto: user.photoURL || '',
                rating,
                comment: comment.trim(),
                images: uploadedUrls,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'reviews'), reviewData);

            toast.success("Review posted successfully!");
            setComment('');
            setReviewImages([]);
            setSelectedFiles([]);
            setShowForm(false);
        } catch (error: any) {
            console.error("REVIEW ERROR:", error);
            toast.error("Failed to post review", {
                description: error.message || "Registry synchronization timeout. Check network."
            });
        } finally {
            setIsSubmitting(false);
            setUploading(false);
        }
    };

    return (
        <div className="mt-16 pt-16 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic flex items-center gap-3">
                        Customer Reviews
                        <span className="text-sm font-bold text-gray-400 normal-case italic not-italic">({reviews.length} Ratings)</span>
                    </h2>
                    <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= 4.5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {!showForm && (
                    <button
                        onClick={() => user ? setShowForm(true) : toast.error("Please login to write a review")}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
                    >
                        Rate Product
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 p-6 md:p-8 rounded-3xl mb-12 border border-gray-100"
                    >
                        <form onSubmit={handleSubmitReview}>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Rate it:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="focus:outline-none transition-transform hover:scale-125"
                                        >
                                            <Star className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us about the quality, fit, and style..."
                                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none min-h-[120px] transition-all"
                            />

                            <div className="mt-6 space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {reviewImages.map((img, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(i)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {reviewImages.length < 3 && (
                                        <label className="w-20 h-20 rounded-xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-200 transition-all group">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            <Camera className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                            <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Add Photo</span>
                                        </label>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-center pt-2">
                                    <div className="flex-1 flex items-center gap-3">
                                        {uploading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">Syncing Items...</span>
                                            </div>
                                        ) : (
                                            reviewImages.length < 3 && (
                                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-200 transition-all group">
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                                    <Camera className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-indigo-600 uppercase">Add Photo</span>
                                                </label>
                                            )
                                        )}
                                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic hidden md:block">
                                            Instant DB Sync Active
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setReviewImages([]);
                                            }}
                                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isSubmitting || uploading}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100"
                                        >
                                            {isSubmitting ? 'Posting...' : <><Send className="w-3.5 h-3.5" /> Submit Review</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8">
                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-black uppercase tracking-widest text-sm">No Reviews Yet</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Be the first to share your experience!</p>
                    </div>
                ) : (
                    reviews.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white group"
                        >
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 overflow-hidden">
                                    {review.userPhoto ? (
                                        <img src={review.userPhoto} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-600 text-xs font-black uppercase">{review.userName?.[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{review.userName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`w-2.5 h-2.5 ${s <= (review.rating || 0) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-300 hover:text-indigo-600 transition-colors flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">Helpful</span>
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic font-medium">"{review.comment}"</p>

                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2">
                                            {review.images.map((img, i) => (
                                                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer">
                                                    <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 border-b border-gray-50"></div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
