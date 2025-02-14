// uploadToS3.js
import fs from 'fs';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3'; // Import the PutObjectCommand
import s3 from './awsConfig.js'; // Import the configured S3 client

const uploadFileToS3 = async (file) => {
  try {
    // Ensure file is valid
    if (!file || !file.filename) {
      throw new Error('Invalid file uploaded.');
    }

    const filePath = path.resolve('uploads', file.filename); // Construct the file path
    console.log('File path:', filePath); // Log file path for debugging

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the file content into a buffer
    const fileContent = fs.readFileSync(filePath);

    // Define the S3 key (location in the bucket)
    const s3Key = `profilePhotos/${file.filename}`; 

    // Set up the parameters for the S3 upload
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // The S3 bucket name from environment variables
      Key: s3Key, // The key (file name) in S3
      Body: fileContent, // The file content (read from the file)
      ContentType: file.mimetype, // The MIME type of the file
    };

    // Create a new PutObjectCommand with the parameters
    const command = new PutObjectCommand(params);

    // Execute the command to upload the file to S3
    const uploadResult = await s3.send(command);
    
    console.log('S3 Upload Result:', uploadResult); // Log the result
    return s3Key; // Return the S3 key of the uploaded file
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error; // Throw error if upload fails
  }
};

export default uploadFileToS3;
