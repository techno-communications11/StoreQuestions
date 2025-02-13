import db from '../dbConnection/db.js';

const getMarketWiseStoreStatus = async (req, res) => {
  try {
    // Extract data from the request query
    const { startDate, endDate } = req.query;

    // Default to all available dates if no date range is provided
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const start = startDate || today; // Start of time (or earliest possible date)
    const end = endDate || today; // Today's date

    // Calculate the total number of days in the date range
    const totalDaysInRange = Math.ceil(
      (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
    ) + 1; // Add 1 to include both start and end dates

    // Base SQL query
    let query = `
      SELECT 
        ms.market AS market,
        ms.storename AS storename,
        COUNT(DISTINCT CASE WHEN i.url IS NOT NULL THEN DATE(i.createdat) END) AS completed_count,
        ? - COUNT(DISTINCT CASE WHEN i.url IS NOT NULL THEN DATE(i.createdat) END) AS not_completed_count
      FROM marketstructure AS ms
      LEFT JOIN images AS i 
        ON LOWER(ms.storeaddress) = LOWER(i.storeaddress)
        AND DATE(i.createdat) BETWEEN ? AND ?
      GROUP BY ms.market, ms.storename
      ORDER BY ms.market ASC, ms.storename ASC;
    `;

    // Array to hold query parameters
    const queryParams = [totalDaysInRange, start, end];

    // Execute the query with parameters
    const [results] = await db.promise().query(query, queryParams);

    // Handle empty results
    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data found for the specified date range.",
        data: []
      });
    }
     console.log(results)

    // Send the response with query results
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    // Log the error and send an error response
    console.error("Error fetching market-wise store status:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default getMarketWiseStoreStatus;