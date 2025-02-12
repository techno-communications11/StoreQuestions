import db from "../dbConnection/db.js";

const getDmStats = async (req, res) => {
    const { dmname, startDate, endDate } = req.query; // Getting start and end date and DM name from client

    if (!dmname || typeof dmname !== "string") { // Check it or verify
        return res.status(400).json({ success: false, message: "Invalid dmname provided" });
    }

    try {
        // Step 1: Get all stores for the given DM name
        const [marketData] = await db.promise().query(
            `SELECT storename, storeaddress FROM marketStructure WHERE dmname = ?`,
            [dmname]
        );

        if (!marketData?.length) {
            return res.json({ success: true, data: [] });
        }

        // Extract storeaddresses for querying the images table
        const storeAddresses = marketData.map(store => store.storeaddress);

        // Step 2: Query unique days with uploads for each store
        let imageQuery = `
            SELECT storeaddress, DATE(createdAt) AS upload_date
            FROM images
            WHERE storeaddress IN (?)
        `;
        const queryParams = [storeAddresses];

        // Date filtering
        if (startDate && endDate) {
            imageQuery += ` AND DATE(createdAt) BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        } else {
            const today = new Date().toISOString().split('T')[0];
            imageQuery += ` AND DATE(createdAt) = ?`;
            queryParams.push(today);
        }

        // Group by storeaddress and upload_date to ensure one count per day
        imageQuery += ` GROUP BY storeaddress, DATE(createdAt)`;

        const [imageData] = await db.promise().query(imageQuery, queryParams);

        // Step 3: Prepare store-wise results
        const result = marketData.map(store => {
            // Find all unique days the store has uploaded images
            const storeUploads = imageData.filter(img => img.storeaddress === store.storeaddress);

            // Count the number of unique days with uploads ("completed")
            const completed = storeUploads.length;

            // Calculate the total number of days in the range
            const totalDaysInRange = calculateTotalDays(startDate, endDate);

            // "Not completed" is the difference between total days and completed days
            const notCompleted = totalDaysInRange - completed;

            return {
                storename: store.storename,
                completed: completed,
                not_completed: notCompleted
            };
        });
 console.log(result)
        // Send the response
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching DM stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching DM stats' });
    }
};

// Helper function to calculate total days in the range
function calculateTotalDays(startDate, endDate) {
    if (!startDate || !endDate) {
        return 1; // Default to 1 day if no range is provided
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    return diffDays;
}

export default getDmStats;