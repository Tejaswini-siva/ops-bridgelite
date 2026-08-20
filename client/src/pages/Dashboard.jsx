import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight, Plus, ArrowLeftRight } from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    lowStockList: [],
  });
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, movementsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentMovements(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (movementsRes.success) {
        setRecentMovements(movementsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading operational statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-panel" style={{ borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Error connecting to database server:</strong> {error}
            <div style={{ marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Operations Overview</h1>
          <p>Real-time status of inventory, stock levels, and operations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn btn-secondary btn-sm">
            <Package size={16} /> Manage Products
          </Link>
          <Link to="/stock" className="btn btn-primary btn-sm">
            <ArrowLeftRight size={16} /> Record Stock Movement
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          variant="blue"
        />
        <StatCard
          label="Total Stock Items"
          value={stats.totalStock}
          icon={Layers}
          variant="green"
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          variant="amber"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStockProducts}
          icon={XCircle}
          variant="red"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Movements Panel */}
        <div className="card-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Stock Movements</h2>
            <Link to="/stock-history" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All History &rarr;
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No recent stock movements recorded</p>
              <p style={{ fontSize: '0.85rem' }}>Stock-in or stock-out operations will appear here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {m.type === 'IN' ? (
                          <span className="badge badge-success">
                            <ArrowDownRight size={14} /> STOCK IN
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <ArrowUpRight size={14} /> STOCK OUT
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{m.product_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.product_category}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: m.type === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
                          {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>
                      </td>
                      <td>{m.reason}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist Panel */}
        <div className="card-panel">
          <div className="panel-header">
            <h2 className="panel-title" style={{ color: 'var(--warning)' }}>
              <AlertTriangle size={18} /> Low Stock Watchlist
            </h2>
          </div>

          {stats.lowStockList.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title" style={{ color: 'var(--success)' }}>All Stock Levels Healthy</p>
              <p style={{ fontSize: '0.85rem' }}>No products are currently at or below minimum thresholds.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.lowStockList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: item.quantity === 0 ? 'var(--danger-light)' : 'var(--warning-light)',
                    border: `1px solid ${item.quantity === 0 ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Category: {item.category} (Min: {item.minimum_stock})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className={`badge ${item.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}
                    >
                      {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} Left`}
                    </span>
                    <div style={{ marginTop: '0.25rem' }}>
                      <Link
                        to="/stock"
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        + Restock
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
