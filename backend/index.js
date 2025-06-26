import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import booksRoute from './routes/booksRoute.js';
import authRoutes from './routes/authRoutes.js';
import profileBooksRoute from './routes/profileBooksRoute.js';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Check if required environment variables are set
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set in .env file');
  process.exit(1);
}

if (!process.env.PORT) {
  console.error('Error: PORT is not set in .env file');
  process.exit(1);
}

const app = express();

// Environment variables
const PORT = process.env.PORT;
const mongoDBURL = process.env.MONGODB_URI;

// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS POLICY
// Option 1: Allow All Origins with Default of cors(*)
app.use(cors());
// Option 2: Allow Custom Origins
// app.use(
//   cors({

// MongoDB connection
mongoose.connect(mongoDBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Bookstore API Running' });
});

// Routes
app.use('/books', booksRoute);
app.use('/auth', authRoutes);
app.use('/profilebooks', profileBooksRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
