/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { MessagesPage } from './pages/MessagesPage';
import { StaticPages } from './pages/StaticPages';

function AppContent() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [marketplaceCategory, setMarketplaceCategory] = useState<string | undefined>(undefined);

  // Messaging navigation context
  const [messagingContext, setMessagingContext] = useState<{
    recipientId?: string;
    productId?: string;
    productTitle?: string;
    initialText?: string;
  }>({});

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authDefaultRole, setAuthDefaultRole] = useState<'buyer' | 'seller'>('buyer');
  const [addProductRequested, setAddProductRequested] = useState(false);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, selectedProductId]);

  const handleNavigate = (tab: string, categoryFilter?: string) => {
    if (tab === 'seller-dashboard') {
      if (!user) {
        setAuthMode('login');
        setAuthDefaultRole('seller');
        setIsAuthOpen(true);
        showToast('Please sign in to access the Farmer Dashboard.', 'info');
        return;
      }
      if (user.role !== 'seller') {
        showToast('Access restricted to verified farmers and agricultural producers.', 'error');
        return;
      }
    }

    if (tab === 'buyer-dashboard') {
      if (!user) {
        setAuthMode('login');
        setAuthDefaultRole('buyer');
        setIsAuthOpen(true);
        showToast('Please sign in to view your orders.', 'info');
        return;
      }
    }

    if (tab === 'messages') {
      if (!user) {
        setAuthMode('login');
        setIsAuthOpen(true);
        showToast('Please sign in to view your messages.', 'info');
        return;
      }
    }

    if (categoryFilter) {
      setMarketplaceCategory(categoryFilter);
    }

    setSelectedProductId(null);
    setCurrentTab(tab);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentTab('product-detail');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'buyer' | 'seller' = 'buyer') => {
    setAuthMode(mode);
    setAuthDefaultRole(role);
    setIsAuthOpen(true);
  };

  const handleAddProduct = () => {
    if (!user) {
      handleOpenAuth('login', 'seller');
      showToast('Sign in as a farmer to add produce.', 'info');
      return;
    }
    if (user.role !== 'seller') {
      showToast('Only farmer accounts can add produce listings.', 'error');
      return;
    }

    setSelectedProductId(null);
    setCurrentTab('seller-dashboard');
    setAddProductRequested(true);
  };

  const handleContactFarmer = (sellerId: string, productId?: string, productTitle?: string) => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setMessagingContext({
      recipientId: sellerId,
      productId,
      productTitle,
      initialText: productTitle ? `Hello! I have a question regarding "${productTitle}".` : undefined,
    });
    setCurrentTab('messages');
  };

  const handleContactBuyer = (buyerId: string, productId?: string, initialText?: string) => {
    setMessagingContext({
      recipientId: buyerId,
      productId,
      initialText,
    });
    setCurrentTab('messages');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans selection:bg-emerald-700 selection:text-white">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onAddProduct={handleAddProduct}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplacePage
            initialCategory={marketplaceCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'product-detail' && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => handleNavigate('marketplace')}
            onSelectProduct={handleSelectProduct}
            onContactSeller={handleContactFarmer}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onBack={() => handleNavigate('marketplace')}
            onOrderSuccess={(orderId) => {
              handleNavigate('buyer-dashboard');
            }}
          />
        )}

        {currentTab === 'buyer-dashboard' && (
          <BuyerDashboard
            onSelectProduct={handleSelectProduct}
            onContactSeller={handleContactFarmer}
            onBrowseMarketplace={() => handleNavigate('marketplace')}
          />
        )}

        {currentTab === 'seller-dashboard' && (
          <SellerDashboard
            onContactBuyer={handleContactBuyer}
            onSelectProduct={handleSelectProduct}
            addProductRequested={addProductRequested}
            onAddProductRequestHandled={() => setAddProductRequested(false)}
          />
        )}

        {currentTab === 'messages' && (
          <MessagesPage
            initialRecipientId={messagingContext.recipientId}
            initialProductId={messagingContext.productId}
            initialProductTitle={messagingContext.productTitle}
            initialText={messagingContext.initialText}
            onBack={() => handleNavigate('home')}
          />
        )}

        {(currentTab === 'how-it-works' || currentTab === 'about' || currentTab === 'contact') && (
          <StaticPages
            page={currentTab as 'how-it-works' | 'about' | 'contact'}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          if (!user) {
            handleOpenAuth('login');
          } else {
            handleNavigate('checkout');
          }
        }}
        onContinueShopping={() => handleNavigate('marketplace')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        defaultRole={authDefaultRole}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
