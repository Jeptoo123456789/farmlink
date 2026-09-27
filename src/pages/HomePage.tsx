import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Shield, TrendingUp, Users, Sprout, Carrot, Apple, Egg, Wheat } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (tab: string, categoryFilter?: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register', defaultRole?: 'buyer' | 'seller') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onOpenAuth,
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=6'),
          fetch('/api/categories'),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setFeaturedProducts(data.products || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/farmlink_hero_produce_1790495404243.jpg"
            alt="Vibrant organic harvest on farm table"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl space-y-6">
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Direct Agricultural Exchange</span>
              <span aria-hidden="true">·</span>
              <span>100% Traceable</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-display">
              Fresh From the Farm.{' '}
              <span className="text-emerald-400">Directly to You.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-normal">
              Connect with trusted local farmers and source fresh, chemical-free agricultural produce at transparent prices—with zero middleman markups.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('marketplace')}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
              >
                Browse Harvest Marketplace
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenAuth('register', 'seller')}
                className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-semibold text-sm transition-all"
              >
                Become a Seller
              </button>
            </div>

            {/* Micro proof markers */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-stone-300">
              <div>
                <div className="font-bold text-white text-base sm:text-xl tabular-nums">480+</div>
                <div className="text-stone-400 text-[11px]">Verified Growers</div>
              </div>
              <div>
                <div className="font-bold text-white text-base sm:text-xl tabular-nums">100%</div>
                <div className="text-stone-400 text-[11px]">Fair Gate Prices</div>
              </div>
              <div>
                <div className="font-bold text-white text-base sm:text-xl tabular-nums">24h</div>
                <div className="text-stone-400 text-[11px]">Harvest-to-Door</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Explore Seasonal Harvests</h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            View All Categories
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('marketplace', cat.id)}
              className="p-5 bg-white rounded-xl border border-stone-200/90 hover:border-emerald-600/50 hover:shadow-md cursor-pointer transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                {cat.slug === 'vegetables' && <Carrot className="w-5 h-5" />}
                {cat.slug === 'fruits' && <Apple className="w-5 h-5" />}
                {cat.slug === 'dairy-eggs' && <Egg className="w-5 h-5" />}
                {cat.slug === 'cereals-grains' && <Wheat className="w-5 h-5" />}
                {!['vegetables', 'fruits', 'dairy-eggs', 'cereals-grains'].includes(cat.slug) && (
                  <Sprout className="w-5 h-5" />
                )}
              </div>
              <h3 className="font-semibold text-stone-900 text-sm group-hover:text-emerald-800 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between items-center text-[11px] text-stone-400">
                <span className="tabular-nums font-medium text-stone-600">
                  {cat.product_count !== undefined ? `${cat.product_count} listings` : 'Browse fresh'}
                </span>
                <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Peak Freshness</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Featured Farm Produce</h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            Explore All Produce
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-stone-100/70 border-y border-stone-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Transparent Model</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">How FarmLink Works</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              From the soil to your table with direct farmer contact and guaranteed quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200/90 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center tabular-nums">
                01
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Create an Account</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Sign up as a buyer (household, restaurant, or retailer) or register as a verified local producer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center tabular-nums">
                02
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Discover Fresh Harvests</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Browse real-time listings by category, harvest date, location, and farming method with clear prices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center tabular-nums">
                03
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Connect With Farmers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Use in-app messaging to discuss crop specs, packaging requirements, or schedule custom deliveries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center tabular-nums">
                04
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Order & Track</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Place secure orders and follow live dispatch updates as produce is freshly packed and delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-12 border border-stone-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Built for Agriculture</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">
              A Transparent Marketplace Built on Trust
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Conventional food supply chains force farmers to accept razor-thin margins while consumers pay inflated retail prices for produce that sat in warehouses for weeks. FarmLink restores the direct connection.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified seller accounts and farm location inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent gate pricing with no hidden broker markups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct messaging for questions, customized bulk orders & dispatch</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Quality Guarantee</h4>
              <p className="text-[11px] text-stone-400">
                Inspect produce upon harvest delivery with satisfaction protection.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Fair Farm Incomes</h4>
              <p className="text-[11px] text-stone-400">
                Farmers set their own prices and build long-term relationships.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <Users className="w-6 h-6 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Direct Communication</h4>
              <p className="text-[11px] text-stone-400">
                Chat directly with the exact person who grew your food.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Organic & Heritage</h4>
              <p className="text-[11px] text-stone-400">
                Find heirloom varieties that standard supermarket chains don't carry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-emerald-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              Are you a farmer or agricultural producer?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              List your harvest, set your own prices, and connect directly with thousands of verified household and commercial buyers.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth('register', 'seller')}
            className="py-3 px-6 bg-white text-emerald-950 font-bold text-xs sm:text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shrink-0 whitespace-nowrap"
          >
            Start Selling Produce
          </button>
        </div>
      </section>
    </div>
  );
};
