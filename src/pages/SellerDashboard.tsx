import React, { useState, useEffect, useCallback } from 'react';
import {
  Sprout,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  MessageSquare,
  X,
  MapPin,
  Check,
  AlertCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { Product, Order, Category, UnitType, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SellerDashboardProps {
  onContactBuyer: (buyerId: string, productId?: string, initialText?: string) => void;
  onSelectProduct: (id: string) => void;
  addProductRequested: boolean;
  onAddProductRequestHandled: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onContactBuyer,
  onSelectProduct,
  addProductRequested,
  onAddProductRequestHandled,
}) => {
  const { user, getAuthHeaders, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState(user?.location || '');
  const [imageUrl, setImageUrl] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Farm Profile state
  const [farmName, setFarmName] = useState(user?.name || '');
  const [farmPhone, setFarmPhone] = useState(user?.phone || '');
  const [farmLocation, setFarmLocation] = useState(user?.location || '');
  const [farmAddress, setFarmAddress] = useState(user?.address || '');
  const [farmBio, setFarmBio] = useState(user?.bio || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, catRes] = await Promise.all([
        fetch('/api/stats/dashboard', { headers: getAuthHeaders() }),
        fetch(`/api/products?sellerId=${user?.id}`, { headers: getAuthHeaders() }),
        fetch('/api/orders?role=seller', { headers: getAuthHeaders() }),
        fetch('/api/categories'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});
      }
      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(prodData.products || []);
      }
      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        setOrders(ordData.orders || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (addProductRequested && !isLoading) {
      openAddModal();
      onAddProductRequestHandled();
    }
  }, [addProductRequested, isLoading, onAddProductRequestHandled]);

  const openAddModal = () => {
    setEditingProductId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setUnit('kg');
    setStockQuantity('');
    setCategoryId(categories[0]?.id || 'cat_vegetables');
    setLocation(user?.location || 'Organic Valley');
    setImageUrl('/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg');
    setIsOrganic(true);
    setHarvestDate(new Date().toISOString().split('T')[0]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setUnit(prod.unit);
    setStockQuantity(prod.stock_quantity.toString());
    setCategoryId(prod.category_id);
    setLocation(prod.location);
    setImageUrl(prod.image_url);
    setIsOrganic(prod.is_organic);
    setHarvestDate(prod.harvest_date);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !stockQuantity || !categoryId) {
      showToast('Please fill in all required crop fields.', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(Number(price).toFixed(2)),
        unit,
        stock_quantity: parseInt(stockQuantity, 10),
        category_id: categoryId,
        location: location.trim(),
        image_url: imageUrl,
        is_organic: isOrganic,
        harvest_date: harvestDate,
        is_available: parseInt(stockQuantity, 10) > 0,
      };

      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save product.', 'error');
      } else {
        showToast(editingProductId ? 'Listing updated.' : 'New harvest produce listed successfully!', 'success');
        setIsProductModalOpen(false);
        await loadData();
      }
    } catch (err) {
      showToast('Network error saving produce.', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this produce listing?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast('Produce listing removed.', 'info');
        await loadData();
      } else {
        showToast('Failed to delete listing.', 'error');
      }
    } catch (err) {
      showToast('Could not delete product.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update order status.', 'error');
      } else {
        showToast(`Order status updated to "${newStatus}".`, 'success');
        await loadData();
      }
    } catch (err) {
      showToast('Could not update status.', 'error');
    }
  };

  const handleSaveFarmProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({
      name: farmName,
      phone: farmPhone,
      location: farmLocation,
      address: farmAddress,
      bio: farmBio,
    });
    setIsSavingProfile(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">Farmer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
            {user?.name} Farm Operations
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your harvest listings, fulfill incoming wholesale & consumer orders.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          List New Harvest
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Total Listings</div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.totalProducts || products.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Active Harvests</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {stats.activeListings || products.filter(p => p.is_available).length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Pending Orders</div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {stats.pendingOrders || orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Delivered Orders</div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.completedOrders || orders.filter(o => o.status === 'completed').length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="text-xs text-stone-500 font-medium">Total Earnings</div>
          <div className="text-2xl font-bold text-emerald-950 tabular-nums">
            ${(stats.totalSales || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'products'
              ? 'text-emerald-800'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          My Produce Inventory ({products.length})
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-800 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'orders'
              ? 'text-emerald-800'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Incoming Orders ({orders.length})
          {activeTab === 'orders' && (
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
          <MapPin className="w-4 h-4" />
          Farm Verification & Profile
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-800 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab: Products Inventory */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <Sprout className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-900 text-sm">No produce listings yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add your current harvests, vegetables, fruits, eggs, or grains to start receiving direct orders.
              </p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                List Your First Crop
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Produce</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Harvest Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                            />
                            <div>
                              <div
                                onClick={() => onSelectProduct(prod.id)}
                                className="font-semibold text-stone-900 cursor-pointer hover:text-emerald-800 hover:underline truncate max-w-xs"
                              >
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                {prod.is_organic ? 'Organic Certified' : 'Conventional'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">{prod.category_name}</td>
                        <td className="p-3.5 font-bold text-stone-900 tabular-nums">
                          ${prod.price.toFixed(2)} / {prod.unit}
                        </td>
                        <td className="p-3.5 tabular-nums">
                          <span
                            className={
                              prod.stock_quantity === 0
                                ? 'text-rose-600 font-semibold'
                                : 'text-stone-800 font-medium'
                            }
                          >
                            {prod.stock_quantity} {prod.unit}s
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-500 tabular-nums">{prod.harvest_date}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                              prod.is_available && prod.stock_quantity > 0
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {prod.is_available && prod.stock_quantity > 0 ? 'Active' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            aria-label="Edit produce"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Delete produce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-900 text-sm">No incoming orders yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                As buyers order your produce on the marketplace, requests with delivery destinations will appear here.
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs"
              >
                {/* Header */}
                <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900">{order.order_number}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-700">Buyer: <strong>{order.buyer_name}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status updater dropdown */}
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={`order-status-${order.id}`} className="text-stone-500">Status:</label>
                      <select
                        id={`order-status-${order.id}`}
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                          order.status === 'pending'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : order.status === 'confirmed'
                            ? 'bg-sky-50 text-sky-900 border-sky-300'
                            : order.status === 'processing'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : order.status === 'ready'
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                            : order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing / Harvest</option>
                        <option value="ready">Ready for Dispatch</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <span className="font-bold text-stone-900 tabular-nums">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items & Buyer Contact */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-stone-800 font-medium">
                            {item.quantity} {item.unit}s × {item.product_title}
                          </span>
                          <span className="text-stone-900 font-semibold tabular-nums">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-stone-500 pt-3 border-t border-stone-100 space-y-1">
                      <div>
                        <strong>Destination Address:</strong> {order.shipping_address}
                      </div>
                      <div>
                        <strong>Buyer Telephone:</strong> {order.phone} ({order.buyer_email})
                      </div>
                      {order.notes && (
                        <div>
                          <strong>Buyer Instructions:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                    <button
                      onClick={() => onContactBuyer(order.buyer_id, undefined, `Regarding order #${order.order_number}`)}
                      className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat With Buyer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Farm Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 max-w-2xl">
          <h2 className="text-base font-bold text-stone-900 mb-1">Farm Verification & Public Profile</h2>
          <p className="text-xs text-stone-500 mb-4">
            This information is shown to buyers on your produce listings and marketplace profile.
          </p>

          <form onSubmit={handleSaveFarmProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Farm or Producer Business Name
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={e => setFarmName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Farmer Contact Phone</label>
                <input
                  type="tel"
                  value={farmPhone}
                  onChange={e => setFarmPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Agricultural Region / District</label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={e => setFarmLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Farm Physical Address</label>
              <input
                type="text"
                value={farmAddress}
                onChange={e => setFarmAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Farming Practices & Story
              </label>
              <textarea
                rows={3}
                value={farmBio}
                onChange={e => setFarmBio(e.target.value)}
                placeholder="Explain your soil care, harvesting techniques, heirloom seeds, or organic certifications..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving...' : 'Save Farm Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add / Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden my-8">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Harvest Inventory
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  {editingProductId ? 'Edit Produce Listing' : 'List New Farm Harvest'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Produce Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Crisp Mountain Orchard Apples"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="produce-category" className="block text-xs font-medium text-stone-700 mb-1">Category *</label>
                  <select
                    id="produce-category"
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="produce-unit" className="block text-xs font-medium text-stone-700 mb-1">Unit of Measure *</label>
                  <select
                    id="produce-unit"
                    value={unit}
                    onChange={e => setUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="kg">Per Kilogram (kg)</option>
                    <option value="crate">Per Crate</option>
                    <option value="bundle">Per Bundle</option>
                    <option value="box">Per Box</option>
                    <option value="bag">Per Bag</option>
                    <option value="litre">Per Litre</option>
                    <option value="piece">Per Piece</option>
                    <option value="tonne">Per Tonne</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Price per Unit ($) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="4.50"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Available Stock ({unit}s) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Farm Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe freshness, seed variety, packaging, and recommended uses..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Photo selector from generated assets */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Produce Photography</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    '/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg',
                    '/src/assets/images/farmlink_produce_fruits_1790495425799.jpg',
                    '/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg',
                    '/src/assets/images/farmlink_hero_produce_1790495404243.jpg',
                  ].map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === img ? 'border-emerald-700 ring-2 ring-emerald-700/30' : 'border-stone-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      {imageUrl === img && (
                        <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organic toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={e => setIsOrganic(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="font-semibold text-stone-900">Naturally grown / Certified Organic</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isSavingProduct ? 'Saving Produce...' : editingProductId ? 'Save Changes' : 'Publish Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
