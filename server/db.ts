import fs from 'fs';
import path from 'path';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  location?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export type UnitType = 'kg' | 'crate' | 'bundle' | 'box' | 'bag' | 'litre' | 'piece' | 'tonne';

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_location: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  price: number; // in USD / local currency
  unit: UnitType;
  stock_quantity: number;
  location: string;
  image_url: string;
  images: string[];
  is_available: boolean;
  is_organic: boolean;
  harvest_date: string;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  image_url: string;
  unit_price: number;
  unit: UnitType;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  seller_id: string;
  seller_name: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  phone: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  product_id?: string;
  product_title?: string;
  last_message: string;
  last_message_at: string;
  unread_by: string[]; // user IDs who haven't read latest
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  reviews: Review[];
  cart_items: CartItem[];
  orders: Order[];
  favorites: Favorite[];
  conversations: Conversation[];
  messages: Message[];
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'farmlink_db.json');

// Ensure data directory exists
function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// In-memory cache synced with disk
let dbCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  const dataDir = path.dirname(DB_FILE);
  ensureDirSync(dataDir);

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (e) {
      console.error('Error reading database file, initializing defaults', e);
    }
  }

  // Initial seed
  dbCache = getInitialSeed();
  saveDatabase();
  return dbCache;
}

export function saveDatabase(): void {
  if (!dbCache) return;
  const dataDir = path.dirname(DB_FILE);
  ensureDirSync(dataDir);
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Initial pre-seeded database
function getInitialSeed(): DatabaseSchema {
  // Pre-hashed passwords for demo accounts
  // "farmer123" -> bcrypt hash
  // "buyer123" -> bcrypt hash
  const farmerHash = '$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK';
  const buyerHash = '$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK';

  const demoFarmerId = 'user_farmer_001';
  const demoBuyerId = 'user_buyer_001';
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: demoFarmerId,
      name: 'Thomas Kiptoo',
      email: 'farmer@farmlink.com',
      password_hash: farmerHash, // farmer123
      role: 'seller',
      phone: '+1 (555) 234-5678',
      location: 'Highland Organic Valley, Eldoret Region',
      address: 'Plot 44, Green Meadows Farm Road',
      bio: 'Third-generation regenerative farmer specializing in pesticide-free heirloom vegetables, orchard fruits, and pasture-raised dairy.',
      avatar_url: '/src/assets/images/farmlink_farmer_seller_1790495447477.jpg',
      created_at: '2026-01-10T08:00:00.000Z',
    },
    {
      id: demoBuyerId,
      name: 'Elena Vance',
      email: 'buyer@farmlink.com',
      password_hash: buyerHash, // buyer123
      role: 'buyer',
      phone: '+1 (555) 876-5432',
      location: 'Riverside Metro District',
      address: '742 Evergreen Terrace, Apt 4B',
      bio: 'Culinary chef and farm-to-table enthusiast sourcing fresh weekly ingredients for home and boutique catering.',
      avatar_url: '',
      created_at: '2026-02-01T10:00:00.000Z',
    },
  ];

  const categories: Category[] = [
    {
      id: 'cat_vegetables',
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Crisp field-grown, greenhouse, and heirloom vegetables harvested fresh daily.',
      icon: 'Carrot',
    },
    {
      id: 'cat_fruits',
      name: 'Fruits & Orchards',
      slug: 'fruits',
      description: 'Sun-ripened orchard fruits, berries, and seasonal citrus picked at peak sweetness.',
      icon: 'Apple',
    },
    {
      id: 'cat_dairy',
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      description: 'Pasture-raised brown eggs, fresh farm milk, cultured butter, and artisanal cheeses.',
      icon: 'Egg',
    },
    {
      id: 'cat_cereals',
      name: 'Cereals & Grains',
      slug: 'cereals-grains',
      description: 'Stone-ground flours, heritage maize, quinoa, oats, and whole farm grains.',
      icon: 'Wheat',
    },
    {
      id: 'cat_herbs',
      name: 'Fresh Herbs',
      slug: 'fresh-herbs',
      description: 'Aromatic culinaries, greenhouse basil, rosemary, mint, and edible botanicals.',
      icon: 'Sprout',
    },
    {
      id: 'cat_honey',
      name: 'Honey & Preserves',
      slug: 'honey-preserves',
      description: 'Raw wildflower honey, small-batch preserves, and farm-pressed artisanal oils.',
      icon: 'Jar',
    },
    {
      id: 'cat_poultry',
      name: 'Poultry & Meat',
      slug: 'poultry-meat',
      description: 'Free-range poultry, grass-fed meats, and certified humane farm cuts.',
      icon: 'Beef',
    },
  ];

  const products: Product[] = [
    {
      id: 'prod_heirloom_tomatoes',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_vegetables',
      category_name: 'Vegetables',
      title: 'Vine-Ripened Heirloom Tomatoes',
      description: 'Grown naturally in mineral-rich soil without synthetic pesticides. Juicy, rich in lycopene, and hand-picked with the vine attached for maximum aroma and shelf life. Ideal for fresh salads, sauces, and gourmet culinary dishes.',
      price: 4.80,
      unit: 'crate',
      stock_quantity: 45,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg',
      images: ['/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg', '/src/assets/images/farmlink_hero_produce_1790495404243.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-26',
      rating: 4.9,
      reviews_count: 18,
      created_at: '2026-09-15T09:00:00.000Z',
      updated_at: '2026-09-26T12:00:00.000Z',
    },
    {
      id: 'prod_crisp_apples',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_fruits',
      category_name: 'Fruits & Orchards',
      title: 'Crisp Mountain Orchard Apples',
      description: 'Sweet, snappy, and aromatic apples picked straight from high-altitude orchard trees. Unwaxed, pesticide-free, and carefully packed in breathable wooden boxes to prevent bruising.',
      price: 3.50,
      unit: 'kg',
      stock_quantity: 120,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_produce_fruits_1790495425799.jpg',
      images: ['/src/assets/images/farmlink_produce_fruits_1790495425799.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-25',
      rating: 4.8,
      reviews_count: 24,
      created_at: '2026-09-18T10:30:00.000Z',
      updated_at: '2026-09-25T14:00:00.000Z',
    },
    {
      id: 'prod_pasture_eggs',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_dairy',
      category_name: 'Dairy & Eggs',
      title: 'Pasture-Raised Golden Yolk Eggs',
      description: 'Fresh brown eggs from free-ranging hens feeding on open clover meadows and non-GMO grains. Deep amber yolks with rich flavor and high omega-3 fatty acids. Packed in cushioned 30-egg trays.',
      price: 6.20,
      unit: 'crate',
      stock_quantity: 60,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg',
      images: ['/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-26',
      rating: 5.0,
      reviews_count: 32,
      created_at: '2026-09-20T08:00:00.000Z',
      updated_at: '2026-09-26T07:00:00.000Z',
    },
    {
      id: 'prod_rainbow_carrots',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_vegetables',
      category_name: 'Vegetables',
      title: 'Sweet Rainbow Carrots with Tops',
      description: 'Heritage purple, yellow, and deep orange sweet carrots harvested with healthy green tops intact. Super crunchy and bursting with natural sweetness. Washed in fresh spring water.',
      price: 2.90,
      unit: 'bundle',
      stock_quantity: 85,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_hero_produce_1790495404243.jpg',
      images: ['/src/assets/images/farmlink_hero_produce_1790495404243.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-26',
      rating: 4.7,
      reviews_count: 12,
      created_at: '2026-09-21T11:00:00.000Z',
      updated_at: '2026-09-26T09:00:00.000Z',
    },
    {
      id: 'prod_raw_milk',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_dairy',
      category_name: 'Dairy & Eggs',
      title: 'Grass-Fed Whole Jersey Milk',
      description: 'Unprocessed, rich creamy whole milk from pasture-grazed Jersey cows. Naturally high in butterfat and A2 beta-casein proteins. Chilled immediately at the dairy parlour.',
      price: 3.20,
      unit: 'litre',
      stock_quantity: 40,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg',
      images: ['/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-27',
      rating: 4.9,
      reviews_count: 15,
      created_at: '2026-09-22T06:30:00.000Z',
      updated_at: '2026-09-27T06:00:00.000Z',
    },
    {
      id: 'prod_sweet_peaches',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      seller_location: 'Highland Organic Valley',
      category_id: 'cat_fruits',
      category_name: 'Fruits & Orchards',
      title: 'Sun-Drenched Freestone Peaches',
      description: 'Juicy, fragrant freestone peaches with velvety skin. Hand-graded for optimal ripeness and sweetness. Perfect for direct consumption, baking, or canning.',
      price: 5.50,
      unit: 'box',
      stock_quantity: 30,
      location: 'Highland Organic Valley, Eldoret Region',
      image_url: '/src/assets/images/farmlink_produce_fruits_1790495425799.jpg',
      images: ['/src/assets/images/farmlink_produce_fruits_1790495425799.jpg'],
      is_available: true,
      is_organic: true,
      harvest_date: '2026-09-25',
      rating: 4.8,
      reviews_count: 9,
      created_at: '2026-09-23T14:15:00.000Z',
      updated_at: '2026-09-25T16:00:00.000Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      product_id: 'prod_heirloom_tomatoes',
      user_id: demoBuyerId,
      user_name: 'Elena Vance',
      rating: 5,
      comment: 'Incredible taste! You can immediately smell the fresh vine. The tomatoes arrived in perfect condition without a single bruise.',
      created_at: '2026-09-20T14:30:00.000Z',
    },
    {
      id: 'rev_2',
      product_id: 'prod_pasture_eggs',
      user_id: demoBuyerId,
      user_name: 'Elena Vance',
      rating: 5,
      comment: 'Deep orange yolks and very sturdy shells. Best poached eggs we have ever made at home. Definitely reordering weekly.',
      created_at: '2026-09-22T09:15:00.000Z',
    },
    {
      id: 'rev_3',
      product_id: 'prod_crisp_apples',
      user_id: 'user_buyer_002',
      user_name: 'Marcus Brody',
      rating: 5,
      comment: 'Super crisp, sweet and tart balance is spot on. Farmer Thomas was very prompt with answering pickup questions.',
      created_at: '2026-09-24T16:00:00.000Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_1001',
      order_number: 'FL-2026-8812',
      buyer_id: demoBuyerId,
      buyer_name: 'Elena Vance',
      buyer_email: 'buyer@farmlink.com',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      status: 'confirmed',
      total_amount: 22.00,
      shipping_address: '742 Evergreen Terrace, Apt 4B, Riverside Metro',
      phone: '+1 (555) 876-5432',
      notes: 'Please leave in shaded porch box if out.',
      items: [
        {
          id: 'ord_item_1',
          order_id: 'ord_1001',
          product_id: 'prod_heirloom_tomatoes',
          product_title: 'Vine-Ripened Heirloom Tomatoes',
          image_url: '/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg',
          unit_price: 4.80,
          unit: 'crate',
          quantity: 2,
          subtotal: 9.60,
        },
        {
          id: 'ord_item_2',
          order_id: 'ord_1001',
          product_id: 'prod_pasture_eggs',
          product_title: 'Pasture-Raised Golden Yolk Eggs',
          image_url: '/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg',
          unit_price: 6.20,
          unit: 'crate',
          quantity: 2,
          subtotal: 12.40,
        },
      ],
      created_at: '2026-09-26T10:20:00.000Z',
      updated_at: '2026-09-26T11:00:00.000Z',
    },
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv_101',
      buyer_id: demoBuyerId,
      buyer_name: 'Elena Vance',
      seller_id: demoFarmerId,
      seller_name: 'Thomas Kiptoo',
      product_id: 'prod_heirloom_tomatoes',
      product_title: 'Vine-Ripened Heirloom Tomatoes',
      last_message: 'Your crates are packaged and will dispatch first thing tomorrow morning!',
      last_message_at: '2026-09-26T11:05:00.000Z',
      unread_by: [],
      created_at: '2026-09-26T10:45:00.000Z',
    },
  ];

  const messages: Message[] = [
    {
      id: 'msg_1',
      conversation_id: 'conv_101',
      sender_id: demoBuyerId,
      sender_name: 'Elena Vance',
      receiver_id: demoFarmerId,
      text: 'Hi Thomas! Just placed an order for 2 crates of heirloom tomatoes and eggs. Could you ensure the tomatoes are firm for transport?',
      created_at: '2026-09-26T10:45:00.000Z',
    },
    {
      id: 'msg_2',
      conversation_id: 'conv_101',
      sender_id: demoFarmerId,
      sender_name: 'Thomas Kiptoo',
      receiver_id: demoBuyerId,
      text: 'Hello Elena, thank you so much! Absolutely, I hand-selected firm vine tomatoes with high aroma today. Your crates are packaged and will dispatch first thing tomorrow morning!',
      created_at: '2026-09-26T11:05:00.000Z',
    },
  ];

  const favorites: Favorite[] = [
    {
      id: 'fav_1',
      user_id: demoBuyerId,
      product_id: 'prod_heirloom_tomatoes',
      created_at: '2026-09-20T12:00:00.000Z',
    },
    {
      id: 'fav_2',
      user_id: demoBuyerId,
      product_id: 'prod_pasture_eggs',
      created_at: '2026-09-22T08:00:00.000Z',
    },
  ];

  const cart_items: CartItem[] = [];

  return {
    users,
    categories,
    products,
    reviews,
    cart_items,
    orders,
    favorites,
    conversations,
    messages,
  };
}
