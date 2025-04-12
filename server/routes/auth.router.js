import express from 'express';
import login from '../components/Auth/login.js';  // Correct relative path with .js extension
import register from '../components/Auth/register.js';  // Add .js extension
import resetpassword from '../components/Auth/resetpassword.js';  // Add .js extension if needed

import  handleMarketStructureFileUpload from '../components/SheetUploads/marketStructure.js';
import  handleCrediantalsFileUpload  from '../components/SheetUploads/crediantals.js';
import stores from '../components/Data/stores.js';
import questions from '../components/Questions/questions.js';

import {uploadImage} from '../multer/multer.js'
import {uploadFile} from '../multer/multer.js'
 
import validatentid from '../components/Data/validatentid.js'
import  imageUpload  from "../components/Images/imageUpload.js";
 import getMarketWiseStats from '../components/Stats/getMarketWiseStats.js';
 import getstorewiseuploadcount from '../components/Stats/getstorewiseuploadcount.js';
 import getImagesDataByStoreName from '../components/Images/getImagesDataByStorename.js';
 import getmarkets from '../components/Data/getMarkets.js';
 import getDmStats from '../components/Stats/getDmStats.js';
 import imageverify from '../components/Images/imageverify.js'
 import uploadeddata from '../components/SheetUploads/uploadeddata.js';
 import createquestion from  '../components/Questions/createquestion.js'
 import getQuestion from '../components/Questions/getQuestion.js';
 import deletequestion from '../components/Questions/deletequestion.js'
 import getntid from '../components/Data/getntid.js'
 import authenticateToken from '../Middleware/authMiddleware.js';
 import getUser from '../components/Auth/Getuser.js';

const router = express.Router();

router.post('/login', login);
router.get('/user/me', authenticateToken, getUser);
router.post('/register', authenticateToken, register);



router.get('/getdmstats',authenticateToken, getDmStats);
router.get('/getmarkets', authenticateToken,getmarkets);
router.get('/getmarketwise', authenticateToken, getMarketWiseStats);
router.post('/uploadeddata',  authenticateToken, uploadeddata);
router.post('/addQuestion',authenticateToken, createquestion);
router.post('/toggleQuestionStatus/:id', authenticateToken, deletequestion);
router.get('/getquestion', authenticateToken, getQuestion);
router.post('/getimagesdata', authenticateToken,getImagesDataByStoreName);
router.post('/imageverify',authenticateToken, imageverify);
router.get('/getstorewiseuploadcount',authenticateToken, getstorewiseuploadcount);

router.put('/update-password',authenticateToken, resetpassword);
 
 router.post('/crediantalsFile', uploadFile.single('file'), handleCrediantalsFileUpload);
 router.post('/marketstructureFile', uploadFile.single('file'), handleMarketStructureFileUpload);


//logout

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});


//no need authentication only for image upload and need ntid verification
router.post("/uploadbulkimages", uploadImage.array('files', 100), imageUpload);
router.post('/validatentid',validatentid)
router.get('/questions',questions);
router.get('/stores', stores);
router.get('/getntid', getntid);
export default router;
