import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { getInfo, personRouter } from './controllers/persons.controller.js';
import { errorHandler } from './helpers/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const MONGO_URI = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

app.get('/info', getInfo);

app.use('/api/persons', personRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
