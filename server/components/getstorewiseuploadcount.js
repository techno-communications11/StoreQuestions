import db from "../dbConnection/db.js";
const getstorewiseuploadcount=async(req,res)=>{
    const { market } = req.query;  // Get the market from the query parameters
  
    if (!market) {
      return res.status(400).json({ success: false, message: "Market is required" });
    }
  
    try {
      // SQL Query to get store-wise upload counts for the provided market
      const sql = `
        WITH StoreNTIDs AS (
            SELECT m.market, m.storename, c.ntid
            FROM marketStructure m
            JOIN credentials c ON m.doorcode = c.doorcode
            WHERE m.market = ?
        ),
        StoreUploadStatus AS (
            SELECT DISTINCT s.storename, s.market
            FROM StoreNTIDs s
            JOIN images i ON s.ntid = i.ntid
        )
        SELECT 
            m.market,
            m.storename,
            COUNT(DISTINCT su.storename) AS uploaded_stores_count,
            COUNT(DISTINCT m.storename) - COUNT(DISTINCT su.storename) AS not_uploaded_stores_count
        FROM marketStructure m
        LEFT JOIN StoreUploadStatus su ON m.storename = su.storename
        WHERE m.market = ?
        GROUP BY m.market, m.storename;
      `;
      
      // Execute the query using async/await
      const result = await db.promise().query(sql, [market, market]);
       console.log(result)
  
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "No data found for this market" });
      }
  
      // Send the response with the fetched data
      res.json({ success: true, data: result });
      
    } catch (err) {
      console.error("Error fetching store-wise upload counts:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
 }
  export default getstorewiseuploadcount