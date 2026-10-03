import React, { useState } from 'react';
import { Heart, Plus, Star, MapPin, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onFavoriteChange?: (productId: string, isFavorited: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onFavoriteChange,
}) => {
  const { addToCart } = useCart();
  const { user, getAuthHeaders } = useAuth();
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState<boolean>(Boolean(product.is_favorited));
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const createdAt = Date.parse(product.created_at);
  const isNewProduct = Number.isFinite(createdAt) && Date.now() - createdAt >= 0 && Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save favorite produce.', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/favorite`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.is_favorited);
        if (onFavoriteChange) {
          onFavoriteChange(product.id, data.is_favorited);
        }
        showToast(data.message, 'success');
      }
    } catch (err) {
      showToast('Could not update favorites.', 'error');
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group flex flex-col bg-white rounded-xl border border-stone-200/90 overflow-hidden cursor-pointer hover:border-emerald-600/40 hover:shadow-lg transition-all duration-200"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image_url}
            alt={product.title}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center">
            <span className="text-xs font-medium text-stone-500">{product.title}</span>
            <span className="text-[11px] text-stone-400 mt-1">Farm Direct</span>
          </div>
        )}

        {isNewProduct && (
          <span className="absolute left-2.5 top-2.5 rounded bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-950 shadow-sm">
            New
          </span>
        )}

        {/* Favorite Action Button */}
        <button
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/90 backdrop-blur-sm text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quiet Organic and Stock indicators */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          {product.is_organic && (
            <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded tracking-wide">
              Organic
            </span>
          )}
          {!product.is_available || product.stock_quantity === 0 ? (
            <span className="bg-stone-900/85 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded">
              Out of stock
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <span>{product.category_name}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
              <span className="truncate">{product.location.split(',')[0]}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1">
            {product.title}
          </h3>

          {/* Farmer & Rating line */}
          <div className="flex items-center justify-between mt-1 text-xs text-stone-500">
            <span className="truncate">by {product.seller_name}</span>
            <span className="flex items-center gap-0.5 text-amber-700 font-medium tabular-nums shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
              <span className="text-stone-400 text-[11px]">({product.reviews_count})</span>
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-stone-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 font-normal">
                / {product.unit}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 tabular-nums">
              {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit} available` : 'Sold out'}
            </p>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.is_available || product.stock_quantity <= 0 || isAdding}
            aria-label={`Add ${product.title} to cart`}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              !product.is_available || product.stock_quantity <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white active:scale-95'
            }`}
          >
            {isAdding ? (
              <Check className="w-4 h-4 animate-in fade-in" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
