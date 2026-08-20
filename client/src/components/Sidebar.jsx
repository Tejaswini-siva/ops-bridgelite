import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, History, Layers } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="sidebar-brand-text">OpsBridge</span>
              <span className="sidebar-brand-badge">Lite</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Operations & Inventory</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/stock"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ArrowLeftRight size={18} />
            <span>Stock Management</span>
          </NavLink>

          <NavLink
            to="/stock-history"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <History size={18} />
            <span>Stock History</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-title">Inventory & Operations</div>
        <div className="sidebar-footer-subtitle">College Internship Project</div>
      </div>
    </aside>
  );
}
