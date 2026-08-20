const { getDb } = require('../database/db');

// GET /api/dashboard/stats
exports.getDashboardStats = (req, res) => {
  try {
    const db = getDb();
    const totalProductsResult = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const totalProducts = totalProductsResult ? totalProductsResult.count : 0;

    const totalStockResult = db.prepare('SELECT SUM(quantity) as total FROM products').get();
    const totalStock = (totalStockResult && totalStockResult.total) ? totalStockResult.total : 0;

    const lowStockProductsResult = db.prepare(`
      SELECT COUNT(*) as count FROM products 
      WHERE quantity > 0 AND quantity <= minimum_stock
    `).get();
    const lowStockProducts = lowStockProductsResult ? lowStockProductsResult.count : 0;

    const outOfStockProductsResult = db.prepare(`
      SELECT COUNT(*) as count FROM products 
      WHERE quantity = 0
    `).get();
    const outOfStockProducts = outOfStockProductsResult ? outOfStockProductsResult.count : 0;

    const lowStockList = db.prepare(`
      SELECT id, name, category, quantity, minimum_stock
      FROM products
      WHERE quantity <= minimum_stock
      ORDER BY quantity ASC
    `).all();

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        lowStockProducts,
        outOfStockProducts,
        lowStockList
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
  }
};

// GET /api/dashboard/recent-movements
exports.getRecentMovements = (req, res) => {
  try {
    const db = getDb();
    const recentMovements = db.prepare(`
      SELECT 
        sm.id,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_at,
        p.name as product_name,
        p.category as product_category
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.id DESC
      LIMIT 6
    `).all();

    res.json({ success: true, data: recentMovements });
  } catch (error) {
    console.error('Error fetching recent movements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent stock movements' });
  }
};
