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
    const { storename, startDate, endDate } = req.body;

    if (!storename || typeof storename !== "string") {
        return res.status(400).json({ success: false, message: "Invalid storename provided" });
    }

    try {
        let query = `
            SELECT 
                i.*, 
                m.storename, 
                q.Question,
                q.type,
                q.checklistType,
                DATE(i.createdat) as image_date
            FROM images i
            INNER JOIN marketstructure m 
                ON i.storeaddress = m.storeaddress
            INNER JOIN questions q 
                ON i.question_id = q.id
            WHERE m.storename = ?
        `;

        const queryParams = [storename];

        if (startDate && endDate) {
            query += ` AND DATE(i.createdat) BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        } else {
            const today = new Date().toISOString().split('T')[0];
            query += ` AND DATE(i.createdat) = ?`;
            queryParams.push(today);
        }

        // Order by date and question for proper grouping
        query += ` ORDER BY image_date DESC, q.id, i.createdat DESC`;

        const [rows] = await db.promise().query(query, queryParams);

        if (!rows || rows.length === 0) {
            return res.json({ success: true, message: "No images found for this store", data: [] });
        }

        // Object to group by question and date
        const groupedData = {};

        // Process all rows and group by question and date
        await Promise.all(rows.map(async (imageRecord) => {
            // Handle both string and JSON array cases for URL
            let imageUrls = [];
            
            if (typeof imageRecord.url === 'string') {
                try {
                    const parsed = JSON.parse(imageRecord.url);
                    imageUrls = Array.isArray(parsed) ? parsed : [imageRecord.url];
                } catch (error) {
                    imageUrls = [imageRecord.url];
                }
            } else if (Array.isArray(imageRecord.url)) {
                imageUrls = imageRecord.url;
            }

            // Generate signed URLs for each image URL
            const signedUrls = await Promise.all(imageUrls.map(async (imageUrl) => {
                try {
                    if (!imageUrl || typeof imageUrl !== 'string') return null;
                    
                    const getObjectParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: imageUrl,
                    };

                    const command = new GetObjectCommand(getObjectParams);
                    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                } catch (error) {
                    console.error(`Error generating signed URL for: ${imageUrl}`, error);
                    return null;
                }
            }));

            const validSignedUrls = signedUrls.filter(url => url !== null);

            if (validSignedUrls.length > 0) {
                const date = imageRecord.createdat;
                const questionKey = `${date}_${imageRecord.question_id}`;
                
                if (!groupedData[questionKey]) {
                    // Create new group for this question on this date
                    groupedData[questionKey] = {
                        storeaddress: imageRecord.storeaddress,
                        storename: imageRecord.storename,
                        Question: imageRecord.Question,
                        type: imageRecord.type,
                        question_id: imageRecord.question_id,
                        createdat: date, // Using just the date part
                        checklistType: imageRecord.checklistType,
                        signedUrls: [], // Will contain all image URLs for this question
                        image_verified: imageRecord.image_verified,
                        verified_by: imageRecord.verified_by,
                        // Keep the first ntid we encounter
                        ntid: imageRecord.ntid
                    };
                }

                // Add all valid signed URLs to this question's group
                groupedData[questionKey].signedUrls.push(...validSignedUrls);
            }
        }));

        // Convert grouped object to array (maintaining the same format as before)
        const result = Object.values(groupedData);
         console.log('Grouped images data:', result);

        res.json({ 
            success: true, 
            data: result,
            message: `Found ${result.length} questions with images`
        });
    } catch (err) {
        console.error('Error fetching images data:', err);
        res.status(500).json({ success: false, message: 'Error fetching images data' });
    }
};

export default getImagesDataByStoreName;
