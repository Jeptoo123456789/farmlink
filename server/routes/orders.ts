import { Router } from 'express';
import { getDatabase, saveDatabase, Order, OrderItem, OrderStatus } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// POST create order (Checkout)
router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { shipping_address, phone, notes, items: directItems } = req.body;

    if (!shipping_address || !phone) {
      return res.status(400).json({ error: 'Shipping address and phone number are required.' });
    }

    const db = getDatabase();
    let orderCheckoutItems: { product_id: string; quantity: number }[] = [];

    if (Array.isArray(directItems) && directItems.length > 0) {
      orderCheckoutItems = directItems;
    } else {
      // Pull from user cart
      const cart = db.cart_items.filter(c => c.user_id === req.user!.id);
      if (cart.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty. Please add products first.' });
      }
      orderCheckoutItems = cart.map(c => ({ product_id: c.product_id, quantity: c.quantity }));
    }

    // Verify all products and stock
    const validatedItems: { product: any; quantity: number }[] = [];
    for (const item of orderCheckoutItems) {
      const product = db.products.find(p => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({ error: 'One or more items in your cart is no longer available.' });
      }
      if (!product.is_available || product.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} ${product.unit} left.`,
        });
      }
      validatedItems.push({ product, quantity: item.quantity });
    }

    // Group items by seller
    const sellerMap = new Map<string, typeof validatedItems>();
    for (const item of validatedItems) {
      const sellerId = item.product.seller_id;
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, []);
      }
      sellerMap.get(sellerId)!.push(item);
    }

    const createdOrders: Order[] = [];
    const timestamp = new Date().toISOString();

    for (const [sellerId, items] of sellerMap.entries()) {
      const seller = db.users.find(u => u.id === sellerId);
      const sellerName = seller ? seller.name : 'Farm Producer';
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderNumber = `FL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let sellerTotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const subtotal = parseFloat((item.product.price * item.quantity).toFixed(2));
        sellerTotal += subtotal;

        orderItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          order_id: orderId,
          product_id: item.product.id,
          product_title: item.product.title,
          image_url: item.product.image_url,
          unit_price: item.product.price,
          unit: item.product.unit,
          quantity: item.quantity,
          subtotal,
        });

        // Deduct inventory
        item.product.stock_quantity = Math.max(0, item.product.stock_quantity - item.quantity);
        if (item.product.stock_quantity === 0) {
          item.product.is_available = false;
        }
      }

      const newOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        buyer_id: req.user!.id,
        buyer_name: req.user!.name,
        buyer_email: req.user!.email,
        seller_id: sellerId,
        seller_name: sellerName,
        status: 'pending',
        total_amount: parseFloat(sellerTotal.toFixed(2)),
        shipping_address: shipping_address.trim(),
        phone: phone.trim(),
        notes: notes ? notes.trim() : undefined,
        items: orderItems,
        created_at: timestamp,
        updated_at: timestamp,
      };

      db.orders.unshift(newOrder);
      createdOrders.push(newOrder);
    }

    // Clear cart for this buyer
    db.cart_items = db.cart_items.filter(c => c.user_id !== req.user!.id);

    saveDatabase();

    return res.status(201).json({
      message: 'Order placed successfully!',
      orders: createdOrders,
      primaryOrder: createdOrders[0],
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to process order.' });
  }
});

// GET orders
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    const { role } = req.query;

    let orders: Order[] = [];
    if (role === 'seller' || req.user!.role === 'seller') {
      // Seller incoming orders
      orders = db.orders.filter(o => o.seller_id === req.user!.id);
    } else {
      // Buyer orders
      orders = db.orders.filter(o => o.buyer_id === req.user!.id);
    }

    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load orders.' });
  }
});

// GET single order
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const order = db.orders.find(o => o.id === id || o.order_number === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Check authorization: must be either the buyer or the seller
    if (order.buyer_id !== req.user!.id && order.seller_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to view this order.' });
    }

    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// PUT update status
router.put('/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'ready',
      'completed',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const db = getDatabase();
    const order = db.orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const isSeller = order.seller_id === req.user!.id;
    const isBuyer = order.buyer_id === req.user!.id;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ error: 'Not authorized to update this order.' });
    }

    // Buyer can only cancel if pending
    if (isBuyer && !isSeller) {
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Buyers can only cancel pending orders.' });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order has already been confirmed and cannot be cancelled.' });
      }
    }

    // If order is cancelled, restore inventory
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = db.products.find(p => p.id === item.product_id);
        if (product) {
          product.stock_quantity += item.quantity;
          product.is_available = true;
        }
      }
    }

    order.status = status;
    order.updated_at = new Date().toISOString();
    saveDatabase();

    return res.json({
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

export default router;
