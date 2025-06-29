import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';

const app = express();

// Inline your Mongo URI and JWT secret here
const MONGO_URI = 'mongodb+srv://advay:advay@cluster0.gsco8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'abc123';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

// Store secret on app instance for routes & middleware
app.set('jwt-secret', JWT_SECRET);

// Mount auth routes
app.use('/api/auth', authRoutes);

// Protected test route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('JWT Secret configured:', JWT_SECRET ? 'Yes' : 'No');
});
