import React, { useState, useEffect } from 'react';
import { History, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import Toast from '../components/Toast';

export default function StockHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getStockHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to load stock history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-title-group">
          <h1>Stock Movement Audit History</h1>
          <p>Chronological audit log of all stock receipts and dispatches.</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="toolbar">
          <div className="search-group">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search history by product name, category, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="IN">Stock IN</option>
              <option value="OUT">Stock OUT</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading movement audit logs...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <History size={40} className="empty-state-icon" />
            <p className="empty-state-title">No stock movements found</p>
            <p style={{ fontSize: '0.85rem' }}>
              {searchQuery || typeFilter !== 'ALL'
                ? 'Try adjusting your search query or filter.'
                : 'Stock transactions will be automatically logged here.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Movement ID</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason / Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{item.id}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>
                      {item.type === 'IN' ? (
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
                      <strong style={{ color: 'var(--text-main)' }}>{item.product_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Category: {item.product_category}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{ color: item.type === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
                        {item.type === 'IN' ? `+${item.quantity}` : `-${item.quantity}`}
                      </span>
                    </td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
