import React, { useState } from 'react';
import { ShieldCheck, Truck, RefreshCw, Sprout, Heart, Users, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StaticPagesProps {
  page: 'how-it-works' | 'about' | 'contact';
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'seller') => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onNavigate, onOpenAuth }) => {
  const { showToast } = useToast();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      showToast('Thank you! Your message has been routed to our regional farm support team.', 'success');
      setInquiryName('');
      setInquiryEmail('');
      setInquirySubject('');
      setInquiryMessage('');
      setIsSubmitting(false);
    }, 600);
  };

  if (page === 'how-it-works') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Direct Sourcing Guide</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-display">
            How FarmLink Reinvents Agricultural Trade
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            By connecting local farmers directly with consumers and culinary businesses, we eliminate multi-tier broker markups, reduce food waste, and deliver fresh harvest produce within hours.
          </p>
        </div>

        <div className="space-y-12">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-800">STEP 01</span>
              <h2 className="text-xl font-bold text-stone-900">Farmers List Their Current Harvest</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Growers specify their crop varieties, soil care practices, harvest dates, available quantities, and transparent farm gate prices. Every producer undergoes identity and location verification.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero broker commissions deducted</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Farmers set their own fair market prices</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Accurate harvest tracking to prevent food spoilage</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs order-2 md:order-1">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Heirloom, organic, and conventional filtering</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Real-time stock validation and quantity steppers</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Direct in-app messaging with the actual grower</span>
              </div>
            </div>
            <div className="space-y-3 order-1 md:order-2">
              <span className="text-xs font-bold text-emerald-800">STEP 02</span>
              <h2 className="text-xl font-bold text-stone-900">Buyers Discover & Order In Minutes</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Whether you need a weekly 2kg basket of heirloom tomatoes for home or 50 crates of apples for a restaurant, browse real-time inventory with full traceability down to the farm plot.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-800">STEP 03</span>
              <h2 className="text-xl font-bold text-stone-900">Harvest Upon Order & Rapid Dispatch</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Unlike supermarket produce stored for weeks in cold-storage warehouses, FarmLink items are harvested and packed immediately upon order confirmation.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Harvest-to-door timeline under 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Inspect produce quality upon arrival</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Leave verified reviews to support quality growers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            Explore Today's Harvests
          </button>
        </div>
      </div>
    );
  }

  if (page === 'about') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Our Mission</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-display">
            Restoring Dignity to Farmers & Freshness to Tables
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            FarmLink was founded to solve a broken food system where growers do the hardest work yet capture the least value, while consumers receive aging produce stripped of flavor and nutrients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <Sprout className="w-8 h-8 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Regenerative Agriculture</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We champion sustainable farmers who build living soil, practice crop rotation, and avoid harsh synthetic residues.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <Heart className="w-8 h-8 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Fair Economic Return</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              By removing up to 4 layers of middle brokers, farmers retain up to 92% of gross market proceeds to reinvest into their communities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <Users className="w-8 h-8 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Direct Community Bonds</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Buyers know exactly whose hands nurtured their food. Direct messaging fosters mutual accountability and respect.
            </p>
          </div>
        </div>

        <div className="bg-stone-900 text-white p-8 sm:p-12 rounded-2xl space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display">Join the Direct Farm Movement</h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Whether you cultivate an orchard, manage a greenhouse, or simply crave clean vine-ripened produce, FarmLink is your digital agricultural commons.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('register', 'seller')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Register as Grower
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
            >
              Shop Produce
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Contact Page
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Get In Touch</span>
        <h1 className="text-3xl font-bold text-stone-900 font-display">Contact FarmLink Support</h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Our regional team assists farmers with onboardings, wholesale inquiries, and delivery logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Information */}
        <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Regional Exchange Hubs
          </h2>

          <div className="space-y-4 text-xs text-stone-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">Highland Agricultural Exchange</p>
                <p className="text-stone-500">44 Farmers Market Way, Suite 100</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">Email Assistance</p>
                <p className="text-stone-500">support@farmlink.market</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">Farmer Hotline</p>
                <p className="text-stone-500">+1 (800) 412-FARM (Mon-Sat, 6am - 6pm)</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 leading-relaxed">
            For questions about a specific order, you can also use the in-app chat directly with the farmer from your dashboard.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-base font-bold text-stone-900 mb-4">Send Us a Direct Message</h2>
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                  placeholder="e.g. Samuel Ochieng"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={e => setInquiryEmail(e.target.value)}
                  placeholder="samuel@example.com"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Inquiry Subject *</label>
              <input
                type="text"
                required
                value={inquirySubject}
                onChange={e => setInquirySubject(e.target.value)}
                placeholder="e.g. Bulk restaurant partnership / Farmer onboarding"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Your Message *</label>
              <textarea
                required
                rows={4}
                value={inquiryMessage}
                onChange={e => setInquiryMessage(e.target.value)}
                placeholder="How can our agricultural coordination team assist you?"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
