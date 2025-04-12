import fs from 'fs'
import path from 'path';
import csv from 'csv-parser'
import db from '../../dbConnection/db.js';

const handleMarketStructureFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const filePath = path.join('uploads', req.file.originalname);

  // Read and parse the CSV file
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Skip empty rows or rows with missing required fields
      if (!data['Store Name'] || !data['Store Email']) {
        return;
      }

      const transformedRow = {
        mainstore: data['Store Name'].trim(),
        dm: data['DM Name']?.trim() || null,
        doorcode: data['Door Code']?.trim() || null,
        Market: data['Market']?.trim() || null,
        storeemail: data['Store Email'].trim(),
        storeaddress: data['Store Address']?.trim() || null,
      };

      // Only push if storeemail is valid
      if (transformedRow.storeemail && transformedRow.storeemail.trim() !== '') {
        results.push(transformedRow);
      }
    })
    .on('end', () => {
      if (results.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ message: 'No valid data found in the CSV file.' });
      }

      // Step 1: Truncate the table before inserting new data
      const truncateQuery = 'TRUNCATE TABLE marketstructure';

      db.query(truncateQuery, (err) => {
        if (err) {
          console.error('Error truncating table:', err);
          fs.unlinkSync(filePath);
          return res.status(500).json({ message: 'Failed to truncate the table.' });
        }

        // Step 2: Insert the new data with error handling
        const insertQuery = 'INSERT INTO marketstructure (storename, dmname, doorcode, Market, storeemail, storeaddress) VALUES ?';
        
        // Prepare batch insert values
        const values = results.map(row => [
          row.mainstore,
          row.dm,
          row.doorcode,
          row.Market,
          row.storeemail,
          row.storeaddress
        ]);

        // Use batch insert for better performance
        db.query(insertQuery, [values], (err, result) => {
          // Remove the uploaded file after processing
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Error deleting file: ${err}`);
          }

          if (err) {
            console.error('Database insertion failed:', err);
            return res.status(500).json({ 
              message: 'Failed to insert data into database.',
              details: err.message 
            });
          }

          res.status(200).json({
            message: 'File processed and data inserted into the database successfully.',
            insertedRows: result.affectedRows
          });
        });
      });
    })
    .on('error', (err) => {
      console.error('Error reading the file:', err);
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error(`Error deleting file: ${unlinkErr}`);
      }
      res.status(500).json({ message: 'Failed to process the file.' });
    });
};

export default handleMarketStructureFileUpload;