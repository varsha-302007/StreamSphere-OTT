const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'streamsphere_db',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

// Test connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(' Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'streamsphere_db'));
    connection.release();
  } catch (error) {
    console.error(' Failed to connect to MySQL database:', error.message);
  }
}

testConnection();

module.exports = pool;
