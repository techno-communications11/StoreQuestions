import db from "../dbConnection/db.js";

const getDmStats = async (req, res) => {
    const { dmname, startDate, endDate } = req.query; //getting start and end date and dm name from client

    if (!dmname || typeof dmname !== "string") { //check it or verify
        return res.status(400).json({ success: false, message: "Invalid dmname provided" });
    }

    try {
        // Step 1: Get storename and storeemail from marketStructure
        const [marketData] = await db.promise().query(
            `SELECT storename, storeemail FROM marketStructure WHERE dmname = ?`,
            [dmname]
        );

        if (!marketData?.length) {
            return res.json({ success: true, data: [] });
        }

        // Step 2: Get user IDs from users table using storeemails
        const storeEmails = marketData.map(store => store.storeemail);
        const [usersData] = await db.promise().query(
            `SELECT id, email FROM users WHERE email IN (?)`,
            [storeEmails]
        );

        // Step 3: Get image data using user IDs
        const userIds = usersData.map(user => user.id);
        let imageQuery = `SELECT userId, url, createdAt FROM images WHERE userId IN (?)`;
        const queryParams = [userIds];

        // Date filtering
        if (startDate && endDate) {
            imageQuery += ` AND DATE(createdAt) BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        } else {
            const today = new Date().toISOString().split('T')[0];
            imageQuery += ` AND DATE(createdAt) = ?`;
            queryParams.push(today);
        }

        const [imageData] = await db.promise().query(imageQuery, queryParams);

        // Step 4: Prepare final result
        const result = marketData.map((store) => {
            // Find the user associated with the store's email
            const user = usersData.find(u => u.email === store.storeemail);

            // If no user is found, mark as "Not Completed" and createdAt as null
            if (!user) {
                return {
                    storename: store.storename,
                    completed: "Not Completed",
                    createdAt: null
                };
            }

            // Find the image data for the current user
            const image = imageData.find(img => img.userId === user.id);

            // If no image is found, mark as "Not Completed" and createdAt as null
            if (!image) {
                return {
                    storename: store.storename,
                    completed: "Not Completed",
                    createdAt: null
                };
            }

            // If image exists, mark as "Completed" and include createdAt
            return {
                storename: store.storename,
                completed: "Completed",
                createdAt: image.createdAt
            };
        });

        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching DM stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching DM stats' });
    }
};

export default getDmStats;