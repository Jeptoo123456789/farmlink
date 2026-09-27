import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Heart,
  MessageSquare,
  XCircle,
  Truck,
  Settings,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { Order, Product, DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

interface BuyerDashboardProps {
  onSelectProduct: (id: string) => void;
  onContactSeller: (sellerId: string, productId?: string, productTitle?: string) => void;
  onBrowseMarketplace: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  onSelectProduct,
  onContactSeller,
  onBrowseMarketplace,
}) => {
  const { user, getAuthHeaders, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'profile'>('orders');
  const [stats, setStats] = useState<DashboardStats['stats']>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile edit form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, favRes] = await Promise.all([
        fetch('/api/stats/dashboard', { headers: getAuthHeaders() }),
        fetch('/api/orders', { headers: getAuthHeaders() }),
        fetch('/api/products/user/favorites', { headers: getAuthHeaders() }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData.favorites || []);
      }
    } catch (err) {
      console.error('Failed to load buyer dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to cancel order.', 'error');
        return;
      }

      showToast('Order has been cancelled.', 'info');
      await loadDashboardData();
    } catch (err) {
      showToast('Could not cancel order.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfile({ name, phone, address, location, bio });

    if (currentPassword && newPassword) {
      try {
        const passRes = await fetch('/api/auth/password', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        });
        const passData = await passRes.json();
        if (passRes.ok) {
          showToast('Password updated.', 'success');
          setCurrentPassword('');
          setNewPassword('');
        } else {
          showToast(passData.error || 'Failed to update password.', 'error');
        }
      } catch (err) {
        showToast('Error changing password.', 'error');
      }
    }
    setIsUpdatingProfile(false);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-amber-800 bg-amber-50 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Confirmation
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-sky-800 bg-sky-50 border border-sky-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Farmer Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Package className="w-3 h-3" /> Harvesting & Packing
          </span>
        );
      case 'ready':
        return (
          <span className="text-indigo-800 bg-indigo-50 border border-indigo-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case 'completed':
        return (
          <span className="text-emerald-950 bg-emerald-100 border border-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-rose-800 bg-rose-50 border border-rose-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Buyer Account</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your agricultural orders, favorites, and delivery addresses.
          </p>
        </div>

        <button
          onClick={onBrowseMarketplace}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold self-start sm:self-auto shadow-xs"
        >
          Browse Fresh Produce
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Total Orders Placed</div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.totalOrders || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Active & Pending</div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {stats.pendingOrders || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Completed Deliveries</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {stats.completedOrders || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Saved Produce</div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.favoriteProducts || favorites.length}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'orders'
              ? 'text-emerald-800'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders ({orders.length})
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-800 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'favorites'
              ? 'text-emerald-800'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Saved Produce ({favorites.length})
          {activeTab === 'favorites' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-800 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'profile'
              ? 'text-emerald-800'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Profile & Address Settings
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-800 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-900 text-sm">No orders placed yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore local harvests from verified farmers and experience farm-to-table freshness.
              </p>
              <button
                onClick={onBrowseMarketplace}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900">{order.order_number}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-600">Farmer: {order.seller_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="font-bold text-stone-900 tabular-nums">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items & Actions */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between gap-6">
                  {/* Item List */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {item.product_title}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {item.quantity} {item.unit}s @ ${item.unit_price.toFixed(2)} / {item.unit}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                      <strong>Delivery to:</strong> {order.shipping_address} (Tel: {order.phone})
                      {order.notes && <div><strong>Notes:</strong> {order.notes}</div>}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col justify-between gap-2 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                    <button
                      onClick={() => onContactSeller(order.seller_id, undefined, `Order #${order.order_number}`)}
                      className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message Farmer
                    </button>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-900 text-sm">No saved harvest items</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click the heart icon on any produce listing to quickly find it here for weekly orders.
              </p>
              <button
                onClick={onBrowseMarketplace}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                  onFavoriteChange={() => loadDashboardData()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 max-w-2xl">
          <h2 className="text-base font-bold text-stone-900 mb-4">Edit Profile & Delivery Address</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Area / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Default Delivery Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Change Password (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
