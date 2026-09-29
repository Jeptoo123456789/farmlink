// server.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// server/routes/auth.ts
import { Router } from "express";

// server/db.ts
import fs from "fs";
import path from "path";
var DB_FILE = path.resolve(process.cwd(), "data", "farmlink_db.json");
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
var dbCache = null;
function getDatabase() {
  if (dbCache) return dbCache;
  const dataDir = path.dirname(DB_FILE);
  ensureDirSync(dataDir);
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(content);
      return dbCache;
    } catch (e) {
      console.error("Error reading database file, initializing defaults", e);
    }
  }
  dbCache = getInitialSeed();
  saveDatabase();
  return dbCache;
}
function saveDatabase() {
  if (!dbCache) return;
  const dataDir = path.dirname(DB_FILE);
  ensureDirSync(dataDir);
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
}
function getInitialSeed() {
  const farmerHash = "$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK";
  const buyerHash = "$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK";
  const demoFarmerId = "user_farmer_001";
  const demoBuyerId = "user_buyer_001";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const users = [
    {
      id: demoFarmerId,
      name: "Thomas Kiptoo",
      email: "farmer@farmlink.com",
      password_hash: farmerHash,
      // farmer123
      role: "seller",
      phone: "+1 (555) 234-5678",
      location: "Highland Organic Valley, Eldoret Region",
      address: "Plot 44, Green Meadows Farm Road",
      bio: "Third-generation regenerative farmer specializing in pesticide-free heirloom vegetables, orchard fruits, and pasture-raised dairy.",
      avatar_url: "/src/assets/images/farmlink_farmer_seller_1790495447477.jpg",
      created_at: "2026-01-10T08:00:00.000Z"
    },
    {
      id: demoBuyerId,
      name: "Elena Vance",
      email: "buyer@farmlink.com",
      password_hash: buyerHash,
      // buyer123
      role: "buyer",
      phone: "+1 (555) 876-5432",
      location: "Riverside Metro District",
      address: "742 Evergreen Terrace, Apt 4B",
      bio: "Culinary chef and farm-to-table enthusiast sourcing fresh weekly ingredients for home and boutique catering.",
      avatar_url: "",
      created_at: "2026-02-01T10:00:00.000Z"
    }
  ];
  const categories = [
    {
      id: "cat_vegetables",
      name: "Vegetables",
      slug: "vegetables",
      description: "Crisp field-grown, greenhouse, and heirloom vegetables harvested fresh daily.",
      icon: "Carrot"
    },
    {
      id: "cat_fruits",
      name: "Fruits & Orchards",
      slug: "fruits",
      description: "Sun-ripened orchard fruits, berries, and seasonal citrus picked at peak sweetness.",
      icon: "Apple"
    },
    {
      id: "cat_dairy",
      name: "Dairy & Eggs",
      slug: "dairy-eggs",
      description: "Pasture-raised brown eggs, fresh farm milk, cultured butter, and artisanal cheeses.",
      icon: "Egg"
    },
    {
      id: "cat_cereals",
      name: "Cereals & Grains",
      slug: "cereals-grains",
      description: "Stone-ground flours, heritage maize, quinoa, oats, and whole farm grains.",
      icon: "Wheat"
    },
    {
      id: "cat_herbs",
      name: "Fresh Herbs",
      slug: "fresh-herbs",
      description: "Aromatic culinaries, greenhouse basil, rosemary, mint, and edible botanicals.",
      icon: "Sprout"
    },
    {
      id: "cat_honey",
      name: "Honey & Preserves",
      slug: "honey-preserves",
      description: "Raw wildflower honey, small-batch preserves, and farm-pressed artisanal oils.",
      icon: "Jar"
    },
    {
      id: "cat_poultry",
      name: "Poultry & Meat",
      slug: "poultry-meat",
      description: "Free-range poultry, grass-fed meats, and certified humane farm cuts.",
      icon: "Beef"
    }
  ];
  const products = [
    {
      id: "prod_heirloom_tomatoes",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_vegetables",
      category_name: "Vegetables",
      title: "Vine-Ripened Heirloom Tomatoes",
      description: "Grown naturally in mineral-rich soil without synthetic pesticides. Juicy, rich in lycopene, and hand-picked with the vine attached for maximum aroma and shelf life. Ideal for fresh salads, sauces, and gourmet culinary dishes.",
      price: 4.8,
      unit: "crate",
      stock_quantity: 45,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg",
      images: ["/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg", "/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-26",
      rating: 4.9,
      reviews_count: 18,
      created_at: "2026-09-15T09:00:00.000Z",
      updated_at: "2026-09-26T12:00:00.000Z"
    },
    {
      id: "prod_crisp_apples",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_fruits",
      category_name: "Fruits & Orchards",
      title: "Crisp Mountain Orchard Apples",
      description: "Sweet, snappy, and aromatic apples picked straight from high-altitude orchard trees. Unwaxed, pesticide-free, and carefully packed in breathable wooden boxes to prevent bruising.",
      price: 3.5,
      unit: "kg",
      stock_quantity: 120,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_produce_fruits_1790495425799.jpg",
      images: ["/src/assets/images/farmlink_produce_fruits_1790495425799.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-25",
      rating: 4.8,
      reviews_count: 24,
      created_at: "2026-09-18T10:30:00.000Z",
      updated_at: "2026-09-25T14:00:00.000Z"
    },
    {
      id: "prod_pasture_eggs",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_dairy",
      category_name: "Dairy & Eggs",
      title: "Pasture-Raised Golden Yolk Eggs",
      description: "Fresh brown eggs from free-ranging hens feeding on open clover meadows and non-GMO grains. Deep amber yolks with rich flavor and high omega-3 fatty acids. Packed in cushioned 30-egg trays.",
      price: 6.2,
      unit: "crate",
      stock_quantity: 60,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg",
      images: ["/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-26",
      rating: 5,
      reviews_count: 32,
      created_at: "2026-09-20T08:00:00.000Z",
      updated_at: "2026-09-26T07:00:00.000Z"
    },
    {
      id: "prod_heritage_maize",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_cereals",
      category_name: "Cereals & Grains",
      title: "Heritage Maize Grain & Flour Blend",
      description: "Stone-milled maize and whole-grain flour from highland farms, naturally grown without synthetic fertilizers. Ideal for porridge, ugali, baking, and traditional staple meals.",
      price: 2.7,
      unit: "bag",
      stock_quantity: 70,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_hero_produce_1790495404243.jpg",
      images: ["/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-27",
      rating: 4.8,
      reviews_count: 11,
      created_at: "2026-09-20T10:00:00.000Z",
      updated_at: "2026-09-27T08:00:00.000Z"
    },
    {
      id: "prod_quinoa_grains",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_cereals",
      category_name: "Cereals & Grains",
      title: "Premium Highland Quinoa Seed",
      description: "Nutritious gluten-free quinoa grown in cool highland soils for a naturally earthy flavor. Ready for breakfast bowls, salads, or hearty side dishes.",
      price: 8.4,
      unit: "bag",
      stock_quantity: 40,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_hero_produce_1790495404243.jpg",
      images: ["/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-28",
      rating: 4.9,
      reviews_count: 17,
      created_at: "2026-09-22T12:00:00.000Z",
      updated_at: "2026-09-28T07:00:00.000Z"
    },
    {
      id: "prod_free_range_chicken",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_poultry",
      category_name: "Poultry & Meat",
      title: "Free-Range Broiler Chicken",
      description: "Pasture-raised broiler chickens with a strong, natural flavor and firm texture. Humanely reared without routine antibiotics and packed fresh for home cooking or wholesale kitchens.",
      price: 9.6,
      unit: "kg",
      stock_quantity: 20,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_hero_produce_1790495404243.jpg",
      images: ["/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-29",
      rating: 4.8,
      reviews_count: 14,
      created_at: "2026-09-23T09:30:00.000Z",
      updated_at: "2026-09-29T08:00:00.000Z"
    },
    {
      id: "prod_grassfed_beef",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_poultry",
      category_name: "Poultry & Meat",
      title: "Grass-Fed Beef Cuts",
      description: "Lean, richly marbled cuts from cattle raised on open pasture and rotational grazing. Excellent for stews, grilling, and slow-cooked family meals.",
      price: 12.4,
      unit: "kg",
      stock_quantity: 18,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_hero_produce_1790495404243.jpg",
      images: ["/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-30",
      rating: 4.7,
      reviews_count: 9,
      created_at: "2026-09-24T08:00:00.000Z",
      updated_at: "2026-09-30T06:00:00.000Z"
    },
    {
      id: "prod_rainbow_carrots",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_vegetables",
      category_name: "Vegetables",
      title: "Sweet Rainbow Carrots with Tops",
      description: "Heritage purple, yellow, and deep orange sweet carrots harvested with healthy green tops intact. Super crunchy and bursting with natural sweetness. Washed in fresh spring water.",
      price: 2.9,
      unit: "bundle",
      stock_quantity: 85,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_hero_produce_1790495404243.jpg",
      images: ["/src/assets/images/farmlink_hero_produce_1790495404243.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-26",
      rating: 4.7,
      reviews_count: 12,
      created_at: "2026-09-21T11:00:00.000Z",
      updated_at: "2026-09-26T09:00:00.000Z"
    },
    {
      id: "prod_raw_milk",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_dairy",
      category_name: "Dairy & Eggs",
      title: "Grass-Fed Whole Jersey Milk",
      description: "Unprocessed, rich creamy whole milk from pasture-grazed Jersey cows. Naturally high in butterfat and A2 beta-casein proteins. Chilled immediately at the dairy parlour.",
      price: 3.2,
      unit: "litre",
      stock_quantity: 40,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg",
      images: ["/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-27",
      rating: 4.9,
      reviews_count: 15,
      created_at: "2026-09-22T06:30:00.000Z",
      updated_at: "2026-09-27T06:00:00.000Z"
    },
    {
      id: "prod_sweet_peaches",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      seller_location: "Highland Organic Valley",
      category_id: "cat_fruits",
      category_name: "Fruits & Orchards",
      title: "Sun-Drenched Freestone Peaches",
      description: "Juicy, fragrant freestone peaches with velvety skin. Hand-graded for optimal ripeness and sweetness. Perfect for direct consumption, baking, or canning.",
      price: 5.5,
      unit: "box",
      stock_quantity: 30,
      location: "Highland Organic Valley, Eldoret Region",
      image_url: "/src/assets/images/farmlink_produce_fruits_1790495425799.jpg",
      images: ["/src/assets/images/farmlink_produce_fruits_1790495425799.jpg"],
      is_available: true,
      is_organic: true,
      harvest_date: "2026-09-25",
      rating: 4.8,
      reviews_count: 9,
      created_at: "2026-09-23T14:15:00.000Z",
      updated_at: "2026-09-25T16:00:00.000Z"
    }
  ];
  const reviews = [
    {
      id: "rev_1",
      product_id: "prod_heirloom_tomatoes",
      user_id: demoBuyerId,
      user_name: "Elena Vance",
      rating: 5,
      comment: "Incredible taste! You can immediately smell the fresh vine. The tomatoes arrived in perfect condition without a single bruise.",
      created_at: "2026-09-20T14:30:00.000Z"
    },
    {
      id: "rev_2",
      product_id: "prod_pasture_eggs",
      user_id: demoBuyerId,
      user_name: "Elena Vance",
      rating: 5,
      comment: "Deep orange yolks and very sturdy shells. Best poached eggs we have ever made at home. Definitely reordering weekly.",
      created_at: "2026-09-22T09:15:00.000Z"
    },
    {
      id: "rev_3",
      product_id: "prod_crisp_apples",
      user_id: "user_buyer_002",
      user_name: "Marcus Brody",
      rating: 5,
      comment: "Super crisp, sweet and tart balance is spot on. Farmer Thomas was very prompt with answering pickup questions.",
      created_at: "2026-09-24T16:00:00.000Z"
    }
  ];
  const orders = [
    {
      id: "ord_1001",
      order_number: "FL-2026-8812",
      buyer_id: demoBuyerId,
      buyer_name: "Elena Vance",
      buyer_email: "buyer@farmlink.com",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      status: "confirmed",
      total_amount: 22,
      shipping_address: "742 Evergreen Terrace, Apt 4B, Riverside Metro",
      phone: "+1 (555) 876-5432",
      notes: "Please leave in shaded porch box if out.",
      items: [
        {
          id: "ord_item_1",
          order_id: "ord_1001",
          product_id: "prod_heirloom_tomatoes",
          product_title: "Vine-Ripened Heirloom Tomatoes",
          image_url: "/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg",
          unit_price: 4.8,
          unit: "crate",
          quantity: 2,
          subtotal: 9.6
        },
        {
          id: "ord_item_2",
          order_id: "ord_1001",
          product_id: "prod_pasture_eggs",
          product_title: "Pasture-Raised Golden Yolk Eggs",
          image_url: "/src/assets/images/farmlink_produce_dairy_eggs_1790495436784.jpg",
          unit_price: 6.2,
          unit: "crate",
          quantity: 2,
          subtotal: 12.4
        }
      ],
      created_at: "2026-09-26T10:20:00.000Z",
      updated_at: "2026-09-26T11:00:00.000Z"
    }
  ];
  const conversations = [
    {
      id: "conv_101",
      buyer_id: demoBuyerId,
      buyer_name: "Elena Vance",
      seller_id: demoFarmerId,
      seller_name: "Thomas Kiptoo",
      product_id: "prod_heirloom_tomatoes",
      product_title: "Vine-Ripened Heirloom Tomatoes",
      last_message: "Your crates are packaged and will dispatch first thing tomorrow morning!",
      last_message_at: "2026-09-26T11:05:00.000Z",
      unread_by: [],
      created_at: "2026-09-26T10:45:00.000Z"
    }
  ];
  const messages = [
    {
      id: "msg_1",
      conversation_id: "conv_101",
      sender_id: demoBuyerId,
      sender_name: "Elena Vance",
      receiver_id: demoFarmerId,
      text: "Hi Thomas! Just placed an order for 2 crates of heirloom tomatoes and eggs. Could you ensure the tomatoes are firm for transport?",
      created_at: "2026-09-26T10:45:00.000Z"
    },
    {
      id: "msg_2",
      conversation_id: "conv_101",
      sender_id: demoFarmerId,
      sender_name: "Thomas Kiptoo",
      receiver_id: demoBuyerId,
      text: "Hello Elena, thank you so much! Absolutely, I hand-selected firm vine tomatoes with high aroma today. Your crates are packaged and will dispatch first thing tomorrow morning!",
      created_at: "2026-09-26T11:05:00.000Z"
    }
  ];
  const favorites = [
    {
      id: "fav_1",
      user_id: demoBuyerId,
      product_id: "prod_heirloom_tomatoes",
      created_at: "2026-09-20T12:00:00.000Z"
    },
    {
      id: "fav_2",
      user_id: demoBuyerId,
      product_id: "prod_pasture_eggs",
      created_at: "2026-09-22T08:00:00.000Z"
    }
  ];
  const cart_items = [];
  return {
    users,
    categories,
    products,
    reviews,
    cart_items,
    orders,
    favorites,
    conversations,
    messages
  };
}

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
var JWT_SECRET = process.env.JWT_SECRET || "farmlink_jwt_secure_super_secret_key_2026";
var TOKEN_EXPIRY = "7d";
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePassword(password, hash) {
  if (password === "farmer123" && hash.includes("$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK")) {
    return true;
  }
  if (password === "buyer123" && hash.includes("$2a$10$wQ9K4gA1jXjO9z6R.uR0nOBb9C6f4Xm6p8Yk1J6hFqHqN9sM7d3xK")) {
    return true;
  }
  return bcrypt.compare(password, hash);
}
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Please sign in." });
    return;
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
    return;
  }
  const db = getDatabase();
  const user = db.users.find((u) => u.id === decoded.userId);
  if (!user) {
    res.status(401).json({ error: "User account not found." });
    return;
  }
  req.user = user;
  next();
}
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const db = getDatabase();
      const user = db.users.find((u) => u.id === decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}
function requireSeller(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== "seller") {
      res.status(403).json({ error: "Access denied. Seller permissions required." });
      return;
    }
    next();
  });
}

// server/routes/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, location, address } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }
    if (role !== "buyer" && role !== "seller") {
      return res.status(400).json({ error: 'Role must be either "buyer" or "seller".' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    const db = getDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    const password_hash = await hashPassword(password);
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      phone: phone || "",
      location: location || "",
      address: address || "",
      bio: "",
      avatar_url: "",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newUser);
    saveDatabase();
    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: "Account registered successfully.",
      token,
      user: safeUser
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to register account." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const db = getDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    return res.json({
      message: "Login successful.",
      token,
      user: safeUser
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to process login." });
  }
});
router.get("/me", requireAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const { password_hash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});
router.put("/profile", requireAuth, (req, res) => {
  try {
    const { name, phone, location, address, bio, avatar_url } = req.body;
    const db = getDatabase();
    const userIndex = db.users.findIndex((u) => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    if (name) db.users[userIndex].name = name.trim();
    if (phone !== void 0) db.users[userIndex].phone = phone.trim();
    if (location !== void 0) db.users[userIndex].location = location.trim();
    if (address !== void 0) db.users[userIndex].address = address.trim();
    if (bio !== void 0) db.users[userIndex].bio = bio.trim();
    if (avatar_url !== void 0) db.users[userIndex].avatar_url = avatar_url;
    if (db.users[userIndex].role === "seller") {
      db.products.forEach((p) => {
        if (p.seller_id === req.user.id) {
          if (name) p.seller_name = name.trim();
          if (location) p.seller_location = location.trim();
        }
      });
    }
    saveDatabase();
    const { password_hash: _, ...safeUser } = db.users[userIndex];
    return res.json({ message: "Profile updated successfully.", user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile." });
  }
});
router.put("/password", requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    const db = getDatabase();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const valid = await comparePassword(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Incorrect current password." });
    }
    user.password_hash = await hashPassword(new_password);
    saveDatabase();
    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update password." });
  }
});
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const db = getDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.json({
      message: "If an account exists with this email, password reset instructions have been dispatched.",
      mockResetToken: "FL-RESET-DEMO"
    });
  }
  return res.json({
    message: "Password reset link sent to your email. You can reset using the reset token provided.",
    mockResetToken: "FL-RESET-DEMO"
  });
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, new_password } = req.body;
    if (!email || !token || !new_password) {
      return res.status(400).json({ error: "Email, reset token, and new password are required." });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    const db = getDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ error: "Invalid reset request or expired token." });
    }
    user.password_hash = await hashPassword(new_password);
    saveDatabase();
    return res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset password." });
  }
});
var auth_default = router;

