import { Router } from 'express';
import { getDatabase, saveDatabase, CartItem } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET user cart items
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    const userCart = db.cart_items.filter(c => c.user_id === req.user!.id);

    const items = userCart.map(item => {
      const product = db.products.find(p => p.id === item.product_id);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: product || null,
        created_at: item.created_at,
      };
    }).filter(i => i.product !== null); // filter out deleted products

    const subtotal = items.reduce((acc, curr) => {
      return acc + (curr.product ? curr.product.price * curr.quantity : 0);
    }, 0);

    return res.json({
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// POST add product to cart
router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const qty = parseInt(String(quantity), 10);

    if (!product_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Valid product ID and positive quantity required.' });
    }

    const db = getDatabase();
    const product = db.products.find(p => p.id === product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (!product.is_available || product.stock_quantity <= 0) {
      return res.status(400).json({ error: 'This product is currently out of stock.' });
    }

    const existingIndex = db.cart_items.findIndex(
      c => c.user_id === req.user!.id && c.product_id === product_id
    );

    if (existingIndex > -1) {
      const newQty = db.cart_items[existingIndex].quantity + qty;
      if (newQty > product.stock_quantity) {
        return res.status(400).json({
          error: `Cannot add more than available stock (${product.stock_quantity} ${product.unit}).`,
        });
      }
      db.cart_items[existingIndex].quantity = newQty;
    } else {
      if (qty > product.stock_quantity) {
        return res.status(400).json({
          error: `Only ${product.stock_quantity} ${product.unit} available in stock.`,
        });
      }
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: req.user!.id,
        product_id,
        quantity: qty,
        created_at: new Date().toISOString(),
      };
      db.cart_items.push(newItem);
    }

    saveDatabase();

    return res.json({ message: 'Product added to cart.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// PUT update cart item quantity
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(String(quantity), 10);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    const db = getDatabase();
    const item = db.cart_items.find(c => c.id === id && c.user_id === req.user!.id);

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    const product = db.products.find(p => p.id === item.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product no longer available.' });
    }

    if (qty > product.stock_quantity) {
      return res.status(400).json({
        error: `Only ${product.stock_quantity} ${product.unit} available in stock.`,
      });
    }

    item.quantity = qty;
    saveDatabase();

    return res.json({ message: 'Cart updated.', quantity: qty });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update cart.' });
  }
});

// DELETE remove single item
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const index = db.cart_items.findIndex(c => c.id === id && c.user_id === req.user!.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found in cart.' });
    }

    db.cart_items.splice(index, 1);
    saveDatabase();

    return res.json({ message: 'Product removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// DELETE clear all items
router.delete('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    db.cart_items = db.cart_items.filter(c => c.user_id !== req.user!.id);
    saveDatabase();
    return res.json({ message: 'Cart cleared.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

export default router;
