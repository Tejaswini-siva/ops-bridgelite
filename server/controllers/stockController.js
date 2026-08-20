const { getDb } = require('../database/db');

// POST /api/stock/in
exports.stockIn = (req, res) => {
  try {
    const db = getDb();
    const { product_id, quantity, reason } = req.body;

    const productIdNum = Number(product_id);
    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({ success: false, message: 'Valid product ID is required' });
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number greater than 0' });
    }

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reason for stock in is required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productIdNum);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stockInTransaction = db.transaction(() => {
      const updateStmt = db.prepare(`
        UPDATE products
        SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(qtyNum, productIdNum);

      const movementStmt = db.prepare(`
        INSERT INTO stock_movements (product_id, type, quantity, reason)
        VALUES (?, 'IN', ?, ?)
      `);
      const result = movementStmt.run(productIdNum, qtyNum, reason.trim());

      return result.lastInsertRowid;
    });

    const movementId = stockInTransaction();
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productIdNum);

    res.json({
      success: true,
      message: `Successfully added ${qtyNum} unit(s) to "${updatedProduct.name}"`,
      data: {
        movement_id: movementId,
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Error recording stock in:', error);
    res.status(500).json({ success: false, message: 'Failed to process stock-in' });
  }
};

// POST /api/stock/out
exports.stockOut = (req, res) => {
  try {
    const db = getDb();
    const { product_id, quantity, reason } = req.body;

    const productIdNum = Number(product_id);
    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({ success: false, message: 'Valid product ID is required' });
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number greater than 0' });
    }

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reason for stock out is required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productIdNum);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (qtyNum > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Requested: ${qtyNum}, Available: ${product.quantity}`
      });
    }

    const stockOutTransaction = db.transaction(() => {
      const updateStmt = db.prepare(`
        UPDATE products
        SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(qtyNum, productIdNum);

      const movementStmt = db.prepare(`
        INSERT INTO stock_movements (product_id, type, quantity, reason)
        VALUES (?, 'OUT', ?, ?)
      `);
      const result = movementStmt.run(productIdNum, qtyNum, reason.trim());

      return result.lastInsertRowid;
    });

    const movementId = stockOutTransaction();
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productIdNum);

    res.json({
      success: true,
      message: `Successfully removed ${qtyNum} unit(s) from "${updatedProduct.name}"`,
      data: {
        movement_id: movementId,
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Error recording stock out:', error);
    res.status(500).json({ success: false, message: 'Failed to process stock-out' });
  }
};

// GET /api/stock/history
exports.getStockHistory = (req, res) => {
  try {
    const db = getDb();
    const history = db.prepare(`
      SELECT 
        sm.id,
        sm.product_id,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_at,
        p.name as product_name,
        p.category as product_category
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.id DESC
    `).all();

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movement history' });
  }
};
