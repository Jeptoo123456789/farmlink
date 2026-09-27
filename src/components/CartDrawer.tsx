import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const {
    items,
    subtotal,
    itemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base font-bold text-stone-900">Your Fresh Basket</h2>
              <span className="text-xs text-stone-500 tabular-nums">({itemCount} items)</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">Your basket is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Discover fresh vegetables, fruits, eggs, and grains directly from local farmers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onContinueShopping();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3.5 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.title || 'Produce item'}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {item.product?.title}
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            ${item.product?.price.toFixed(2)} / {item.product?.unit} ·{' '}
                            <span className="text-stone-400">{item.product?.seller_name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-md">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="p-1 text-stone-600 hover:bg-stone-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium tabular-nums text-stone-800 min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock_quantity || 99)}
                            className="p-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 text-right">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors underline"
                  >
                    Clear entire basket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Produce Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Farm Direct Delivery</span>
                  <span className="font-medium text-emerald-700">Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-stone-900">Estimated Total</span>
                <span className="text-lg font-bold text-emerald-950 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-stone-400">
                Direct bank, mobile money, or cash on harvest inspection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
