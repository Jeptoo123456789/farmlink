import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getDatabase, saveDatabase, Product, Review, Favorite } from '../db.js';
import { requireAuth, requireSeller, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();
const MAX_PRODUCT_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 4;

class UploadValidationError extends Error {}

function saveUploadedImages(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_PRODUCT_IMAGES) {
    throw new UploadValidationError(`Choose no more than ${MAX_PRODUCT_IMAGES} photos.`);
  }

  const uploadDirectory = path.resolve(process.cwd(), 'data', 'uploads');
  fs.mkdirSync(uploadDirectory, { recursive: true });

  return value.map((dataUrl: unknown) => {
    if (typeof dataUrl !== 'string') {
      throw new UploadValidationError('One of the uploaded photos is invalid.');
    }

    const match = dataUrl.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) {
      throw new UploadValidationError('Photos must be JPG, PNG, or WebP images.');
    }

    const [, mimeType, encodedImage] = match;
    const imageBuffer = Buffer.from(encodedImage, 'base64');
    if (imageBuffer.length === 0 || imageBuffer.length > MAX_PRODUCT_IMAGE_BYTES || imageBuffer.toString('base64') !== encodedImage) {
      throw new UploadValidationError('Each photo must be 2 MB or smaller and contain valid image data.');
    }

    const isJpeg = mimeType === 'jpeg' && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer[2] === 0xff;
    const isPng = mimeType === 'png' && imageBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = mimeType === 'webp' && imageBuffer.toString('ascii', 0, 4) === 'RIFF' && imageBuffer.toString('ascii', 8, 12) === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) {
      throw new UploadValidationError('The uploaded file contents do not match a supported image type.');
    }

    const extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    const filename = `produce_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${extension}`;
    fs.writeFileSync(path.join(uploadDirectory, filename), imageBuffer, { flag: 'wx' });
    return `/uploads/${filename}`;
  });
}

// GET all products with filtering, search, pagination
router.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      location,
      organic,
      available,
      sort,
      sellerId,
      page = '1',
      limit = '24',
    } = req.query;

    const db = getDatabase();
    let results = [...db.products];

    // Filter by seller (e.g. for seller dashboard)
    if (sellerId) {
      results = results.filter(p => p.seller_id === String(sellerId));
    }

    // Filter by category slug or id
    if (category && category !== 'all') {
      results = results.filter(p => p.category_id === category || p.category_name.toLowerCase() === String(category).toLowerCase());
    }

    // Search query in title, description, seller_name, location
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      results = results.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.seller_name.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q)
      );
    }

    // Location filter
    if (location && String(location).trim()) {
      const locQ = String(location).toLowerCase().trim();
      results = results.filter(p => p.location.toLowerCase().includes(locQ));
    }

    // Price range
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      results = results.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      results = results.filter(p => p.price <= Number(maxPrice));
    }

    // Organic filter
    if (organic === 'true') {
      results = results.filter(p => p.is_organic);
    }

    // Available filter
    if (available === 'true') {
      results = results.filter(p => p.is_available && p.stock_quantity > 0);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 24);
    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // If user is authenticated, attach favorite flag
    const userFavorites = req.user ? db.favorites.filter(f => f.user_id === req.user!.id).map(f => f.product_id) : [];

    const productsWithMeta = paginated.map(p => ({
      ...p,
      is_favorited: userFavorites.includes(p.id),
    }));

    return res.json({
      products: productsWithMeta,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to load products.' });
  }
});

