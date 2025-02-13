import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './dbConnection/db.js'
import approuter from './routes/auth.router.js'

const app = express();
dotenv.config();

app.use(express.json());
const allowOrigin = {
  origin: 'http://192.168.29.137:3000',
  methods: 'PUT, GET, POST' 
};

app.use(cors(allowOrigin));

app.use('/auth', approuter);


app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});
