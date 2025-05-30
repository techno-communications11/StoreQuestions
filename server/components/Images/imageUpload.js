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

// Improved normalization function
const normalizeQuestion = (text) => {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .toLowerCase();
};

const uploadBulkImages = async (req, res) => {
  try {
    // Validate request contains files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No files uploaded" 
      });
    }

    // Parse and normalize questions
    let questions = [];
    try {
      questions = req.body.questions 
        ? req.body.questions.split(',').map(q => normalizeQuestion(q))
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

    // Get all active questions from DB for comparison
    const [allQuestions] = await db.promise().query(
      `SELECT id, Question FROM questions WHERE isEnabled = 1`
    );

    // Create a normalized map of all questions
    const questionMap = {};
    allQuestions.forEach(q => {
      const normalized = normalizeQuestion(q.Question);
      questionMap[normalized] = q.id;
    });

    // Validate each provided question exists
    const invalidQuestions = questions.filter(q => !questionMap[q]);
    if (invalidQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Some questions are invalid or disabled",
        invalidQuestions,
        validQuestions: allQuestions.map(q => q.Question)
      });
    }

    const uploadResults = [];
    const filesByQuestion = {};

    // Process each file
    const uploadPromises = req.files.map(async (file, index) => {
      const question = questions[index % questions.length];
      const questionId = questionMap[question];
      
      // Generate consistent S3 key
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      const s3Key = `uploads/${questionId}/${uuidv4()}.${fileExtension}`;

      try {
        const parallelUpload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype
          },
          queueSize: 4,
          partSize: 5 * 1024 * 1024,
          leavePartsOnError: false
        });

        await parallelUpload.done();

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

    // Prepare database inserts
    const insertValues = [];
    for (const [questionId, urls] of Object.entries(filesByQuestion)) {
      for (const url of urls) {
        insertValues.push([storeaddress, url, ntid, questionId, browserTime]);
      }
    }

    // Batch insert with error handling
    if (insertValues.length > 0) {
      try {
        const batchSize = 50; // Smaller batches for better error handling
        for (let i = 0; i < insertValues.length; i += batchSize) {
          const batch = insertValues.slice(i, i + batchSize);
          await db.promise().query(
            `INSERT INTO images 
             (storeaddress, url, ntid, question_id, createdat) 
             VALUES ?`,
            [batch]
          );
        }
      } catch (dbError) {
        console.error('Database insert error:', dbError);
        // Try inserting records one by one to identify the bad one
        for (const record of insertValues) {
          try {
            await db.promise().query(
              `INSERT INTO images 
               (storeaddress, url, ntid, question_id, createdat) 
               VALUES (?, ?, ?, ?, ?)`,
              record
            );
          } catch (singleError) {
            console.error('Failed to insert record:', record, singleError);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      totalFiles: req.files.length,
      successfulUploads: uploadResults.filter(u => u.status === 'success').length,
      failedUploads: uploadResults.filter(u => u.status === 'failed').length,
      uploads: uploadResults
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