import multer from 'multer'; // imports multer which is used for handling file uploads in node js
import fs from 'fs'; // fs is the file syatem whisch is used to check uploads file exist or not its mainly used  when working with files

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync('uploads')) { // if the uploads folder  not exitsts returns  false else true
  fs.mkdirSync('uploads'); // this will create the uploads folder
}

// Configure multer for file uploads
const storage = multer.diskStorage({ //configures Multer to store files on the server’s disk
  destination: (req, file, cb) => { //cb callback function
    cb(null, 'uploads/'); //tells multer to store files in uploads
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  },
});

const upload = multer({ storage }); //This initializes Multer with the disk storage configuration (storage)
//upload is now a middleware that you can use in your routes

export { upload }; // ✅ Correct ES Module export
