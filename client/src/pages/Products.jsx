import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    category: '',
    price: '',
    quantity: '0',
    minimum_stock: '5',
  });

  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.data);
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

  // Get unique categories for filter
  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  // Filtered Products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      id: null,
      name: '',
      category: '',
      price: '',
      quantity: '0',
      minimum_stock: '5',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      minimum_stock: product.minimum_stock.toString(),
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Create Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProduct({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        minimum_stock: parseInt(formData.minimum_stock, 10),
      });

      if (res.success) {
        showToast(`Product "${formData.name}" created successfully!`);
        setIsAddModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    }
  };

  // Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProduct(formData.id, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        minimum_stock: parseInt(formData.minimum_stock, 10),
      });

      if (res.success) {
        showToast(`Product updated successfully!`);
        setIsEditModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update product', 'error');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const res = await api.deleteProduct(productToDelete.id);
      if (res.success) {
        showToast(`Product deleted successfully!`);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message, 'error');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-title-group">
          <h1>Product Catalog</h1>
          <p>View, add, edit, and track all products in your inventory.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="card-panel">
        {/* Toolbar with Search and Category Filter */}
        <div className="toolbar">
          <div className="search-group">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={40} className="empty-state-icon" />
            <p className="empty-state-title">No products found</p>
            <p style={{ fontSize: '0.85rem' }}>
              {searchQuery || categoryFilter !== 'ALL'
                ? 'Try adjusting your search query or filter.'
                : 'Click "Add New Product" to populate your inventory.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{p.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Min Stock: {p.minimum_stock} units
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>{p.quantity}</td>
                    <td>
                      {p.stock_status === 'In Stock' && (
                        <span className="badge badge-success">In Stock</span>
                      )}
                      {p.stock_status === 'Low Stock' && (
                        <span className="badge badge-warning">Low Stock</span>
                      )}
                      {p.stock_status === 'Out of Stock' && (
                        <span className="badge badge-danger">Out of Stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Edit Product"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                          onClick={() => openDeleteModal(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              placeholder="e.g. Ergonomic Keyboard"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <input
              type="text"
              name="category"
              required
              className="form-control"
              placeholder="e.g. Electronics, Office Supplies"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Price ($) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                className="form-control"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Initial Quantity <span className="required">*</span></label>
              <input
                type="number"
                name="quantity"
                min="0"
                required
                className="form-control"
                placeholder="0"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Minimum Stock Level <span className="required">*</span></label>
            <input
              type="number"
              name="minimum_stock"
              min="0"
              required
              className="form-control"
              placeholder="5"
              value={formData.minimum_stock}
              onChange={handleInputChange}
            />
            <span className="form-hint">Triggers Low Stock warning when quantity reaches or drops below this number.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Product
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <input
              type="text"
              name="category"
              required
              className="form-control"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Price ($) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                className="form-control"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock Level <span className="required">*</span></label>
              <input
                type="number"
                name="minimum_stock"
                min="0"
                required
                className="form-control"
                value={formData.minimum_stock}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Note: Product stock quantity is managed via <strong>Stock Management</strong> page to ensure audit accuracy.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>?
          </p>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--warning)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Products with existing stock movement history cannot be deleted to preserve system audit logs.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
