import { Router } from 'express';
import { getDatabase } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const categoriesWithCount = db.categories.map(cat => {
      const count = db.products.filter(p => p.category_id === cat.id && p.is_available).length;
      return {
        ...cat,
        product_count: count,
      };
    });
    return res.json({ categories: categoriesWithCount });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load categories.' });
  }
});

export default router;
