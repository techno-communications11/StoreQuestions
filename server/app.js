import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import approuter from './routes/auth.router.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();
app.use(cookieParser());

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., http://localhost:3302
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Add this if using cookies; omit if token-only
}));

app.use('/auth', approuter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});