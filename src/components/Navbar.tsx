import React, { useState } from 'react';
import { ShoppingBag, User, LogOut, Menu, X, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register', defaultRole?: 'buyer' | 'seller') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-emerald-950 focus:outline-none"
          >
            <span className="text-emerald-700">Farm</span>
            <span>Link</span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  currentTab === link.id
                    ? 'text-emerald-800 font-semibold'
                    : 'hover:text-stone-900'
                }`}
              >
                {link.label}
                {currentTab === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-700 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Authenticated User or Login CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {user.role === 'seller' ? 'Farmer' : 'Buyer'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick(user.role === 'seller' ? 'seller-dashboard' : 'buyer-dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                      {user.role === 'seller' ? 'Farmer Dashboard' : 'My Orders & Dashboard'}
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('messages');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      Direct Messages
                    </button>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-lg transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Join FarmLink
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                currentTab === link.id
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {user ? (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <button
                onClick={() => handleNavClick(user.role === 'seller' ? 'seller-dashboard' : 'buyer-dashboard')}
                className="w-full text-left px-3 py-2 text-sm text-emerald-800 font-medium hover:bg-stone-50 rounded-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.role === 'seller' ? 'Farmer Dashboard' : 'Buyer Dashboard'}
              </button>
              <button
                onClick={() => handleNavClick('messages')}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-medium text-stone-700 border border-stone-200 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-medium text-white bg-emerald-800 rounded-lg"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
