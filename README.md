# OpsBridge Lite – Inventory & Operations Management System

OpsBridge Lite is a full-stack, beginner-friendly Inventory and Operations Management System designed for small business operations. It helps track products, manage stock movements (Stock In / Stock Out with transaction safety), monitor stock levels, view audit logs, and analyze real-time operational statistics.

---

## 🌟 Features

- **Dynamic Dashboard**: Real-time stats showing Total Products, Total Stock, Low Stock alerts, Out of Stock items, and Recent Stock Activity.
- **Product Management (CRUD)**:
  - Add products with custom category, price, quantity, and minimum stock threshold.
  - View products in a structured table with live stock status badges (`In Stock`, `Low Stock`, `Out of Stock`).
  - Edit product information.
  - Delete products with built-in audit safety (prevents deleting products with movement history).
- **Search & Category Filter**: Easily filter products by category or perform instant search.
- **Stock Movement Entry**:
  - **Stock In**: Increase inventory with audit reasons (e.g. Purchase, Restock, Return).
  - **Stock Out**: Issue inventory with stock availability validation (prevents negative stock).
- **Stock Movement History**: Comprehensive audit log recording date, product, movement type (IN/OUT), quantity, and reason.
- **SQLite Database Integration**: Persistent embedded SQLite database with atomic transaction support using `better-sqlite3`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router DOM (v6)
- **Styling**: Modern Vanilla CSS Design System with CSS Custom Properties
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 (`better-sqlite3`)
- **Middleware**: CORS, Body Parser, Centralized Error Handling

---

## 📁 Project Structure

```
opsbridge-lite/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Sidebar, Navbar, Modal, StatCard, Toast)
│   │   ├── pages/              # Page Views (Dashboard, Products, StockManagement, StockHistory)
│   │   ├── services/           # REST API Client Service
│   │   ├── App.jsx             # Router Configuration
│   │   ├── main.jsx            # Application Entry Point
│   │   └── index.css           # Global Design System CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express Backend API & Database
│   ├── controllers/            # Request Handlers (productController, stockController, dashboardController)
│   ├── database/               # Database Connection & Schema (db.js, opsbridge.db)
│   ├── routes/                 # API Endpoint Definitions
│   ├── app.js                  # Express Application Setup
│   ├── server.js               # HTTP Server Initialization
│   └── package.json
├── .gitignore
├── .env.example
├── package.json                # Root package.json with concurrent start scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- `npm` (comes with Node.js)

### Step 1: Install Dependencies

Run the following command from the root directory to install dependencies for both `server` and `client`:

```bash
npm run install:all
```

Alternatively, install individually:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Start Application

Run both backend server and frontend client concurrently with a single command from the root directory:

```bash
npm run dev
```

- **Frontend Client**: Runs at `http://localhost:5173`
- **Backend API**: Runs at `http://localhost:5000`

---

## 🔌 API Endpoints

### Products API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products with stock status |
| `GET` | `/api/products/:id` | Get single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product (if no movements exist) |

### Stock Management API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/stock/in` | Record Stock In movement (+ quantity) |
| `POST` | `/api/stock/out` | Record Stock Out movement (- quantity, checks availability) |
| `GET` | `/api/stock/history` | Get stock movement audit log |

### Dashboard API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Get inventory totals & low stock count |
| `GET` | `/api/dashboard/recent-movements` | Get latest 6 stock movements |

---

## 💾 Database Schema

### `products`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL)
- `category` (TEXT NOT NULL)
- `price` (REAL NOT NULL CHECK >= 0)
- `quantity` (INTEGER NOT NULL DEFAULT 0 CHECK >= 0)
- `minimum_stock` (INTEGER NOT NULL DEFAULT 5 CHECK >= 0)
- `created_at`, `updated_at` (DATETIME)

### `stock_movements`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `product_id` (INTEGER NOT NULL, Foreign Key → `products.id`)
- `type` (TEXT CHECK ('IN', 'OUT'))
- `quantity` (INTEGER NOT NULL CHECK > 0)
- `reason` (TEXT NOT NULL)
- `created_at` (DATETIME)

---

## 📸 Application Screenshots Section

*(Add screenshots of your Dashboard, Product Table, and Stock Management pages here for your presentation report)*

- **Dashboard View**: Metric summary cards and low stock watchlist.
- **Product Catalog**: Filterable table with status badges.
- **Stock Movement Entry**: Forms for receiving and issuing stock.
- **Stock Movement History**: Audit trail of transactions.

---

## 🔮 Future Improvements

1. Export inventory reports to CSV or PDF format.
2. User authentication (Login / Signup) for multi-user role access (Admin, Warehouse Staff).
3. Barcode scanning support for quick product lookups.
4. Automatic email notifications for low-stock items.

---

## 📢 Internship Presentation Summary

When presenting OpsBridge Lite:
1. **Explain the Purpose**: It solves operational inventory tracking for small businesses by bridging the gap between stock intake, sales dispatches, and management visibility.
2. **Highlight Transaction Safety**: Show how Stock Out prevents negative quantities using database transactions to maintain consistency.
3. **Demonstrate Audit Trail**: Point out how every stock movement is logged with timestamp, reason, and movement type.
4. **Showcase SQLite Simplicity**: Emphasize that the database is self-contained with no heavy database server setup required.
