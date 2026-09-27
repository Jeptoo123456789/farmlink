import React from 'react';
import { ShieldCheck, Truck, RefreshCw, PhoneCall, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register', defaultRole?: 'buyer' | 'seller') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Trust Proposition Bar */}
      <div className="border-b border-stone-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-100">Direct From Verified Farmers</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Every grower is identity and farm verified for quality.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-100">Fast Harvest-To-Door Logistics</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Harvested fresh upon order confirmation to maximize shelf life.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-100">Transparent & Fair Pricing</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">No predatory broker margins. Farmers keep up to 92% of earnings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-lg font-bold text-white">
              <span className="text-emerald-400">Farm</span>
              <span>Link</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Empowering regional farmers and connecting households, markets, and culinary businesses directly with the source of fresh food.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Regional Agricultural Exchange Center</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>support@farmlink.market</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+1 (800) 412-FARM</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-stone-100 uppercase">Produce Marketplace</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  All Harvest Listings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Heirloom Vegetables
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Fresh Orchard Fruits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Pasture-Raised Dairy & Eggs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Whole Farm Grains & Cereals
                </button>
              </li>
            </ul>
          </div>

          {/* For Farmers & Buyers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-stone-100 uppercase">Platform & Producers</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenAuth('register', 'seller')} className="hover:text-emerald-400 transition-colors">
                  Become a Verified Seller
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  How Direct Sourcing Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  About Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  Customer & Farmer Support
                </button>
              </li>
            </ul>
          </div>

          {/* Seller Enrollment CTA Card */}
          <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-3">
            <h4 className="text-xs font-semibold text-stone-100">Are you an agricultural producer?</h4>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Eliminate middlemen and set your own harvest prices with direct access to hundreds of verified buyers.
            </p>
            <button
              onClick={() => onOpenAuth('register', 'seller')}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors text-center shadow-sm"
            >
              Start Selling Produce
            </button>
          </div>
        </div>

        {/* Quiet Copyright Row */}
        <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} FarmLink Agricultural Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-stone-400 cursor-pointer">Produce Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
