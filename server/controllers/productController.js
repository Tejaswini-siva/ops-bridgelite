const { getDb } = require('../database/db');

function getStockStatus(quantity, minStock) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= minStock) return 'Low Stock';
  return 'In Stock';
}

// GET /api/products
exports.getAllProducts = (req, res) => {
  try {
    const db = getDb();
    const products = db.prepare(`
      SELECT * FROM products ORDER BY id DESC
    `).all();

    const formattedProducts = products.map(p => ({
      ...p,
      stock_status: getStockStatus(p.quantity, p.minimum_stock)
    }));

    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// GET /api/products/:id
exports.getProductById = (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: {
        ...product,
        stock_status: getStockStatus(product.quantity, product.minimum_stock)
      }
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

// POST /api/products
exports.createProduct = (req, res) => {
  try {
    const db = getDb();
    const { name, category, price, quantity = 0, minimum_stock = 5 } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }

    const numMinStock = Number(minimum_stock);
    if (isNaN(numMinStock) || numMinStock < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock level cannot be negative' });
    }

    const createTransaction = db.transaction(() => {
      const insertStmt = db.prepare(`
        INSERT INTO products (name, category, price, quantity, minimum_stock, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      const result = insertStmt.run(name.trim(), category.trim(), numPrice, numQty, numMinStock);
      const newId = result.lastInsertRowid;

      if (numQty > 0) {
        const movementStmt = db.prepare(`
          INSERT INTO stock_movements (product_id, type, quantity, reason)
          VALUES (?, 'IN', ?, 'Initial Stock')
        `);
        movementStmt.run(newId, numQty);
      }

      return newId;
    });

    const createdId = createTransaction();
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(createdId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...newProduct,
        stock_status: getStockStatus(newProduct.quantity, newProduct.minimum_stock)
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
exports.updateProduct = (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name, category, price, minimum_stock } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
    }

    const numMinStock = Number(minimum_stock);
    if (isNaN(numMinStock) || numMinStock < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock level cannot be negative' });
    }

    const updateStmt = db.prepare(`
      UPDATE products
      SET name = ?, category = ?, price = ?, minimum_stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(name.trim(), category.trim(), numPrice, numMinStock, id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...updatedProduct,
        stock_status: getStockStatus(updatedProduct.quantity, updatedProduct.minimum_stock)
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const movementCountResult = db.prepare(
      'SELECT COUNT(*) as count FROM stock_movements WHERE product_id = ?'
    ).get(id);
    const movementCount = movementCountResult ? movementCountResult.count : 0;

    if (movementCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product "${existing.name}" because it has ${movementCount} historical stock movement record(s). Audit history must be preserved.`
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
