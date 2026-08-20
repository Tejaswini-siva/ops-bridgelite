import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { api } from '../services/api';
import Toast from '../components/Toast';

const STOCK_IN_REASONS = ['Purchase', 'New Stock', 'Customer Return', 'Supplier Restock', 'Other'];
const STOCK_OUT_REASONS = ['Sale', 'Damaged / Expired', 'Internal Office Use', 'Transfer', 'Other'];

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('IN'); // 'IN' or 'OUT'
  const [toast, setToast] = useState(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.data);
        if (res.data.length > 0 && !selectedProductId) {
          setSelectedProductId(res.data[0].id.toString());
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      showToast('Please select a product', 'error');
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast('Quantity must be a positive integer greater than 0', 'error');
      return;
    }

    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason || finalReason.trim() === '') {
      showToast('Please select or provide a reason for stock movement', 'error');
      return;
    }

    // Additional Stock-Out check on frontend before submitting
    if (activeTab === 'OUT' && selectedProduct && qtyNum > selectedProduct.quantity) {
      showToast(
        `Insufficient stock! Requested: ${qtyNum}, Available: ${selectedProduct.quantity}`,
        'error'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        product_id: parseInt(selectedProductId, 10),
        quantity: qtyNum,
        reason: finalReason.trim(),
      };

      const res = activeTab === 'IN'
        ? await api.recordStockIn(payload)
        : await api.recordStockOut(payload);

      if (res.success) {
        showToast(res.message);
        setQuantity('');
        setReason('');
        setCustomReason('');
        fetchProducts(); // Refresh list to get updated stock numbers
      }
    } catch (err) {
      showToast(err.message || 'Failed to process stock movement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-title-group">
          <h1>Stock Management</h1>
          <p>Record stock additions (Stock In) and stock disbursements (Stock Out).</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px' }}>
        {/* Tab Selection */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'IN' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('IN');
              setReason('');
            }}
          >
            <ArrowDownRight size={16} inline style={{ marginRight: '6px' }} />
            Stock In (Receive Inventory)
          </button>
          <button
            className={`tab-btn ${activeTab === 'OUT' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('OUT');
              setReason('');
            }}
          >
            <ArrowUpRight size={16} inline style={{ marginRight: '6px' }} />
            Stock Out (Issue Inventory)
          </button>
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              {activeTab === 'IN' ? (
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowDownRight size={20} /> Record Stock In
                </span>
              ) : (
                <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpRight size={20} /> Record Stock Out
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading product catalog...</p>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No products available</p>
              <p style={{ fontSize: '0.85rem' }}>Add products to the catalog first before recording stock movements.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Product Selection */}
              <div className="form-group">
                <label>Select Product <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) — Current Stock: {p.quantity} units
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Stock Card Summary */}
              {selectedProduct && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Category: {selectedProduct.category} | Price: ${selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Quantity</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: selectedProduct.quantity === 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                      {selectedProduct.quantity} units
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="form-group">
                <label>Movement Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  placeholder="Enter quantity (e.g. 5)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Reason */}
              <div className="form-group">
                <label>Reason for Movement <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">-- Select Reason --</option>
                  {(activeTab === 'IN' ? STOCK_IN_REASONS : STOCK_OUT_REASONS).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {reason === 'Other' && (
                <div className="form-group">
                  <label>Specify Custom Reason <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter details..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Warning for Stock Out exceeding available */}
              {activeTab === 'OUT' && selectedProduct && parseInt(quantity, 10) > selectedProduct.quantity && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--danger-light)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>Cannot issue more stock than available ({selectedProduct.quantity} units).</span>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className={`btn ${activeTab === 'IN' ? 'btn-primary' : 'btn-danger'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : activeTab === 'IN'
                    ? '+ Confirm Stock In'
                    : '- Confirm Stock Out'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
