const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbDir = __dirname;
const dbPath = path.join(dbDir, 'opsbridge.db');

let db = null;
let inTransaction = false;

function saveDb() {
  if (!db || inTransaction) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving DB to disk:', err);
  }
}

class StatementWrapper {
  constructor(sql) {
    this.sql = sql;
  }

  all(...args) {
    const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const stmt = db.prepare(this.sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  get(...args) {
    const results = this.all(...args);
    return results.length > 0 ? results[0] : undefined;
  }

  run(...args) {
    const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    db.run(this.sql, params);
    
    // Get last insert rowid and changes
    const lastIdRes = db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = lastIdRes.length > 0 && lastIdRes[0].values.length > 0 ? lastIdRes[0].values[0][0] : 0;

    const changesRes = db.exec('SELECT changes() as count');
    const changes = changesRes.length > 0 && changesRes[0].values.length > 0 ? changesRes[0].values[0][0] : 0;

    saveDb();
    return { lastInsertRowid, changes };
  }
}

const dbWrapper = {
  prepare(sql) {
    return new StatementWrapper(sql);
  },

  exec(sql) {
    db.run(sql);
    saveDb();
  },

  transaction(fn) {
    return (...args) => {
      inTransaction = true;
      try {
        const result = fn(...args);
        inTransaction = false;
        saveDb();
        return result;
      } catch (err) {
        inTransaction = false;
        throw err;
      }
    };
  }
};

async function initializeDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      minimum_stock INTEGER NOT NULL DEFAULT 5 CHECK(minimum_stock >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );
  `);

  const countRes = db.exec('SELECT COUNT(*) as count FROM products');
  const count = countRes.length > 0 && countRes[0].values.length > 0 ? countRes[0].values[0][0] : 0;

  if (count === 0) {
    inTransaction = true;
    try {
      const sampleProducts = [
        ['Laptop Pro 15"', 'Electronics', 899.99, 15, 5],
        ['Ergonomic Office Chair', 'Furniture', 149.50, 22, 5],
        ['Mechanical Keyboard', 'Electronics', 45.00, 30, 10],
        ['Wireless Optical Mouse', 'Electronics', 25.00, 4, 5],
        ['27-inch HD Monitor', 'Electronics', 210.00, 0, 5],
        ['Multi-function Printer', 'Electronics', 180.00, 8, 3],
        ['A4 Executive Notebook', 'Office Supplies', 4.50, 150, 20],
        ['USB-C Fast Cable 2m', 'Accessories', 8.99, 3, 10]
      ];

      for (const prod of sampleProducts) {
        db.run(
          'INSERT INTO products (name, category, price, quantity, minimum_stock) VALUES (?, ?, ?, ?, ?)',
          prod
        );
        const lastIdRes = db.exec('SELECT last_insert_rowid() as id');
        const prodId = lastIdRes[0].values[0][0];

        if (prod[3] > 0) {
          db.run(
            "INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES (?, 'IN', ?, 'Initial Stock')",
            [prodId, prod[3]]
          );
        }
      }
      console.log('Database initialized and seeded with sample products!');
    } catch (e) {
      console.error('Seeding error:', e);
    } finally {
      inTransaction = false;
    }
  }

  saveDb();
  return dbWrapper;
}

module.exports = {
  initializeDatabase,
  getDb: () => dbWrapper
};
