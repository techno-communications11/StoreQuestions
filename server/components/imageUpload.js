import uploadFileToS3 from '../multer/uploadToS3.js'; // Correct path with .js extension
import db from '../dbConnection/db.js'; // Ensure this path is correct
import fs from 'fs';

const imageUpload = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Get serial and ntid from the request body
    const { id, ntid } = req.body;
    console.log(req.body, "datat");

    if (!id || !ntid) {
      return res.status(400).json({ error: "id and NTID are required" });
    }

    // Upload the image file to S3
    const s3FileKey = await uploadFileToS3(req.file); // Assuming this function returns a promise

    // Generate the image URL based on the S3 file key
    const imageUrl = `${s3FileKey}`;

    // Insert the URL into the database
    const insertQuery = 'INSERT INTO images (userid, url, ntid) VALUES (?, ?, ?)';
    
    // Use promise-based query execution
    const [insertResult] = await db.promise().query(insertQuery, [id, imageUrl, ntid]);

    if (insertResult.affectedRows === 1) {
      // File successfully uploaded and URL stored in the database
      // Now unlink (delete) the file from the 'uploads' folder
      const uploadedFilePath = req.file.path;
      fs.unlink(uploadedFilePath, (err) => {
        if (err) {
          console.error('Error deleting file from uploads folder:', err);
        } else {
          console.log('File successfully deleted from uploads folder');
        }
      });

      return res.status(200).json({ message: "Image uploaded and URL stored successfully", url: imageUrl });
    } else {
      return res.status(500).json({ error: "Failed to insert data into image table" });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ error: "An error occurred while uploading the image" });
  }
};

export default imageUpload;
