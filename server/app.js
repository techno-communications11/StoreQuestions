import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './dbConnection/db.js'
import approuter from './routes/auth.router.js'

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors({
  origin: `${process.env.CLIENT_URL}`,  // Adjust according to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// app.use(cors(allowOrigin));

app.use('/auth', approuter);


app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});
