import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db from '../../dbConnection/db.js'; 

// Initialize S3 instance
const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const getImagesDataByStoreName = async (req, res) => {
    const { storename, startDate, endDate } = req.body; // Extract storename and date filters from the request body
    console.log("Received storename:", storename);

    // Validate input
    if (!storename || typeof storename !== "string") {
        return res.status(400).json({ success: false, message: "Invalid storename provided" });
    }

    try {
        // Base query to get image data
        let query = `
            SELECT 
                i.*, 
                m.storename, 
                q.Question,
                q.type,
                q.checklistType
            FROM images i
            INNER JOIN marketstructure m 
                ON i.storeaddress = m.storeaddress
            INNER JOIN questions q 
                ON i.question_id = q.id
            WHERE m.storename = ?
        `;

        // Array to hold query parameters
        const queryParams = [storename];

        // Add date filtering logic
        if (startDate && endDate) {
            // If both startDate and endDate are provided, filter data between these dates
            query += ` AND DATE(i.createdat) BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        } else {
            // If no filters are provided, fetch only today's data
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            query += ` AND DATE(i.createdat) = ?`;
            queryParams.push(today);
        }

        console.log("Executing query:", query);
        console.log("Query parameters:", queryParams);

        // Execute the query
        const [rows] = await db.promise().query(query, queryParams);
        console.log("Database rows fetched:", rows);

        // If no rows are found, return an empty array
        if (!rows || rows.length === 0) {
            return res.json({ success: true, message: "No images found for this store", data: [] });
        }

        // Initialize an array to hold the results
        const imagesData = [];

        // Process each row and generate signed URLs for each image
        await Promise.all(rows.map(async (imageRecord) => {
            // Ensure the url field exists and is a valid stringified JSON array
            let imageUrls = [];

            try {
                imageUrls = JSON.parse(imageRecord.url); // Parse the stringified JSON array
                console.log("Parsed image URLs:", imageUrls);
            } catch (error) {
                console.warn(`Failed to parse url field for image ID: ${imageRecord.id}`);
                return;
            }

            // Generate signed URLs for each image URL in the 'url' field (which is an array of URLs)
            const signedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
                try {
                    console.log("Processing image URL:", imageUrl);

                    const getObjectParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: imageUrl, // Assuming the URL is the S3 key without full URL
                    };

                    const command = new GetObjectCommand(getObjectParams);
                    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                    console.log("Generated signed URL:", signedUrl);

                    return signedUrl;
                } catch (error) {
                    console.error(`Error generating signed URL for image URL: ${imageUrl}`, error);
                    return null; // Return null for errors, which can be handled later if needed
                }
            }));

            // Filter out any null values from the signedUrls array in case of errors
            const validSignedUrls = signedUrls.filter(url => url !== null);
            console.log("Valid signed URLs:", validSignedUrls);

            if (validSignedUrls.length > 0) {
                imagesData.push({
                    storeaddress: imageRecord.storeaddress,
                    storename: imageRecord.storename,
                    Question: imageRecord.Question,
                    type: imageRecord.type,
                    id: imageRecord.id,
                    ntid: imageRecord.ntid,
                    createdat: imageRecord.createdat,
                    checklistType: imageRecord.checklistType,
                    signedUrls: validSignedUrls,
                    image_verified: imageRecord.image_verified,
                    verified_by: imageRecord.verified_by,
                });
            }
        }));

        console.log("Generated Image Data:", imagesData);

        // Send back the images data with the signed URLs
        res.json({ success: true, data: imagesData });
    } catch (err) {
        console.error('Error fetching images data:', err);
        res.status(500).json({ success: false, message: 'Error fetching images data' });
    }
};

export default getImagesDataByStoreName;