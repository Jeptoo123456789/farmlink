import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, X, RefreshCw, Sprout } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MarketplacePageProps {
  initialCategory?: string;
  onSelectProduct: (productId: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  initialCategory,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Update initialCategory if prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Load products based on filters
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (location.trim()) params.append('location', location.trim());
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (organicOnly) params.append('organic', 'true');
      if (inStockOnly) params.append('available', 'true');
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, location, minPrice, maxPrice, organicOnly, inStockOnly, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setOrganicOnly(false);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== 'all' ||
    location ||
    minPrice ||
    maxPrice ||
    organicOnly ||
    inStockOnly ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header & Search Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-display">
              Produce Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Live farm harvest inventory directly from verified agricultural producers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(prev => !prev)}
              className="lg:hidden px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              Filters {hasActiveFilters && '•'}
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-stone-500 hidden sm:inline whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-800 focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="newest">Newest Harvest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="oldest">Oldest Listings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fresh tomatoes, organic apples, pasture eggs, farm location..."
            className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            All Produce
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop and toggleable mobile) */}
        <aside
          className={`${
            showMobileFilters ? 'block' : 'hidden'
          } lg:block bg-white p-5 rounded-xl border border-stone-200 space-y-6 self-start`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-emerald-800 hover:underline font-medium"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Region / Farm Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-800">Farm Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Highland Valley"
              className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800">Price Range ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min ($)"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 tabular-nums"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max ($)"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 tabular-nums"
              />
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={e => setOrganicOnly(e.target.checked)}
                className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span>Organic Certified Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span>In-Stock Ready Now</span>
            </label>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => loadProducts()}
            className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3 space-y-4">
          {/* Results count & status */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong className="text-stone-900 tabular-nums">{products.length}</strong> farm produce items
            </span>
            {hasActiveFilters && (
              <span className="text-stone-400">Filters applied</span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 bg-white rounded-xl border border-stone-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
                <Sprout className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-semibold text-stone-900">No farm produce matches your criteria</h3>
                <p className="text-xs text-stone-500">
                  Try adjusting or clearing your filters, keywords, or price thresholds to explore more seasonal items.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
