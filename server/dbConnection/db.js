import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,       // Database host
  user: process.env.DB_USER,       // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME,   // Database name
  waitForConnections: true,
  connectionLimit: 10,  // Adjust according to your needs
  queueLimit: 0,
});

// Check if the connection is successful
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error establishing a connection to the database:', err.message || err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release();  // Release the connection back to the pool
});

// Export the db pool for use in other files
export default db;
