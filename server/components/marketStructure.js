import multer from 'multer';
import csv from 'csvtojson';
import db from '../dbConnection/db.js'; // Import the MySQL database connection

// Configure Multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const excelUploads = multer({ storage });

// Function to remove whitespace from keys
const removeWhitespaceFromKeys = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key.replace(/\s+/g, '')] = obj[key]; // Remove spaces from keys
  });
  return newObj;
};

const MarketStructure = async (req, res) => {
  console.log('Received a request for market structure upload.');

  // Use multer middleware to handle file upload
  excelUploads.single('file')(req, res, async (err) => {
    if (err) {
      console.log('Multer Error:', err);
      return res.status(400).send({
        status: 400,
        success: false,
        msg: 'File upload error: ' + err.message,
      });
    }

    try {
      // Check if file exists in the request
      if (!req.file) {
        console.log('No file received');
        return res.status(400).send({
          status: 400,
          success: false,
          msg: 'File upload failed: No file object found.',
        });
      }

      console.log('File received:', req.file.originalname);

      // Convert buffer to string and parse CSV
      const csvString = req.file.buffer.toString();
      const jsonData = await csv().fromString(csvString);
      console.log('Parsed CSV Data:', jsonData);

      // Remove whitespace from keys
      const formattedData = jsonData.map((item) => removeWhitespaceFromKeys(item));

      // Map data to match MySQL table structure
      const marketData = formattedData.map((item) => ({
        storeName: item.storename || '', // Ensure default values are set
        market: item.market || '',
        doorCode: item.doorcode || null, // Use null for missing numeric fields
        dmName: item.dmaname || '', // Corrected key name to match CSV column
      }));

      console.log('Final formatted data:', marketData);

      // Validate if there's any data to insert
      if (marketData.length === 0) {
        return res.status(400).send({
          status: 400,
          success: false,
          msg: 'No valid data to insert.',
        });
      }

      // Get a database connection
      const connection = await new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
          if (err) {
            return reject(err);
          }
          resolve(connection);
        });
      });

      try {
        // Insert query with ON DUPLICATE KEY UPDATE
        const insertQuery = `
          INSERT INTO marketstructure (storename, market, doorCode, dmname)
          VALUES ?
          ON DUPLICATE KEY UPDATE
          storename = VALUES(storename), market = VALUES(market), dmname = VALUES(dmname);
        `;

        // Prepare values for bulk insert
        const values = marketData.map(({ storename, market, doorcode, dmname }) => [
          storename,
          market,
          doorcode,
          dmname,
        ]);

        // Execute the query
        await connection.query(insertQuery, [values]);
        console.log('Data successfully inserted into MySQL.');

        // Send success response
        res.status(200).send({
          status: 200,
          success: true,
          msg: 'CSV file successfully processed',
          data: marketData,
        });
      } finally {
        // Release the database connection
        connection.release();
      }
    } catch (error) {
      console.error('Error during processing:', error.stack);
      res.status(400).send({
        status: 400,
        success: false,
        msg: error.message,
        error: error.stack,
      });
    }
  });
};

export default MarketStructure;
