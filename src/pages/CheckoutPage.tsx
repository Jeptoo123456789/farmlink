import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, MapPin, Phone, FileText, CheckCircle2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const { items, subtotal, refreshCart } = useCart();
  const { user, getAuthHeaders } = useAuth();
  const { showToast } = useToast();

  const [shippingAddress, setShippingAddress] = useState(user?.address || user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !phone.trim()) {
      showToast('Please provide your complete delivery address and contact phone.', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your basket is empty.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          shipping_address: shippingAddress.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to place order.', 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Order successfully confirmed and dispatched to farmer!', 'success');
      await refreshCart();
      const primaryOrderId = data.primaryOrder ? data.primaryOrder.id : '';
      onOrderSuccess(primaryOrderId);
    } catch (err) {
      showToast('Error placing order. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Your basket is empty</h2>
        <p className="text-xs text-stone-500">Add fresh farm produce to proceed to checkout.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
          Complete Harvest Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review your items and provide destination details for the direct farm dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Truck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Delivery Destination
            </h2>
          </div>

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Contact Phone (For Driver/Farmer Coordination) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Delivery Street Address & Unit *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Street name, building number, suite/apt, neighborhood or landmark..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Special Delivery or Packaging Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Leave in shaded crate on porch, call 10 mins before arrival..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </form>

          {/* Payment Terms Note */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Direct Inspection & Verified Settlement</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              To guarantee absolute freshness, payment is finalized via instant mobile transfer or cash upon driver handoff and produce inspection.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Order Summary
            </h2>
            <span className="text-xs text-stone-500 tabular-nums">({items.length} items)</span>
          </div>

          {/* Itemized List */}
          <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.product?.image_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {item.product?.title}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {item.quantity} × ${item.product?.price.toFixed(2)} / {item.product?.unit}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-stone-900 tabular-nums shrink-0">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Calculation */}
          <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Produce Subtotal</span>
              <span className="font-semibold text-stone-900 tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Direct Logistics</span>
              <span className="font-semibold text-emerald-800">Included (Free Farm Link)</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-900">Total Order</span>
              <span className="text-xl font-bold text-emerald-950 tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming with Farmer...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Place Direct Farm Order (${subtotal.toFixed(2)})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
