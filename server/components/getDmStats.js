import db from "../dbConnection/db.js";

const getDmStats = async (req, res) => {
    const { dmname } = req.query; // Extract dmname from the request query

    // Validate input
    if (!dmname || typeof dmname !== "string") {
        return res.status(400).json({ success: false, message: "Invalid dmname provided" });
    }

    try {
        // Step 1: Get storename and doorcode from marketStructure based on dmname
        const [marketData] = await db.promise().query(
            `SELECT storename, doorcode FROM marketStructure WHERE dmname = ?`,
            [dmname]
        );

        // If no market data found for the given dmname, return an empty response
        if (!marketData || marketData.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Step 2: Get ntid for each doorcode from credentials table
        const doorcodesList = marketData.map(door => door.doorcode);
        const [credentialsData] = await db.promise().query(
            `SELECT ntid, doorcode FROM credentials WHERE doorcode IN (?)`,
            [doorcodesList]
        );

        // If no credentials data is found, return an empty response
        if (!credentialsData || credentialsData.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Step 3: Get image data for each ntid from images table
        const ntidsList = credentialsData.map(cred => cred.ntid);
        const [imageData] = await db.promise().query(
            `SELECT ntid, url, createdAt FROM images WHERE ntid IN (?)`,
            [ntidsList]
        );

        // Step 4: Prepare the result with storename, completed status, and createdAt
        const result = marketData.map((store) => {
            // Find the credentials matching this store's doorcode
            const credential = credentialsData.find((cred) => cred.doorcode === store.doorcode);

            // If no matching credential or no ntid, skip this store
            if (!credential) return null;

            // Find the image data for the current ntid
            const image = imageData.find((img) => img.ntid === credential.ntid);

            // If image exists and URL is present, set completed to "Completed"
            const completed = image && image.url ? "Completed" : "Not Completed";
            const createdAt = image ? image.createdAt : null; // Set createdAt if image exists, else null

            return {
                storename: store.storename,
                completed: completed,
                createdAt: createdAt
            };
        }).filter(store => store !== null); // Remove null values from the result
 console.log(result)
        // Send the response with storename, completed status, and createdAt
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching DM stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching DM stats' });
    }
};

export default getDmStats;