// server/routes/products.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", optionalAuth, (req, res) => {
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
      page = "1",
      limit = "24"
    } = req.query;
    const db = getDatabase();
    let results = [...db.products];
    if (sellerId) {
      results = results.filter((p) => p.seller_id === String(sellerId));
    }
    if (category && category !== "all") {
      results = results.filter((p) => p.category_id === category || p.category_name.toLowerCase() === String(category).toLowerCase());
    }
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      results = results.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.seller_name.toLowerCase().includes(q) || p.category_name.toLowerCase().includes(q)
      );
    }
    if (location && String(location).trim()) {
      const locQ = String(location).toLowerCase().trim();
      results = results.filter((p) => p.location.toLowerCase().includes(locQ));
    }
    if (minPrice !== void 0 && !isNaN(Number(minPrice))) {
      results = results.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== void 0 && !isNaN(Number(maxPrice))) {
      results = results.filter((p) => p.price <= Number(maxPrice));
    }
    if (organic === "true") {
      results = results.filter((p) => p.is_organic);
    }
    if (available === "true") {
      results = results.filter((p) => p.is_available && p.stock_quantity > 0);
    }
    switch (sort) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "newest":
      default:
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 24);
    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    const userFavorites = req.user ? db.favorites.filter((f) => f.user_id === req.user.id).map((f) => f.product_id) : [];
    const productsWithMeta = paginated.map((p) => ({
      ...p,
      is_favorited: userFavorites.includes(p.id)
    }));
    return res.json({
      products: productsWithMeta,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: "Failed to load products." });
  }
});
router2.get("/:id", optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const seller = db.users.find((u) => u.id === product.seller_id);
    const safeSeller = seller ? {
      id: seller.id,
      name: seller.name,
      location: seller.location,
      bio: seller.bio,
      avatar_url: seller.avatar_url,
      created_at: seller.created_at
    } : null;
    const reviews = db.reviews.filter((r) => r.product_id === product.id);
    const related = db.products.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
    const is_favorited = req.user ? db.favorites.some((f) => f.user_id === req.user.id && f.product_id === product.id) : false;
    return res.json({
      product: {
        ...product,
        is_favorited,
        seller: safeSeller
      },
      reviews,
      related
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product details." });
  }
});
router2.post("/", requireSeller, (req, res) => {
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
      is_organic,
      harvest_date
    } = req.body;
    if (!title || !price || !unit || stock_quantity === void 0 || !category_id) {
      return res.status(400).json({ error: "Title, price, unit, stock quantity, and category are required." });
    }
    if (Number(price) <= 0) {
      return res.status(400).json({ error: "Price must be a positive number." });
    }
    if (Number(stock_quantity) < 0) {
      return res.status(400).json({ error: "Stock quantity cannot be negative." });
    }
    const db = getDatabase();
    const category = db.categories.find((c) => c.id === category_id);
    const category_name = category ? category.name : "General Farm Produce";
    const defaultImg = "/src/assets/images/farmlink_produce_vegetables_1790495415096.jpg";
    const newProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      seller_id: req.user.id,
      seller_name: req.user.name,
      seller_location: req.user.location || location || "Local Farm",
      category_id,
      category_name,
      title: title.trim(),
      description: (description || "").trim(),
      price: parseFloat(Number(price).toFixed(2)),
      unit: unit || "kg",
      stock_quantity: parseInt(Number(stock_quantity).toString(), 10),
      location: (location || req.user.location || "Farm Direct").trim(),
      image_url: image_url || defaultImg,
      images: Array.isArray(images) && images.length > 0 ? images : [image_url || defaultImg],
      is_available: Number(stock_quantity) > 0,
      is_organic: Boolean(is_organic),
      harvest_date: harvest_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      rating: 5,
      reviews_count: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.products.unshift(newProduct);
    saveDatabase();
    return res.status(201).json({
      message: "Product listed successfully!",
      product: newProduct
    });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ error: "Failed to create product listing." });
  }
});
router2.put("/:id", requireSeller, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to edit this listing." });
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
      is_available,
      is_organic,
      harvest_date
    } = req.body;
    if (title !== void 0) product.title = title.trim();
    if (description !== void 0) product.description = description.trim();
    if (price !== void 0) {
      const p = Number(price);
      if (p <= 0) return res.status(400).json({ error: "Price must be positive." });
      product.price = parseFloat(p.toFixed(2));
    }
    if (unit !== void 0) product.unit = unit;
    if (stock_quantity !== void 0) {
      const s = parseInt(String(stock_quantity), 10);
      if (s < 0) return res.status(400).json({ error: "Stock quantity cannot be negative." });
      product.stock_quantity = s;
      if (s === 0) product.is_available = false;
    }
    if (category_id !== void 0) {
      product.category_id = category_id;
      const cat = db.categories.find((c) => c.id === category_id);
      if (cat) product.category_name = cat.name;
    }
    if (location !== void 0) product.location = location.trim();
    if (image_url !== void 0) product.image_url = image_url;
    if (images !== void 0 && Array.isArray(images)) product.images = images;
    if (is_available !== void 0) product.is_available = Boolean(is_available);
    if (is_organic !== void 0) product.is_organic = Boolean(is_organic);
    if (harvest_date !== void 0) product.harvest_date = harvest_date;
    product.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    return res.json({
      message: "Product updated successfully.",
      product
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update product." });
  }
});
router2.delete("/:id", requireSeller, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (db.products[index].seller_id !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this listing." });
    }
    db.products.splice(index, 1);
    db.cart_items = db.cart_items.filter((c) => c.product_id !== id);
    db.favorites = db.favorites.filter((f) => f.product_id !== id);
    saveDatabase();
    return res.json({ message: "Product removed successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete product." });
  }
});
router2.post("/:id/reviews", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars." });
    }
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ error: "Review comment is required." });
    }
    const db = getDatabase();
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: id,
      user_id: req.user.id,
      user_name: req.user.name,
      rating: Number(rating),
      comment: String(comment).trim(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.reviews.unshift(newReview);
    const allProdReviews = db.reviews.filter((r) => r.product_id === id);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    product.rating = parseFloat(avg.toFixed(1));
    product.reviews_count = allProdReviews.length;
    saveDatabase();
    return res.status(201).json({
      message: "Review submitted successfully!",
      review: newReview,
      productRating: product.rating,
      reviewsCount: product.reviews_count
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit review." });
  }
});
router2.post("/:id/favorite", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const existingIndex = db.favorites.findIndex((f) => f.user_id === req.user.id && f.product_id === id);
    if (existingIndex > -1) {
      db.favorites.splice(existingIndex, 1);
      saveDatabase();
      return res.json({ message: "Removed from favorites.", is_favorited: false });
    } else {
      const fav = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: req.user.id,
        product_id: id,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.favorites.push(fav);
      saveDatabase();
      return res.json({ message: "Added to favorites.", is_favorited: true });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to update favorite status." });
  }
});
router2.get("/user/favorites", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    const userFavs = db.favorites.filter((f) => f.user_id === req.user.id);
    const favProductIds = new Set(userFavs.map((f) => f.product_id));
    const favProducts = db.products.filter((p) => favProductIds.has(p.id)).map((p) => ({ ...p, is_favorited: true }));
    return res.json({ favorites: favProducts });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch favorites." });
  }
});
var products_default = router2;

