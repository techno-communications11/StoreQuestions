import db from '../dbConnection/db.js';

const getMarketWiseStoreStatus = async (req, res) => {
  try {
    // Extract data from the request query
    const { market, startDate, endDate } = req.query;

    // Validate market input
    if (!market) {
      return res.status(400).json({
        success: false,
        message: "Market is required in the request query."
      });
    }

    // Default to all available dates if no date range is provided
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const start = startDate || '2025-01-01'; // Start of time (or earliest possible date)
    const end = endDate || today; // Today's date

    // Calculate the total number of days in the date range
    const totalDaysInRange = Math.ceil(
      (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
    ) + 1; // Add 1 to include both start and end dates

    // Base SQL query
    let query = `
      SELECT 
        ms.storename AS storename,
        COUNT(DISTINCT CASE WHEN i.url IS NOT NULL THEN DATE(i.createdat) END) AS completed_count,
        ? - COUNT(DISTINCT CASE WHEN i.url IS NOT NULL THEN DATE(i.createdat) END) AS not_completed_count
      FROM marketstructure AS ms
      LEFT JOIN images AS i 
      ON LOWER(ms.storeaddress) = LOWER(i.storeaddress)
      AND DATE(i.createdat) BETWEEN ? AND ?
      WHERE ms.market = ?
    `;

    // Array to hold query parameters
    const queryParams = [totalDaysInRange, start, end, market];

    // Group by store name
    query += ` GROUP BY ms.storename ORDER BY ms.storename ASC`;

    // console.log("Executing Query:", query); // Debugging: Log the query
    // console.log("Query Parameters:", queryParams); // Debugging: Log the query parameters

    // Execute the query with parameters
    const [results] = await db.promise().query(query, queryParams);

    // console.log("Query Results:", results); // Debugging: Log the query results

    // Handle empty results
    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data found for the specified market and date range.",
        data: []
      });
    }

    // Send the response with query results
    return res.status(200).json({ success: true, data: results });

  } catch (err) {
    // Log the error and send an error response
    console.error("Error fetching market-wise store status:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default getMarketWiseStoreStatus;