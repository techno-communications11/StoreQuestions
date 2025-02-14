// awsConfig.js
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

// Create an S3 client instance using credentials from environment variables
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,  // The AWS region for the S3 bucket
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key
  },
});

export default s3; // Export the S3 client instance
