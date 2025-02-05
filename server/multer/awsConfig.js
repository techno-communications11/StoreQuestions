import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION, // Use the correct region variable
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use the correct AWS access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use the correct AWS secret key
  },
});

export default s3; // Ensure proper export