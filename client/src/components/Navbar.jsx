import React from 'react';
import { useLocation } from 'react-router-dom';
import { Database, Server } from 'lucide-react';

const routeTitles = {
  '/dashboard': 'System Dashboard',
  '/products': 'Product Catalog & Inventory',
  '/stock': 'Stock Movement Entry',
  '/stock-history': 'Stock Movement Audit History',
};

export default function Navbar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'OpsBridge Lite';

  return (
    <header className="navbar">
      <div className="navbar-title">{title}</div>
      <div className="navbar-actions">
        <div className="navbar-status-badge">
          <span className="status-dot"></span>
          <span>System Online (SQLite DB)</span>
        </div>
      </div>
    </header>
  );
}
