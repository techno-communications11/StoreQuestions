
import fs from 'fs'
import path from 'path';
import csv from 'csv-parser'
import db from '../dbConnection/db.js';

const handleMarketStructureFileUpload = (req, res) => {
   console.log("request sent")
  if (!req.file) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const filePath = path.join('uploads', req.file.originalname);

  // Read and parse the CSV file
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Map the file columns to database fields
      const transformedRow = {
        mainstore: data['Store Name'],
        dm: data['DM Name'],
        doorcode: data['Door Code'],
        Market: data['Market'],
        storeemail:data['Store Email'],
        storeaddress:data['Store Address'],
      };
       console.log(transformedRow,'datatt')
      results.push(transformedRow);
    })
    .on('end', () => {
      // Step 1: Truncate the table before inserting new data
      const truncateQuery = 'TRUNCATE TABLE marketstructure';

      db.query(truncateQuery, (err) => {
        if (err) {
          console.error('Error truncating table:', err);
          return res.status(500).json({ message: 'Failed to truncate the table.' });
        }

        // Step 2: Insert the new data
        const insertQuery = 'INSERT INTO marketstructure (storename, dmname, doorcode, Market,storeemail,storeaddress) VALUES (?, ?, ?, ?,?,?)';
        
        results.forEach((row) => {
          db.query(insertQuery, [row.mainstore, row.dm, row.doorcode, row.Market, row.storeemail,row.storeaddress], (err, result) => {
            if (err) {
              console.error('Database insertion failed:', err);
            }
          });
        });

        // Remove the uploaded file after successful processing and insertion
        try {
          fs.unlinkSync(filePath); // Remove the file
          console.log(`File ${filePath} deleted successfully.`);
        } catch (err) {
          console.error(`Error deleting file: ${err}`);
        }

        res.status(200).json({
          message: 'File processed and data inserted into the database successfully.',
        });
      });
    })
    .on('error', (err) => {
      console.error('Error reading the file:', err);
      res.status(500).json({ message: 'Failed to process the file.' });
    });
};

export default handleMarketStructureFileUpload