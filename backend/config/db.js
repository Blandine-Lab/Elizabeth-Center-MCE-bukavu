// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 DATABASE_URL chargée ?', process.env.DATABASE_URL ? '✅ Oui' : '❌ Non');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  max: 20,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => console.error('❌ Pool error:', err.message));

// Ping toutes les 30 secondes pour garder la connexion ouverte
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('❌ Ping DB failed:', err.message);
  }
}, 30000);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  } else {
    console.log('✅ DB connected at', res.rows[0].now);
  }
});

module.exports = pool;