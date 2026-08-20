require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database/db');

const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(` OpsBridge Lite Server running on port ${PORT}`);
    console.log(` SQLite Database: Ready (sql.js WebAssembly)`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
