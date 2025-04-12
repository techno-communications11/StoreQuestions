import db from "../../dbConnection/db.js";

const getmarkets = async (req, res) => {
    // Use DISTINCT on market to get unique markets with their first id
    const query = `
        SELECT MIN(id) AS id, market 
        FROM marketstructure 
        GROUP BY market
    `;

    try {
        const [result] = await db.promise().query(query);
        
        if (result.length === 0) {
            return res.status(400).json({ message: "No markets found" });
        }

        // Map the result to ensure consistent structure
        const markets = result.map(row => ({
            id: row.id,
            market: row.market
        }));

        res.status(200).json(markets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default getmarkets;