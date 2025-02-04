import express from 'express';
import login from '../components/login.js';  // Correct relative path with .js extension
import register from '../components/register.js';  // Add .js extension
import resetpassword from '../components/resetpassword.js';  // Add .js extension if needed
import authenticateToken from '../components/authMiddleware.js';
import MarketStructure from '../components/marketStructure.js';
import stores from '../components/stores.js';
import questions from '../components/questions.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/stores', stores);
router.get('/questions', questions);
router.put('/update-password',authenticateToken, resetpassword);
router.put('/marketstructure',authenticateToken, MarketStructure)

export default router;
