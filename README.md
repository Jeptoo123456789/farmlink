# FarmLink - Digital Farm Produce Marketplace

A modern, responsive, full-stack agricultural marketplace connecting independent farmers and growers directly with wholesale and consumer buyers.

---

## 1. Project Overview

**FarmLink** eliminates predatory middlemen and food waste by providing a direct-to-consumer and farm-to-table platform. Farmers publish their harvests, set transparent farm gate prices, and manage orders with real-time stock deductions. Buyers discover seasonal produce, verify agricultural practices (such as organic certification), communicate directly with farmers via in-app messaging, place orders with delivery instructions, and rate harvested crops.

---

## 2. Key Features

### For Buyers
- **Explore & Filter**: Filter by category, price range, farm location, organic certification, and immediate stock availability.
- **Search**: Fast full-text search across produce titles, farm locations, and varieties.
- **Produce Showcase**: High-resolution imagery, harvest dates, unit pricing, seller credibility cards, and verified buyer reviews.
- **Basket & Checkout**: Dynamic quantity steppers with live stock validation and delivery destination checkout.
- **Buyer Dashboard**: Live order status timeline (`Pending` → `Confirmed` → `Processing` → `Ready for Dispatch` → `Completed`), order cancellation, and saved favorite produce.
- **Direct Messaging**: Chat directly with the farmer who grew your produce.

### For Farmers & Sellers
- **Seller Dashboard**: Real-time sales KPIs (Total Listings, Active Harvests, Pending Orders, Completed Orders, Total Earnings).
- **Produce Inventory Management**: Add new crop listings with unit measures (`kg`, `crate`, `bundle`, `box`, `bag`, `litre`), stock controls, organic certifications, and photography.
- **Order Fulfillment**: Track incoming customer orders, review delivery addresses, update statuses, and message buyers.
- **Farm Profile**: Customizable farmer biography and physical farm location for buyer trust.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js & Express (Full-Stack architecture running via `server.ts`).
- **Database**: Typed relational database engine with atomic file persistence (`data/farmlink_db.json`).
- **Authentication**: JWT token verification (`jsonwebtoken`), salted password hashing (`bcryptjs`), role-based access control (`buyer` vs `seller`).

---

## 4. Pre-Configured Demo Credentials

For quick evaluation without manual registration, 1-click demo login buttons are provided in the authentication dialog:

| Role | Email | Password |
|---|---|---|
| **Farmer (Seller)** | `farmer@farmlink.com` | `farmer123` |
| **Buyer** | `buyer@farmlink.com` | `buyer123` |

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Create buyer or seller account with hashed passwords
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Fetch authenticated user profile
- `PUT /api/auth/profile` - Update profile, phone, address, and farm details
- `PUT /api/auth/password` - Change password securely
- `POST /api/auth/forgot-password` - Request password reset instructions
- `POST /api/auth/reset-password` - Complete password reset with token

### Produce Marketplace
- `GET /api/products` - List products with search, category, location, organic, and pricing filters
- `GET /api/products/:id` - Product details, seller profile, reviews, and related crops
- `POST /api/products` - Create new produce listing (Seller only)
- `PUT /api/products/:id` - Edit listing (Owner seller only)
- `DELETE /api/products/:id` - Remove listing (Owner seller only)
- `POST /api/products/:id/reviews` - Submit product rating and review
- `POST /api/products/:id/favorite` - Toggle user favorite status
- `GET /api/products/user/favorites` - Get favorited produce

### Shopping Basket & Orders
- `GET /api/cart` - List user cart items and subtotal
- `POST /api/cart` - Add item to cart with stock validation
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Place direct order and deduct product inventory
- `GET /api/orders` - Get buyer orders or seller incoming orders
- `GET /api/orders/:id` - Order details with access verification
- `PUT /api/orders/:id/status` - Transition order status

### Direct Messaging
- `GET /api/messages/conversations` - List active buyer-seller conversations
- `POST /api/messages/conversations` - Start or resume conversation
- `GET /api/messages/conversations/:id` - Fetch thread messages (marks as read)
- `POST /api/messages/conversations/:id` - Send message (with real-time polling)

### Statistics
- `GET /api/stats/dashboard` - Role-tailored metrics and recent orders

---

## 6. How to Run

### Development
```bash
npm run dev
```
Starts Express server on port 3000 with Vite middlewares mounted.

### Production Build
```bash
npm run build
npm start
```
Compiles Vite frontend to `dist/` and runs full-stack Express server.

---

## 7. Testing Instructions

1. **Buyer Journey**:
   - Log in with `buyer@farmlink.com` (`buyer123`) or register a new Buyer account.
   - Filter produce by category (e.g., "Vegetables") or search for "Tomatoes".
   - Open product details, inspect harvest date and farmer profile, add to cart.
   - Proceed to Checkout, enter delivery address and phone, and submit order.
   - Verify order appears in **Buyer Dashboard** with live tracking status.
   - Click "Message Farmer" to send a direct message.

2. **Farmer / Seller Journey**:
   - Log in with `farmer@farmlink.com` (`farmer123`).
   - Open **Farmer Dashboard** and view KPI cards.
   - Click **List New Harvest** to create a new crop listing.
   - View **Incoming Orders**, inspect the buyer's order, and update status from `Pending` to `Confirmed` / `Processing`.
   - Open **Direct Messages** to chat back with the buyer.
