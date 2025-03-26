import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import db from '../dbConnection/db.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const imageUpload = async (req, res) => {
  try {
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Get storeaddress, ntid, and question from the request body
    const { storeaddress, ntid, question,browserTime } = req.body;
    console.log(req.body, "data");

    if (!storeaddress || !ntid || !question) {
      return res.status(400).json({ error: "storeaddress, NTID, and question are required" });
    }

    // Retrieve question_id from the database
    const getQuestionID = 'SELECT id FROM questions WHERE Question = ?';
    const [result] = await db.promise().query(getQuestionID, [question]);

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid question provided" });
    }

    const question_id = result[0].id;
    console.log(question_id);

    // Store URLs in an array
    let uploadedImages = [];

    // Process each uploaded file
    for (const file of req.files) {
      const fileContent = await fs.readFile(file.path);
      const fileKey = `profilePhotos/${file.filename}`;

      // Prepare the upload parameters for S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);

      // Upload the file to S3
      await s3.send(command);
      console.log(`File uploaded successfully to S3: ${file.filename}`);

      // Add image URL to the array
      uploadedImages.push(fileKey);

      try {
        // Delete the file from the local server after upload
        await fs.unlink(file.path);
        console.log(`File deleted from local: ${file.filename}`);
      } catch (err) {
        console.error(`Error deleting file: ${file.filename}`, err);
      }
    }

    // Convert image URLs to JSON format
    const imageUrlsJson = JSON.stringify(uploadedImages);

    // Insert all image URLs as an array in a single row
    const insertQuery = `
    INSERT INTO images (storeaddress, url, ntid, question_id, createdat) 
    VALUES (?, ?, ?, ?, ?)
`;

const [insertResult] = await db.promise().query(insertQuery, [storeaddress, imageUrlsJson, ntid, question_id,browserTime]);


    if (insertResult.affectedRows === 1) {
      return res.status(200).json({
        message: "Images uploaded and URLs stored successfully",
        urls: uploadedImages,
      });
    } else {
      return res.status(500).json({ error: "Failed to store images in the database" });
    }

  } catch (error) {
    console.error("Error uploading images:", error);
    return res.status(500).json({ error: "An error occurred while uploading the images" });
  }
};

export default imageUpload;
