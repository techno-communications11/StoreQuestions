import db from '../dbConnection/db.js';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const s3 = new AWS.S3();

const uploadeddata = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body);

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    // Fetch images and their associated questions
    const query = `
      SELECT images.*, questions.question 
      FROM images 
      LEFT JOIN questions ON images.question_id = questions.id 
      WHERE images.userid = ?
    `;
    const values = [id];

    const [results] = await db.promise().query(query, values);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "No data found for this ID" });
    }

    // Generate signed URLs for images stored in S3
    const imagesWithSignedUrls = await Promise.all(
      results.map(async (image) => {
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.url,
          Expires: 3600,
        };

        const signedUrl = await s3.getSignedUrlPromise('getObject', params);

        return {
          ...image,
          signedUrl,
        };
      })
    );

    return res.status(200).json({ success: true, data: imagesWithSignedUrls });
  } catch (err) {
    console.error("Error fetching data:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default uploadeddata;