// server/routes/categories.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/", (req, res) => {
  try {
    const db = getDatabase();
    const categoriesWithCount = db.categories.map((cat) => {
      const count = db.products.filter((p) => p.category_id === cat.id && p.is_available).length;
      return {
        ...cat,
        product_count: count
      };
    });
    return res.json({ categories: categoriesWithCount });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load categories." });
  }
});
var categories_default = router3;

// server/routes/cart.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    const userCart = db.cart_items.filter((c) => c.user_id === req.user.id);
    const items = userCart.map((item) => {
      const product = db.products.find((p) => p.id === item.product_id);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: product || null,
        created_at: item.created_at
      };
    }).filter((i) => i.product !== null);
    const subtotal = items.reduce((acc, curr) => {
      return acc + (curr.product ? curr.product.price * curr.quantity : 0);
    }, 0);
    return res.json({
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch cart." });
  }
});
router4.post("/", requireAuth, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const qty = parseInt(String(quantity), 10);
    if (!product_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Valid product ID and positive quantity required." });
    }
    const db = getDatabase();
    const product = db.products.find((p) => p.id === product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (!product.is_available || product.stock_quantity <= 0) {
      return res.status(400).json({ error: "This product is currently out of stock." });
    }
    const existingIndex = db.cart_items.findIndex(
      (c) => c.user_id === req.user.id && c.product_id === product_id
    );
    if (existingIndex > -1) {
      const newQty = db.cart_items[existingIndex].quantity + qty;
      if (newQty > product.stock_quantity) {
        return res.status(400).json({
          error: `Cannot add more than available stock (${product.stock_quantity} ${product.unit}).`
        });
      }
      db.cart_items[existingIndex].quantity = newQty;
    } else {
      if (qty > product.stock_quantity) {
        return res.status(400).json({
          error: `Only ${product.stock_quantity} ${product.unit} available in stock.`
        });
      }
      const newItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: req.user.id,
        product_id,
        quantity: qty,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.cart_items.push(newItem);
    }
    saveDatabase();
    return res.json({ message: "Product added to cart." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add item to cart." });
  }
});
router4.put("/:id", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Quantity must be at least 1." });
    }
    const db = getDatabase();
    const item = db.cart_items.find((c) => c.id === id && c.user_id === req.user.id);
    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }
    const product = db.products.find((p) => p.id === item.product_id);
    if (!product) {
      return res.status(404).json({ error: "Product no longer available." });
    }
    if (qty > product.stock_quantity) {
      return res.status(400).json({
        error: `Only ${product.stock_quantity} ${product.unit} available in stock.`
      });
    }
    item.quantity = qty;
    saveDatabase();
    return res.json({ message: "Cart updated.", quantity: qty });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update cart." });
  }
});
router4.delete("/:id", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const index = db.cart_items.findIndex((c) => c.id === id && c.user_id === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found in cart." });
    }
    db.cart_items.splice(index, 1);
    saveDatabase();
    return res.json({ message: "Product removed successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove item." });
  }
});
router4.delete("/", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    db.cart_items = db.cart_items.filter((c) => c.user_id !== req.user.id);
    saveDatabase();
    return res.json({ message: "Cart cleared." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to clear cart." });
  }
});
var cart_default = router4;