// GET single product by ID
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const product = db.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find seller details
    const seller = db.users.find(u => u.id === product.seller_id);
    const safeSeller = seller
      ? {
          id: seller.id,
          name: seller.name,
          location: seller.location,
          bio: seller.bio,
          avatar_url: seller.avatar_url,
          created_at: seller.created_at,
        }
      : null;

    // Get reviews for product
    const reviews = db.reviews.filter(r => r.product_id === product.id);

    // Related products (same category, different id)
    const related = db.products
      .filter(p => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);

    const is_favorited = req.user
      ? db.favorites.some(f => f.user_id === req.user!.id && f.product_id === product.id)
      : false;

    return res.json({
      product: {
        ...product,
        is_favorited,
        seller: safeSeller,
      },
      reviews,
      related,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

// POST new product (Seller only)
router.post('/', requireSeller, (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      description,
      price,
      unit,
      stock_quantity,
      category_id,
      location,
      image_url,
      images,
      uploaded_images,
      main_image_index,
      is_organic,
      harvest_date,
    } = req.body;

    if (!title || !price || !unit || stock_quantity === undefined || !category_id) {
      return res.status(400).json({ error: 'Title, price, unit, stock quantity, and category are required.' });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }

    if (Number(stock_quantity) < 0) {
      return res.status(400).json({ error: 'Stock quantity cannot be negative.' });
    }

    const db = getDatabase();
    const category = db.categories.find(c => c.id === category_id);
    const category_name = category ? category.name : 'General Farm Produce';

    const defaultImg = '/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg';
    const uploadedImageUrls = saveUploadedImages(uploaded_images);
    const coverIndex = Number.isInteger(Number(main_image_index)) ? Number(main_image_index) : 0;
    if (uploadedImageUrls.length && (coverIndex < 0 || coverIndex >= uploadedImageUrls.length)) {
      return res.status(400).json({ error: 'Choose a valid cover photo.' });
    }
    const coverImage = uploadedImageUrls[coverIndex] || image_url || defaultImg;
    const productImages = uploadedImageUrls.length
      ? uploadedImageUrls
      : Array.isArray(images) && images.length > 0
        ? images
        : [coverImage];

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      seller_id: req.user!.id,
      seller_name: req.user!.name,
      seller_location: req.user!.location || location || 'Local Farm',
      category_id,
      category_name,
      title: title.trim(),
      description: (description || '').trim(),
      price: parseFloat(Number(price).toFixed(2)),
      unit: unit || 'kg',
      stock_quantity: parseInt(Number(stock_quantity).toString(), 10),
      location: (location || req.user!.location || 'Farm Direct').trim(),
      image_url: coverImage,
      images: productImages,
      is_available: Number(stock_quantity) > 0,
      is_organic: Boolean(is_organic),
      harvest_date: harvest_date || new Date().toISOString().split('T')[0],
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDatabase();

    return res.status(201).json({
      message: 'Product listed successfully!',
      product: newProduct,
    });
  } catch (err: any) {
    if (err instanceof UploadValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Failed to create product listing.' });
  }
});

// PUT update product (Seller only, owner only)
router.put('/:id', requireSeller, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const product = db.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.seller_id !== req.user!.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this listing.' });
    }

    const {
      title,
      description,
      price,
      unit,
      stock_quantity,
      category_id,
      location,
      image_url,
      images,
      uploaded_images,
      main_image_index,
      is_available,
      is_organic,
      harvest_date,
    } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) {
      const p = Number(price);
      if (p <= 0) return res.status(400).json({ error: 'Price must be positive.' });
      product.price = parseFloat(p.toFixed(2));
    }
    if (unit !== undefined) product.unit = unit;
    if (stock_quantity !== undefined) {
      const s = parseInt(String(stock_quantity), 10);
      if (s < 0) return res.status(400).json({ error: 'Stock quantity cannot be negative.' });
      product.stock_quantity = s;
      if (s === 0) product.is_available = false;
    }
    if (category_id !== undefined) {
      product.category_id = category_id;
      const cat = db.categories.find(c => c.id === category_id);
      if (cat) product.category_name = cat.name;
    }
    if (location !== undefined) product.location = location.trim();
    const uploadedImageUrls = saveUploadedImages(uploaded_images);
    if (uploadedImageUrls.length) {
      const coverIndex = Number.isInteger(Number(main_image_index)) ? Number(main_image_index) : 0;
      if (coverIndex < 0 || coverIndex >= uploadedImageUrls.length) {
        return res.status(400).json({ error: 'Choose a valid cover photo.' });
      }
      product.image_url = uploadedImageUrls[coverIndex];
      product.images = uploadedImageUrls;
    } else {
      if (image_url !== undefined) product.image_url = image_url;
      if (images !== undefined && Array.isArray(images)) product.images = images;
    }
    if (is_available !== undefined) product.is_available = Boolean(is_available);
    if (is_organic !== undefined) product.is_organic = Boolean(is_organic);
    if (harvest_date !== undefined) product.harvest_date = harvest_date;

    product.updated_at = new Date().toISOString();
    saveDatabase();

    return res.json({
      message: 'Product updated successfully.',
      product,
    });
  } catch (err: any) {
    if (err instanceof UploadValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE product (Seller only, owner only)
router.delete('/:id', requireSeller, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const index = db.products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (db.products[index].seller_id !== req.user!.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
    }

    db.products.splice(index, 1);
    // Also remove from cart items
    db.cart_items = db.cart_items.filter(c => c.product_id !== id);
    // Also remove from favorites
    db.favorites = db.favorites.filter(f => f.product_id !== id);

    saveDatabase();

    return res.json({ message: 'Product removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// POST review for product
router.post('/:id/reviews', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    }
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ error: 'Review comment is required.' });
    }

    const db = getDatabase();
    const product = db.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      rating: Number(rating),
      comment: String(comment).trim(),
      created_at: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Recalculate average rating
    const allProdReviews = db.reviews.filter(r => r.product_id === id);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    product.rating = parseFloat(avg.toFixed(1));
    product.reviews_count = allProdReviews.length;

    saveDatabase();

    return res.status(201).json({
      message: 'Review submitted successfully!',
      review: newReview,
      productRating: product.rating,
      reviewsCount: product.reviews_count,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// POST toggle favorite
router.post('/:id/favorite', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const existingIndex = db.favorites.findIndex(f => f.user_id === req.user!.id && f.product_id === id);

    if (existingIndex > -1) {
      db.favorites.splice(existingIndex, 1);
      saveDatabase();
      return res.json({ message: 'Removed from favorites.', is_favorited: false });
    } else {
      const fav: Favorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: req.user!.id,
        product_id: id,
        created_at: new Date().toISOString(),
      };
      db.favorites.push(fav);
      saveDatabase();
      return res.json({ message: 'Added to favorites.', is_favorited: true });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update favorite status.' });
  }
});

// GET user favorites
router.get('/user/favorites', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    const userFavs = db.favorites.filter(f => f.user_id === req.user!.id);
    const favProductIds = new Set(userFavs.map(f => f.product_id));
    const favProducts = db.products
      .filter(p => favProductIds.has(p.id))
      .map(p => ({ ...p, is_favorited: true }));

    return res.json({ favorites: favProducts });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

export default router;
