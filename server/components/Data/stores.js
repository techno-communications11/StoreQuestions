import db from '../../dbConnection/db.js'; // Import the connection pool

const stores = async (req, res) => {
    try {
        const query = `
            SELECT ms.storename, ms.storeaddress, cs.ntid 
            FROM marketstructure AS ms 
            LEFT JOIN credentials AS cs 
            ON cs.doorcode = ms.doorcode
        `;

        // Execute the query using the connection pool
        const [rows] = await db.promise().query(query);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No stores found.' });
        }

        // Send the rows as the response
        return res.status(200).json(rows);
    } catch (err) {
        console.error('Database error:', err.message || err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default stores;