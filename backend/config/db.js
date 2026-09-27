// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 DATABASE_URL chargée ?', process.env.DATABASE_URL ? '✅ Oui' : '❌ Non');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,                                 // ← réduit pour Neon pooler
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('❌ Pool error (ignorée, reconnexion auto):', err.message);
});

setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.warn('⚠️ Ping DB échoué (retry auto):', err.message);
  }
}, 60000);

pool.query('SELECT NOW()')
  .then((res) => console.log('✅ DB connected at', res.rows[0].now))
  .catch((err) => {
    console.error('❌ DB connection error (le serveur continue):', err.message);
  });

module.exports = pool;