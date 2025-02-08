import db from '../dbConnection/db.js';

const getMarketWiseStoreStatus = async (req, res) => {
  try {
    // Extract data from the request body and query parameters
    const {market, startDate, endDate } = req.query;

    // Validate market input
    if (!market) {
      return res.status(400).json({
        success: false,
        message: "Market is required in the request body."
      });
    }

    // Default to today's date if no date range is provided
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const start = startDate || today;
    const end = endDate || today;

    console.log("Market:", market); // Debugging: Log the market
    console.log("Date Range:", { start, end }); // Debugging: Log the date range

    // Define the SQL query
    const query = `
      SELECT 
        m.market,
        m.storename,
        m.storeemail,
        CASE 
          WHEN COUNT(i.userid) > 0 THEN 'Completed'
          ELSE 'Not Completed'
        END AS status
      FROM 
        marketstructure m
      LEFT JOIN 
        users u ON m.storeemail = u.email
      LEFT JOIN 
        images i ON u.id = i.userid
        AND DATE(i.createdat) BETWEEN ? AND ?
      WHERE 
        m.market = ?
      GROUP BY 
        m.market, m.storename, m.storeemail;
    `;

    // Execute the query with parameters
    const [results] = await db.promise().query(query, [start, end, market]);

    console.log("Query Results:", results); // Debugging: Log the query results

    // Handle empty results
    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data found for the specified market and date range.",
        data: []
      });
    }

    // Send the response
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    // Log the error and send an error response
    console.error("Error fetching market-wise store status:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default getMarketWiseStoreStatus;