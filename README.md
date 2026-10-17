# 🍔 QuickBite | Multi-Vendor Food & Grocery Delivery Platform

A modern, responsive, full-stack multi-vendor delivery web application built with the **MERN Stack** (MongoDB Atlas, Express.js, React.js with Vite, Node.js, and Tailwind CSS).

The platform allows independent restaurants, food shops, grocery stores, and bakeries to sell products and manage their own delivery partners, supervised by the platform **Super Admin**.

---

## 🚀 Key Highlights & Architectural Strengths

- **4 Separate User Roles & Portals**:
  1. 👑 **Super Admin**: Platform analytics, verify & approve/reject shop applications with custom reasons, suspend shops, view platform orders, resolve customer complaints, and inspect audit logs.
  2. 🏪 **Shop Owner**: Manage store profile, open/close toggle, operating hours, catalog products (with stock, discount, category), independent delivery fees & thresholds, manage dedicated delivery riders, and process live order workflows.
  3. 🛵 **Delivery Partner**: Secure login, view assigned stops (Store Pickup ➔ Customer Dropoff), customer phone dialer, mark order as "Picked Up", collect Cash on Delivery (COD), and mark "Delivered".
  4. 🛍️ **Customer**: Explore approved shops, filter by category, single-shop cart protection modal, live delivery fee calculation (with free delivery threshold progress), saved address manager, cash on delivery, live timeline stepper, order cancellation, and ratings/reviews.
- **Precision Integer Paise Currency**: All monetary values are strictly stored and calculated on the backend in **integer paise** (e.g. ₹100 = 10000 paise) to prevent floating-point rounding errors.
- **Single-Shop Cart Enforcement**: Prevents customers from mixing products from multiple shops into one order, with a friendly replace-cart confirmation prompt.
- **Immutable Order Snapshots**: Captures prices, item snapshots, delivery charges, and customer addresses at the time of order creation; catalog price edits never alter past orders.
- **Zero-Setup Local Dev + Atlas Ready**: Out of the box, the server automatically connects to in-memory MongoDB if no Atlas URI is provided, while seamlessly connecting to MongoDB Atlas when `MONGODB_URI` is configured in `server/.env`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Lucide React, Axios, React Hot Toast |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Helmet, Morgan, Express Rate Limit |
| **Validation** | Zod schemas with centralized error handling |
| **Database** | MongoDB Atlas (with automated dev fallback via MongoDB Memory Server) |

---

## 📦 Project Structure

```text
food-delivery-platform/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, CartDrawer, ShopCard, ProductCard, etc.
│   │   ├── context/            # AuthContext (roles, tokens), CartContext (single-shop, paise)
│   │   ├── pages/
│   │   │   ├── admin/          # Super Admin Dashboard, Shops, Users, Orders, Complaints, Audit Logs
│   │   │   ├── owner/          # Shop Owner Dashboard, Catalog, Orders, Fleet, Store Settings
│   │   │   ├── delivery/       # Delivery Partner Dashboard & Waypoints
│   │   │   └── ...             # Home, ShopListing, ShopDetails, Checkout, Tracking, Profile, Auth
│   │   ├── services/           # Axios client with JWT interceptor
│   │   ├── utils/              # Integer paise <-> INR currency formatters
│   │   ├── App.jsx             # Role-based route definitions
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── config/                 # Database connection (MongoDB Atlas + Memory Server fallback)
│   ├── controllers/            # Admin, Auth, Customer, ShopOwner, DeliveryPartner controllers
│   ├── middleware/             # JWT auth, role authorization, ownership check, error handling
│   ├── models/                 # User, Shop, Product, DeliveryPartner, Order, Address, Review, Complaint, AuditLog
│   ├── routes/                 # Express API routes
│   ├── scripts/                # seedAdmin.js, seedData.js, runTests.js
│   ├── utils/                  # Currency utility (paise / rupees)
│   ├── validators/             # Zod input schemas
│   ├── app.js                  # Express app setup, helmet, cors, rate limiter
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.15.0)
- **npm** v9+

### 2. Backend Setup
```bash
cd server

# Install dependencies (already completed)
npm install

# (Optional) Configure MongoDB Atlas in .env:
# Copy .env.example to .env
# Edit MONGODB_URI with your MongoDB Atlas connection string.
# If left as-is, it automatically starts an in-memory MongoDB instance!
```

### 3. Seed Demo Data & Super Admin
To populate the database with realistic sample shops (Spice Garden, Fresh Basket, Sugar & Dough), products, riders, customer accounts, and demo orders:
```bash
cd server
npm run seed
```

To create a Super Admin account directly:
```bash
cd server
npm run seed:admin
```

To run the automated backend test suite (21 unit & integration tests):
```bash
cd server
npm test
```

### 4. Run the Servers
Open two terminal windows:

**Terminal 1 (Backend Server on Port 5000):**
```bash
cd server
npm start
```
*API will run at `http://localhost:5000/api`*

**Terminal 2 (Frontend Client on Port 5173):**
```bash
cd client
npm run dev
```
*Client will open at `http://localhost:5173`*

---

## 🔑 Pre-Seeded Demo Accounts

Every role can be tested with **1-click** using the demo buttons on the [Sign In Page](http://localhost:5173/login), or by using these credentials:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| 👑 **Super Admin** | `admin@quickbite.com` | `Password@123` | Platform analytics, approve/reject shop requests, suspend shops, view platform orders, complaints, audit logs |
| 🏪 **Shop Owner 1** | `owner1@spicegarden.com` | `Password@123` | **Spice Garden Restaurant (Approved)**: Catalog CRUD, delivery fees (₹), order dispatch, manage fleet |
| 🏪 **Shop Owner 2** | `owner2@freshbasket.com` | `Password@123` | **Fresh Basket Grocery (Approved)**: Organic fruits, dairy, delivery settings |
| 🏪 **Shop Owner 3** | `owner3@doughbakery.com` | `Password@123` | **Sugar & Dough Bakery (Approved)**: Artisan breads & pastries |
| 🏪 **Shop Owner 4** | `owner4@burgershack.com` | `Password@123` | **Burger & Wings Shack (Pending Approval)**: Used to test Super Admin approval workflow |
| 🛵 **Delivery Partner** | `rahul@delivery.com` | `Password@123` | Store pickup, customer dropoff, collect Cash on Delivery, complete delivery |
| 🛍️ **Customer** | `customer@quickbite.com` | `Password@123` | Browse marketplace, cart drawer, checkout, live timeline tracking, write reviews |

---

## 🌐 Connecting to MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) or your current IP address.
3. Under **Database Access**, create a database user with password.
4. Click **Connect** ➔ **Drivers** ➔ Copy the connection string.
5. In `server/.env`, replace the placeholder:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/quickbite?retryWrites=true&w=majority
   ```
6. Restart the backend server. It will immediately connect to your live Atlas cluster!

---

## 🛡️ Security Features

- **No Public Super Admin Registration**: Super Admin accounts can only be provisioned via the secure backend CLI script (`npm run seed:admin`).
- **Backend Role Verification**: Middleware validates authentication tokens and user roles on every protected endpoint. Frontend route protections are purely for UX.
- **Ownership Scoping**: Shop owners can only view, edit, or delete items belonging to their own store.
- **Immutable Order Price Snapshot**: Calculations are performed server-side with database prices; client price manipulation is completely prevented.
- **Atomic Stock Management**: Inventory stock is decremented atomically upon checkout and refunded if an order is cancelled or declined by the kitchen.
- **Rate Limiting & Security Headers**: Integrated with `helmet` and `express-rate-limit` to mitigate brute-force and DDoS attempts.