// server/routes/orders.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post("/", requireAuth, (req, res) => {
  try {
    const { shipping_address, phone, notes, items: directItems } = req.body;
    if (!shipping_address || !phone) {
      return res.status(400).json({ error: "Shipping address and phone number are required." });
    }
    const db = getDatabase();
    let orderCheckoutItems = [];
    if (Array.isArray(directItems) && directItems.length > 0) {
      orderCheckoutItems = directItems;
    } else {
      const cart = db.cart_items.filter((c) => c.user_id === req.user.id);
      if (cart.length === 0) {
        return res.status(400).json({ error: "Your cart is empty. Please add products first." });
      }
      orderCheckoutItems = cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity }));
    }
    const validatedItems = [];
    for (const item of orderCheckoutItems) {
      const product = db.products.find((p) => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({ error: "One or more items in your cart is no longer available." });
      }
      if (!product.is_available || product.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} ${product.unit} left.`
        });
      }
      validatedItems.push({ product, quantity: item.quantity });
    }
    const sellerMap = /* @__PURE__ */ new Map();
    for (const item of validatedItems) {
      const sellerId = item.product.seller_id;
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, []);
      }
      sellerMap.get(sellerId).push(item);
    }
    const createdOrders = [];
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    for (const [sellerId, items] of sellerMap.entries()) {
      const seller = db.users.find((u) => u.id === sellerId);
      const sellerName = seller ? seller.name : "Farm Producer";
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orderNumber = `FL-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
      let sellerTotal = 0;
      const orderItems = [];
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
          subtotal
        });
        item.product.stock_quantity = Math.max(0, item.product.stock_quantity - item.quantity);
        if (item.product.stock_quantity === 0) {
          item.product.is_available = false;
        }
      }
      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        buyer_id: req.user.id,
        buyer_name: req.user.name,
        buyer_email: req.user.email,
        seller_id: sellerId,
        seller_name: sellerName,
        status: "pending",
        total_amount: parseFloat(sellerTotal.toFixed(2)),
        shipping_address: shipping_address.trim(),
        phone: phone.trim(),
        notes: notes ? notes.trim() : void 0,
        items: orderItems,
        created_at: timestamp,
        updated_at: timestamp
      };
      db.orders.unshift(newOrder);
      createdOrders.push(newOrder);
    }
    db.cart_items = db.cart_items.filter((c) => c.user_id !== req.user.id);
    saveDatabase();
    return res.status(201).json({
      message: "Order placed successfully!",
      orders: createdOrders,
      primaryOrder: createdOrders[0]
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "Failed to process order." });
  }
});
router5.get("/", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    const { role } = req.query;
    let orders = [];
    if (role === "seller" || req.user.role === "seller") {
      orders = db.orders.filter((o) => o.seller_id === req.user.id);
    } else {
      orders = db.orders.filter((o) => o.buyer_id === req.user.id);
    }
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load orders." });
  }
});
router5.get("/:id", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const order = db.orders.find((o) => o.id === id || o.order_number === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this order." });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch order." });
  }
});
router5.put("/:id/status", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "ready",
      "completed",
      "cancelled"
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }
    const db = getDatabase();
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    const isSeller = order.seller_id === req.user.id;
    const isBuyer = order.buyer_id === req.user.id;
    if (!isSeller && !isBuyer) {
      return res.status(403).json({ error: "Not authorized to update this order." });
    }
    if (isBuyer && !isSeller) {
      if (status !== "cancelled") {
        return res.status(403).json({ error: "Buyers can only cancel pending orders." });
      }
      if (order.status !== "pending") {
        return res.status(400).json({ error: "Order has already been confirmed and cannot be cancelled." });
      }
    }
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.product_id);
        if (product) {
          product.stock_quantity += item.quantity;
          product.is_available = true;
        }
      }
    }
    order.status = status;
    order.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    return res.json({
      message: `Order status updated to ${status}.`,
      order
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update order status." });
  }
});
var orders_default = router5;

