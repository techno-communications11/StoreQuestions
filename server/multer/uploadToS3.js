import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './awsConfig.js'; // Correct import for AWS SDK

const uploadFileToS3 = async (file) => {
  try {
    // Ensure file is the correct type and path is resolved
    if (!file || !file.filename) {
      throw new Error('Invalid file uploaded.');
    }

    const filePath = path.resolve('uploads', file.filename); // Access the correct file property
    console.log('File path:', filePath); // Check file path

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath);
    const s3Key = `profilePhotos/${file.filename}`; // Store with the correct filename

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: file.mimetype, 
    };

    const command = new PutObjectCommand(params);
    const uploadResult = await s3.send(command);
    
    console.log('S3 Upload Result:', uploadResult);
    return s3Key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

export default uploadFileToS3;
