import db from "../dbConnection/db.js";

const getmarkets = async (req, res) => {
    const query = `SELECT DISTINCT market FROM marketstructure`;
    
    try {
        const [result] = await db.promise().query(query);
        
        if (result.length === 0) {
            return res.status(400).json({ message: "No markets found" });
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default getmarkets;
