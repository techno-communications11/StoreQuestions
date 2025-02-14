import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // Import S3Client and PutObjectCommand
import db from '../dbConnection/db.js';
import fs from 'fs/promises'; // Using promise-based fs
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

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
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Get storeaddress, ntid, and question from the request body
    const { storeaddress, ntid, question } = req.body;
    console.log(req.body, "data");

    if (!storeaddress || !ntid || !question) {
      return res.status(400).json({ error: "storeaddress, NTID, and question are required" });
    }

    // Upload the image file to S3
    const fileContent = await fs.readFile(req.file.path); // Read the file content using fs
    const fileKey = `profilePhotos/${req.file.filename}`; // Define the S3 key (file name in S3)
    
    // Prepare the upload parameters for S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: req.file.mimetype, // Use the mime type of the file
    };

    const command = new PutObjectCommand(params);

    // Upload the file to S3
    await s3.send(command);
    console.log('File uploaded successfully to S3');

    // Generate the URL for the uploaded image
    const imageUrl = `${fileKey}`;

    // Retrieve question_id from the database
    const getQuestionID = 'SELECT id FROM questions WHERE Question = ?';
    const [result] = await db.promise().query(getQuestionID, [question]);

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid question provided" });
    }

    const question_id = result[0].id;
    console.log(question_id);

    // Insert the URL and other details into the database
    const insertQuery = 'INSERT INTO images(storeaddress, url, ntid, question_id) VALUES (?, ?, ?, ?)';
    const [insertResult] = await db.promise().query(insertQuery, [storeaddress, imageUrl, ntid, question_id]);

    if (insertResult.affectedRows === 1) {
      // File successfully uploaded and URL stored in the database
      try {
        // Delete the file from the local server after upload
        await fs.unlink(req.file.path);
        console.log('File successfully deleted from uploads folder');
      } catch (err) {
        console.error('Error deleting file from uploads folder:', err);
      }

      return res.status(200).json({
        message: "Image uploaded and URL stored successfully",
        url: imageUrl,
      });
    } else {
      return res.status(500).json({ error: "Failed to insert data into the images table" });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ error: "An error occurred while uploading the image" });
  }
};

export default imageUpload;
