import db from '../dbConnection/db.js';

const getMarketStoreCounts = async (req, res) => {
  try {
    // Extract query parameters (optional startDate and endDate)
    const { startDate, endDate } = req.query;
     console.log(req.query)

    // Base SQL query
    let query = `
      SELECT COUNT(*) AS count, ms.market 
      FROM images AS i 
      LEFT JOIN marketstructure AS ms 
      ON LOWER(ms.storeaddress) = LOWER(i.storeaddress)
    `;

    // Array to hold query parameters
    const queryParams = [];

    // Add date range filtering ONLY if startDate and endDate are provided
    if (startDate && endDate) {
      query += ` WHERE DATE(i.createdat) BETWEEN ? AND ? `;
      queryParams.push(startDate, endDate);
    }

    // Group by market
    query += ` GROUP BY ms.market`;

    console.log("Executing Query:", query); // Debugging: Log the query

    // Execute the query with or without date range parameters
    const [results] = await db.promise().query(query, queryParams);

    console.log("Query Results:", results); // Debugging: Log the query results

    // Send the response (even if results are empty)
    return res.status(200).json({ success: true, data: results });

  } catch (err) {
    // Log the error and send an error response
    console.error("Error fetching market store counts:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default getMarketStoreCounts;