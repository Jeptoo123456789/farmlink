import { Router } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

router.get('/dashboard', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    const user = req.user!;

    if (user.role === 'seller') {
      const sellerProducts = db.products.filter(p => p.seller_id === user.id);
      const activeListings = sellerProducts.filter(p => p.is_available && p.stock_quantity > 0);
      const sellerOrders = db.orders.filter(o => o.seller_id === user.id);

      const pendingOrders = sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing');
      const completedOrders = sellerOrders.filter(o => o.status === 'completed');

      const totalSales = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);

      const recentOrders = [...sellerOrders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      return res.json({
        role: 'seller',
        stats: {
          totalProducts: sellerProducts.length,
          activeListings: activeListings.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          totalSales: parseFloat(totalSales.toFixed(2)),
          totalOrders: sellerOrders.length,
        },
        recentOrders,
      });
    } else {
      // Buyer stats
      const buyerOrders = db.orders.filter(o => o.buyer_id === user.id);
      const pendingOrders = buyerOrders.filter(o => o.status === 'pending' || o.status === 'processing');
      const completedOrders = buyerOrders.filter(o => o.status === 'completed');
      const favoritesCount = db.favorites.filter(f => f.user_id === user.id).length;

      const recentOrders = [...buyerOrders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      return res.json({
        role: 'buyer',
        stats: {
          totalOrders: buyerOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          favoriteProducts: favoritesCount,
        },
        recentOrders,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

export default router;
