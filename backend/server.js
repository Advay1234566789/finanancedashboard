// index.js
import 'dotenv/config';               // Loads variables from .env into process.env
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';

const app = express();

// Pull from env (set these in Render or in a local .env file)
const MONGO_URI  = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT       = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    
    // Fix for the duplicate username index error
    // This will run once after connection is established
    mongoose.connection.once('open', async () => {
      try {
        // Try to drop the problematic username index
        await mongoose.connection.db.collection('users').dropIndex('username_1');
        console.log('✅ Dropped username index successfully');
      } catch (error) {
        // Index might not exist or already dropped - that's okay
        console.log('ℹ️ Username index cleanup:', error.message);
      }
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('JWT Secret configured:', JWT_SECRET ? 'Yes' : 'No');
});
