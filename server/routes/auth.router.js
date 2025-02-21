import express from 'express';
import login from '../components/login.js';  // Correct relative path with .js extension
import register from '../components/register.js';  // Add .js extension
import resetpassword from '../components/resetpassword.js';  // Add .js extension if needed
import authenticateToken from '../components/authMiddleware.js';
import  handleMarketStructureFileUpload from '../components/marketStructure.js';
import  handleCrediantalsFileUpload  from '../components/crediantals.js';
import stores from '../components/stores.js';
import questions from '../components/questions.js';
import {upload} from '../multer/multer.js'
 
import validatentid from '../components/validatentid.js'
import  imageUpload  from "../components/imageUpload.js";
 import getMarketWiseStats from '../components/getMarketWiseStats.js';
 import getstorewiseuploadcount from '../components/getstorewiseuploadcount.js';
 import getImagesDataByStoreName from '../components/getImagesDataByStorename.js';
 import getmarkets from '../components/getMarkets.js';
 import getDmStats from '../components/getDmStats.js';
 import imageverify from '../components/imageverify.js'
 import uploadeddata from '../components/uploadeddata.js';
 import createquestion from  '../components/createquestion.js'
 import getQuestion from '../components/getQuestion.js';
 import deletequestion from '../components/deletequestion.js'
 import getntid from '../components/getntid.js'

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/stores', stores);
router.get('/getntid', getntid);
router.get('/getdmstats', getDmStats);
router.get('/getmarkets', getmarkets);
router.get('/getmarketwise', getMarketWiseStats);
router.post('/uploadeddata', uploadeddata);
router.post('/addQuestion', createquestion);
router.post('/deleteQuestion/:id', deletequestion);
router.get('/getquestion', getQuestion);
router.post('/getimagesdata', getImagesDataByStoreName);
router.post('/imageverify', imageverify);
router.get('/getstorewiseuploadcount', getstorewiseuploadcount);
router.get('/questions', questions);
router.put('/update-password',authenticateToken, resetpassword);
 router.post('/validatentid',validatentid)
 router.post('/crediantalsFile', upload.single('file'), handleCrediantalsFileUpload);
 router.post('/marketstructureFile', upload.single('file'), (req, res, next) => {
  console.log('Uploaded file:', req.file); // Log file details
  next();
}, handleMarketStructureFileUpload);
router.post("/uploadimage", upload.array('files', 5), imageUpload);

export default router;