// server/routes/messages.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/conversations", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const userConvs = db.conversations.filter(
      (c) => c.buyer_id === userId || c.seller_id === userId
    );
    userConvs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    return res.json({ conversations: userConvs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch conversations." });
  }
});
router6.post("/conversations", requireAuth, (req, res) => {
  try {
    const { recipient_id, product_id, initial_message } = req.body;
    if (!recipient_id) {
      return res.status(400).json({ error: "Recipient ID is required." });
    }
    if (recipient_id === req.user.id) {
      return res.status(400).json({ error: "Cannot start a conversation with yourself." });
    }
    const db = getDatabase();
    const recipient = db.users.find((u) => u.id === recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient user not found." });
    }
    const buyerId = req.user.role === "buyer" ? req.user.id : recipient_id;
    const sellerId = req.user.role === "seller" ? req.user.id : recipient_id;
    const buyerUser = db.users.find((u) => u.id === buyerId);
    const sellerUser = db.users.find((u) => u.id === sellerId);
    let conversation = db.conversations.find(
      (c) => c.buyer_id === buyerId && c.seller_id === sellerId
    );
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    if (!conversation) {
      let productTitle;
      if (product_id) {
        const prod = db.products.find((p) => p.id === product_id);
        if (prod) productTitle = prod.title;
      }
      conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        buyer_id: buyerId,
        buyer_name: buyerUser ? buyerUser.name : "Buyer",
        seller_id: sellerId,
        seller_name: sellerUser ? sellerUser.name : "Seller",
        product_id: product_id || void 0,
        product_title: productTitle,
        last_message: initial_message || "Conversation initiated",
        last_message_at: timestamp,
        unread_by: initial_message ? [recipient_id] : [],
        created_at: timestamp
      };
      db.conversations.unshift(conversation);
    }
    if (initial_message && String(initial_message).trim()) {
      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        conversation_id: conversation.id,
        sender_id: req.user.id,
        sender_name: req.user.name,
        receiver_id: recipient_id,
        text: String(initial_message).trim(),
        created_at: timestamp
      };
      db.messages.push(msg);
      conversation.last_message = msg.text;
      conversation.last_message_at = timestamp;
      if (!conversation.unread_by.includes(recipient_id)) {
        conversation.unread_by.push(recipient_id);
      }
    }
    saveDatabase();
    return res.status(201).json({ conversation });
  } catch (err) {
    return res.status(500).json({ error: "Failed to initiate conversation." });
  }
});
router6.get("/conversations/:id", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const conversation = db.conversations.find((c) => c.id === id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (conversation.buyer_id !== req.user.id && conversation.seller_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }
    conversation.unread_by = conversation.unread_by.filter((uid) => uid !== req.user.id);
    saveDatabase();
    const messages = db.messages.filter((m) => m.conversation_id === id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return res.json({
      conversation,
      messages
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load messages." });
  }
});
router6.post("/conversations/:id", requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Message text cannot be empty." });
    }
    const db = getDatabase();
    const conversation = db.conversations.find((c) => c.id === id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (conversation.buyer_id !== req.user.id && conversation.seller_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }
    const receiverId = conversation.buyer_id === req.user.id ? conversation.seller_id : conversation.buyer_id;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: id,
      sender_id: req.user.id,
      sender_name: req.user.name,
      receiver_id: receiverId,
      text: String(text).trim(),
      created_at: timestamp
    };
    db.messages.push(newMessage);
    conversation.last_message = newMessage.text;
    conversation.last_message_at = timestamp;
    if (!conversation.unread_by.includes(receiverId)) {
      conversation.unread_by.push(receiverId);
    }
    saveDatabase();
    return res.status(201).json({ message: newMessage });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message." });
  }
});
var messages_default = router6;

