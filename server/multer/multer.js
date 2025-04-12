// multerConfig.js
import multer from 'multer';
import fs from 'fs';


// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Configure different storage strategies
const memoryStorage = multer.memoryStorage(); // For image uploads (buffers)
const diskStorage = multer.diskStorage({      // For CSV file uploads (disk)
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Custom file filter
const fileFilter = (req, file, cb) => {
  // Allow images and CSV files
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and CSV files are allowed!'), false);
  }
};

// Create different upload middleware instances
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

const uploadFile = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for CSV files
  }
});

export { uploadImage, uploadFile };