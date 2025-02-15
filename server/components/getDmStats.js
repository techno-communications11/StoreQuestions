import db from "../dbConnection/db.js";

const getDmStats = async (req, res) => {
    const { dmname, startDate, endDate } = req.query;

    if (!dmname || typeof dmname !== "string") {
        return res.status(400).json({ success: false, message: "Invalid dmname provided" });
    }

    try {
        // Step 1: Get all stores for the given DM name
        const [marketData] = await db.promise().query(
            `SELECT storename, storeaddress FROM marketstructure WHERE dmname = ?`,
            [dmname]
        );

        if (!marketData?.length) {
            return res.json({ success: true, data: [] });
        }

        const storeAddresses = marketData.map(store => store.storeaddress);

        // Step 2: Calculate total days in the range
        const today = new Date().toISOString().split('T')[0];
        const start = startDate || today; // Default to January 1, 2025, if no startDate is provided
        const totalDaysInRange = calculateTotalDays(start, endDate || today);

        // Step 3: Fetch unique days with uploads
        let imageQuery = `
            SELECT storeaddress, DATE(createdAt) AS upload_date
            FROM images
            WHERE storeaddress IN (?) AND DATE(createdAt) BETWEEN ? AND ?
            GROUP BY storeaddress, DATE(createdAt)
            ORDER BY createdAt ASC
        `;

        const [imageData] = await db.promise().query(imageQuery, [storeAddresses, start, endDate || today]);

        // Step 4: Prepare store-wise results
        const result = marketData.map(store => {
            // Get the list of unique upload dates for this store
            const storeUploads = imageData
                .filter(img => img.storeaddress === store.storeaddress)
                .map(img => img.upload_date);

            // Count the number of unique completed days
            const completed = new Set(storeUploads).size;
            const notCompleted = totalDaysInRange - completed;

            return {
                storename: store.storename,
                completed: completed,
                not_completed: Math.max(notCompleted, 0) // Ensure no negative values
            };
        });

        console.log(result);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching DM stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching DM stats' });
    }
};

// Helper function to calculate total days in the range
function calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

export default getDmStats;