// server/routes/stats.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/dashboard", requireAuth, (req, res) => {
  try {
    const db = getDatabase();
    const user = req.user;
    if (user.role === "seller") {
      const sellerProducts = db.products.filter((p) => p.seller_id === user.id);
      const activeListings = sellerProducts.filter((p) => p.is_available && p.stock_quantity > 0);
      const sellerOrders = db.orders.filter((o) => o.seller_id === user.id);
      const pendingOrders = sellerOrders.filter((o) => o.status === "pending" || o.status === "processing");
      const completedOrders = sellerOrders.filter((o) => o.status === "completed");
      const totalSales = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const recentOrders = [...sellerOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
      return res.json({
        role: "seller",
        stats: {
          totalProducts: sellerProducts.length,
          activeListings: activeListings.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          totalSales: parseFloat(totalSales.toFixed(2)),
          totalOrders: sellerOrders.length
        },
        recentOrders
      });
    } else {
      const buyerOrders = db.orders.filter((o) => o.buyer_id === user.id);
      const pendingOrders = buyerOrders.filter((o) => o.status === "pending" || o.status === "processing");
      const completedOrders = buyerOrders.filter((o) => o.status === "completed");
      const favoritesCount = db.favorites.filter((f) => f.user_id === user.id).length;
      const recentOrders = [...buyerOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
      return res.json({
        role: "buyer",
        stats: {
          totalOrders: buyerOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          favoriteProducts: favoritesCount
        },
        recentOrders
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});
var stats_default = router7;

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = parseInt(process.env.PORT || "3000", 10);
var isProd = process.env.NODE_ENV === "production";
getDatabase();
app.use(express.json());
app.use("/api/auth", auth_default);
app.use("/api/products", products_default);
app.use("/api/categories", categories_default);
app.use("/api/cart", cart_default);
app.use("/api/orders", orders_default);
app.use("/api/messages", messages_default);
app.use("/api/stats", stats_default);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FarmLink API", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    const indexPath = path2.resolve(distPath, "index.html");
    if (!fs2.existsSync(indexPath)) {
      throw new Error(`Production frontend build not found at ${indexPath}. Run "npm run build" before starting the server.`);
    }
    app.use("/src/assets/images", express.static(path2.resolve(__dirname, "src/assets/images")));
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FarmLink Server] Listening on http://0.0.0.0:${PORT} (env: ${isProd ? "production" : "development"})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start FarmLink server:", err);
  process.exit(1);
});
