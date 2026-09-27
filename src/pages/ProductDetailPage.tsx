import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  MessageSquare,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Shield,
  Plus,
  Minus,
  User as UserIcon,
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onSelectProduct: (id: string) => void;
  onContactSeller: (sellerId: string, productId: string, productTitle: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onSelectProduct,
  onContactSeller,
  onOpenAuth,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { user, getAuthHeaders } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {};
        const token = localStorage.getItem('farmlink_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/products/${productId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
          setSelectedImage(data.product.image_url);
          setIsFavorited(Boolean(data.product.is_favorited));
          setQuantity(1);
        } else {
          showToast('Product not found.', 'error');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [productId, showToast]);

  const handleToggleFavorite = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!product) return;

    try {
      const res = await fetch(`/api/products/${product.id}/favorite`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.is_favorited);
        showToast(data.message, 'success');
      }
    } catch (err) {
      showToast('Could not update favorites.', 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }
    await addToCart(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!product || !comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to submit review.', 'error');
      } else {
        showToast('Thank you for your harvest review!', 'success');
        setReviews(prev => [data.review, ...prev]);
        setProduct(prev => (prev ? { ...prev, rating: data.productRating, reviews_count: data.reviewsCount } : null));
        setComment('');
      }
    } catch (err) {
      showToast('Error submitting review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 bg-stone-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/3] bg-stone-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Produce item not found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Showcase (sticky) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
            <img
              src={selectedImage || product.image_url}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.is_organic && (
              <span className="absolute top-4 left-4 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md tracking-wide">
                Certified Organic
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              aria-label="Toggle favorite"
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-emerald-700 ring-2 ring-emerald-700/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quality & Traceability Specs */}
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-stone-400">Harvest Date</div>
              <div className="font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                {product.harvest_date}
              </div>
            </div>
            <div>
              <div className="text-stone-400">Category</div>
              <div className="font-semibold text-stone-800 mt-0.5">{product.category_name}</div>
            </div>
            <div>
              <div className="text-stone-400">Packaging</div>
              <div className="font-semibold text-stone-800 mt-0.5">Standard {product.unit} pack</div>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
          {/* Unboxed Metadata Header */}
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>{product.category_name}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {product.location}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
              {product.title}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800 tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-stone-400">
                ({product.reviews_count} verified reviews)
              </span>
            </div>
          </div>

          {/* Price & Unit Display */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-medium">Direct Farm Gate Price</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-bold text-emerald-950 tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-emerald-800">
                  / {product.unit}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  product.is_available && product.stock_quantity > 0
                    ? 'text-emerald-800 bg-emerald-100'
                    : 'text-rose-800 bg-rose-100'
                }`}
              >
                {product.is_available && product.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
              </span>
              <div className="text-[11px] text-stone-500 mt-1 tabular-nums">
                {product.stock_quantity} {product.unit}s available
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Harvest Notes</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">Select Quantity ({product.unit}s):</label>
              <div className="flex items-center border border-stone-200 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold tabular-nums text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total calculation line */}
            <div className="flex justify-between items-baseline text-xs text-stone-500">
              <span>Item Total:</span>
              <span className="text-base font-bold text-stone-900 tabular-nums">
                ${(product.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Add To Cart CTA Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available || product.stock_quantity === 0}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Fresh Basket
            </button>

            {/* Contact Seller CTA */}
            <button
              onClick={() => onContactSeller(product.seller_id, product.id, product.title)}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              Contact Farmer {product.seller_name}
            </button>
          </div>

          {/* Farmer Card Summary */}
          <div className="pt-4 border-t border-stone-100 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
              {product.seller?.avatar_url ? (
                <img
                  src={product.seller.avatar_url}
                  alt={product.seller_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-emerald-800" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-stone-900 truncate">{product.seller_name}</span>
                <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {product.seller?.bio || 'Verified independent agricultural producer on FarmLink.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-display">Customer Harvest Reviews</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Authentic feedback from verified buyers who ordered this crop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
              {product.rating.toFixed(1)}
            </span>
            <div>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-stone-400 tabular-nums">
                Based on {reviews.length} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Submit Review Box */}
        <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Share Your Produce Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell others about produce freshness, aroma, packaging, or taste..."
              className="w-full p-3 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />

            <button
              type="submit"
              disabled={isSubmittingReview || !comment.trim()}
              className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Harvest Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="divide-y divide-stone-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No reviews yet for this harvest. Be the first to try and review it!
            </p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">{rev.user_name}</span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Produce Section */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 font-display">More From This Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
