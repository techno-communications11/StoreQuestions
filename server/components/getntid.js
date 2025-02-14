import db from '../dbConnection/db.js';  // Import the connection pool

const getntid = (req, res) => {
    const query = 'SELECT ntid FROM credentials';

    // Execute the query using the connection pool
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Database error:', err.message || err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No stores found.' });
        }

        // Send the rows as the response
        res.status(200).json(rows);
    }); 
};

export default getntid;
