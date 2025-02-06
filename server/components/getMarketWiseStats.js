import db from "../dbConnection/db.js";
const getMarketWiseStats=async(req,res)=>{
    try {
        const query = `
         WITH StoreNTIDs AS (
    -- Step 1 & 2: Fetch market, storename, doorcode, and get ntid from credentials
    SELECT m.market, m.storename, c.ntid
    FROM marketStructure m
    JOIN credentials c ON m.doorcode = c.doorcode
),
StoreUploadStatus AS (
    -- Step 3: Identify stores that uploaded at least one URL
    SELECT DISTINCT s.storename, s.market, i.createdat  -- Include created_at from images
    FROM StoreNTIDs s
    JOIN images i ON s.ntid = i.ntid
)
-- Step 4: Count uploaded & not uploaded stores per market and list all createdat dates for uploads
SELECT 
    m.market,
    COUNT(DISTINCT CASE WHEN su.storename IS NOT NULL THEN su.storename END) AS uploaded_stores_count,
    COUNT(DISTINCT CASE WHEN su.storename IS NULL THEN m.storename END) AS not_uploaded_stores_count,
    GROUP_CONCAT(DISTINCT su.createdat ORDER BY su.createdat ASC) AS all_uploaded_dates  -- All created_at dates in a single row
FROM marketStructure m
LEFT JOIN StoreUploadStatus su ON m.storename = su.storename  -- Left join to get uploaded stores
GROUP BY m.market;

        `;
    
        const [results] = await db.promise().query(query);
        
        res.status(200).json({ success: true, data: results });
      } catch (error) {
        console.error("Error fetching market-wise store upload status:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
      }

}
export default getMarketWiseStats;