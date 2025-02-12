import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db from "../dbConnection/db.js";

// Initialize S3 instance
const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const getImagesDataByStoreName = async (req, res) => {
    const { storename } = req.body; // Extract storename from the request body
 console.log(storename,"store")
    // Validate input
    if (!storename || typeof storename !== "string") {
        return res.status(400).json({ success: false, message: "Invalid storename provided" });
    }

    try {
        // Query to get all images data for a store and join with the questions table based on question_id
        const [rows] = await db.promise().query(
            `SELECT 
                i.*, 
                m.storename, 
                q.Question,
                q.type,
                q.checklistType
             FROM images i
             INNER JOIN marketStructure m 
                ON i.storeaddress = m.storeaddress
             INNER JOIN questions q 
                ON i.question_id = q.id
             WHERE m.storename = ?`,
            [storename]
        );
 console.log(rows)
        // If no rows are found, return an empty array
        if (!rows || rows.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Generate presigned URLs for each image
        const imagesWithUrls = await Promise.all(
            rows.map(async (image) => {
                try {
                    const imageUrl = image.url; // Assuming the S3 object key is stored in the 'url' field

                    // Validate the image URL
                    if (!imageUrl || typeof imageUrl !== "string") {
                        console.warn(`Invalid image URL for image ID: ${image.id}`);
                        return { ...image, signedUrl: null }; // Skip this image
                    }

                    // Generate a presigned URL for the image
                    const getObjectParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: imageUrl,
                    };
                    const command = new GetObjectCommand(getObjectParams);

                    // Use the presigned URL generator to create a temporary URL
                    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
                    console.log(signedUrl)

                    return { ...image, signedUrl }; // Add signed URL to image data
                } catch (error) {
                    console.error(`Error generating signed URL for image ID: ${image.id}`, error);
                    return { ...image, signedUrl: null }; // Skip this image if an error occurs
                }
            })
        );
 console.log(imagesWithUrls,"uelslsk")
        // Send the result back with pre-signed URLs
        res.json({ success: true, data: imagesWithUrls });
    } catch (err) {
        console.error('Error fetching images data:', err);
        res.status(500).json({ success: false, message: 'Error fetching images data' });
    }
};

export default getImagesDataByStoreName;
