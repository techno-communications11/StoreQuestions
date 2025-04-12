import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import db from '../../dbConnection/db.js'; 
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadBulkImages = async (req, res) => {
  try {
    // Validate request contains files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No files uploaded" 
      });
    }

    // Parse questions from body
    let questions = [];
    try {
      questions = req.body.questions 
        ? req.body.questions.split(',').map(q => q.trim())
        : [];
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid questions format"
      });
    }

    // Validate required fields
    const { ntid, storeaddress, browserTime } = req.body;
    if (!ntid || !storeaddress || !browserTime) {
      return res.status(400).json({ 
        success: false,
        error: "NTID, storeaddress, and browserTime are required" 
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one question must be provided"
      });
    }

    // Verify all questions exist
    const [questionResults] = await db.promise().query(
      `SELECT id, Question FROM questions 
       WHERE Question IN (?) AND isEnabled = 1`,
      [questions]
    );

    if (questionResults.length !== questions.length) {
      const invalidQuestions = questions.filter(q => 
        !questionResults.some(r => r.Question === q)
      );
      return res.status(400).json({
        success: false,
        error: "Some questions are invalid or disabled",
        invalidQuestions
      });
    }

    const questionMap = questionResults.reduce((acc, curr) => {
      acc[curr.Question] = curr.id;
      return acc;
    }, {});

    const uploadResults = [];
    const filesByQuestion = {};

    // Process each file using parallel uploads
    const uploadPromises = req.files.map(async (file, index) => {
      const question = questions[index % questions.length];
      const questionId = questionMap[question];
      const fileExtension = file.originalname.split('.').pop();
      const s3Key = `uploads/${questionId}/${uuidv4()}.${fileExtension}`;

      try {
        // Use Upload for better handling of large files
        const parallelUpload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype
          },
          queueSize: 4, // Optional concurrency configuration
          partSize: 5 * 1024 * 1024, // 5MB chunks
          leavePartsOnError: false
        });

        await parallelUpload.done();

        // Track successful uploads
        if (!filesByQuestion[questionId]) {
          filesByQuestion[questionId] = [];
        }
        filesByQuestion[questionId].push(s3Key);

        uploadResults.push({
          question,
          originalName: file.originalname,
          s3Key,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
        uploadResults.push({
          question,
          originalName: file.originalname,
          status: 'failed',
          error: error.message
        });
      }
    });

    await Promise.all(uploadPromises);

    // Store in database
    const dbInserts = Object.entries(filesByQuestion).map(([questionId, urls]) => 
      db.promise().query(
        `INSERT INTO images 
         (storeaddress, url, ntid, question_id, createdat) 
         VALUES (?, ?, ?, ?, ?)`,
        [storeaddress, JSON.stringify(urls), ntid, questionId, browserTime]
      )
    );

    await Promise.all(dbInserts);

    return res.status(200).json({
      success: true,
      totalFiles: req.files.length,
      successfulUploads: uploadResults.filter(u => u.status === 'success').length,
      failedUploads: uploadResults.filter(u => u.status === 'failed').length,
      uploads: uploadResults.map(upload => ({
        ...upload,
        url: upload.s3Key 
          ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${upload.s3Key}`
          : null
      }))
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export default uploadBulkImages;