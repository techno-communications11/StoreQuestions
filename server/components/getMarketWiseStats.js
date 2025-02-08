import db from '../dbConnection/db.js';

const getMarketStoreCounts = async (req, res) => {
  try {
    // Extract query parameters (optional startDate and endDate)
    const { startDate, endDate } = req.query;

    // Default to today's date if no date range is provided
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const start = startDate || today;
    const end = endDate || today;

    console.log("Date Range:", { start, end }); // Debugging: Log the date range

    // Define the SQL query
    const query = `
      SELECT 
        m.market,
        COUNT(DISTINCT CASE WHEN i.userid IS NOT NULL THEN m.storename END) AS completed_stores_count,
        COUNT(DISTINCT CASE WHEN i.userid IS NULL THEN m.storename END) AS not_completed_stores_count
      FROM 
        marketstructure m
      LEFT JOIN 
        users u ON m.storeemail = u.email AND u.email IS NOT NULL
      LEFT JOIN 
        images i ON u.id = i.userid AND i.userid IS NOT NULL
        AND DATE(i.createdat) BETWEEN ? AND ?
      GROUP BY 
        m.market;
    `;

    console.log("Executing Query:", query, [start, end]); // Debugging: Log the query

    // Execute the query with parameters
    const [results] = await db.promise().query(query, [start, end]);

    console.log("Query Results:", results); // Debugging: Log the query results

    // Handle empty results
    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data found for the specified date range.",
        data: []
      });
    }

    // Send the response
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    // Log the error and send an error response
    console.error("Error fetching market store counts:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default getMarketStoreCounts;