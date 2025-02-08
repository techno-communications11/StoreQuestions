import uploadFileToS3 from '../multer/uploadToS3.js';
import db from '../dbConnection/db.js';
import fs from 'fs/promises'; // Using promise-based fs

const imageUpload = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Get id, ntid, and question from the request body
    const { id, ntid, question } = req.body;
    console.log(req.body, "data");

    if (!id || !ntid || !question) {
      return res.status(400).json({ error: "id, NTID, and question are required" });
    }

    // Upload the image file to S3
    const s3FileKey = await uploadFileToS3(req.file);

    // Generate the image URL based on the S3 file key
    const imageUrl = `${s3FileKey}`;

    // Retrieve question_id from the database
    const getQuestionID = 'SELECT id FROM questions WHERE Question = ?';
    const [result] = await db.promise().query(getQuestionID, [question]);

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid question provided" });
    }

    const question_id = result[0].id;

    // Insert the URL into the database
    const insertQuery = 'INSERT INTO images (userid, url, ntid, question_id) VALUES (?, ?, ?, ?)';
    const [insertResult] = await db.promise().query(insertQuery, [id, imageUrl, ntid, question_id]);

    if (insertResult.affectedRows === 1) {
      // File successfully uploaded and URL stored in the database
      try {
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
