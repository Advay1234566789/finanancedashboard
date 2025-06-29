// index.js
import 'dotenv/config';               // Loads variables from .env into process.env
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const MONGO_URI  = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT       = process.env.PORT || 5000;

// ————————————————————————————————————————————————————————————————————————————————
// 1. Mongoose User Schema & Model
// ————————————————————————————————————————————————————————————————————————————————
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String },
  password:  { type: String, required: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plaintext vs. hash
userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Ensure unique usernames only when provided
userSchema.index(
  { username: 1 },
  { unique: true, sparse: true }
);

const User = mongoose.model('User', userSchema);

// ————————————————————————————————————————————————————————————————————————————————
// 2. JWT Middleware
// ————————————————————————————————————————————————————————————————————————————————
function getSecret(req) {
  return req.app.get('jwt-secret');
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, getSecret(req));
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Token is not valid' });
    req.user = user;
    next();
  } catch (err) {
    const msg =
      err.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Token is not valid';
    res.status(401).json({ message: msg });
  }
};

// ————————————————————————————————————————————————————————————————————————————————
// 3. Connect to MongoDB & Drop Bad Index Once
// ————————————————————————————————————————————————————————————————————————————————
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    mongoose.connection.once('open', async () => {
      try {
        await mongoose.connection.db
          .collection('users')
          .dropIndex('username_1');
        console.log('✅ Dropped old username index');
      } catch (e) {
        console.log('ℹ️ Index drop skipped:', e.message);
      }
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ————————————————————————————————————————————————————————————————————————————————
// 4. App Configuration
// ————————————————————————————————————————————————————————————————————————————————
app.use(cors());
app.use(express.json());
app.set('jwt-secret', JWT_SECRET);

// ————————————————————————————————————————————————————————————————————————————————
// 5. Authentication Routes (in‑file, replacing authRoutes import)
// ————————————————————————————————————————————————————————————————————————————————

// @route   POST /api/auth/register
// @desc    Create a new user & return a JWT
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords must match' });
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ firstName, lastName, email, username, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email, firstName, lastName, username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return a JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, firstName: user.firstName, lastName: user.lastName, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ————————————————————————————————————————————————————————————————————————————————
// 6. Protected Test Route
// ————————————————————————————————————————————————————————————————————————————————
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'You made it!', user: req.user });
});

// ————————————————————————————————————————————————————————————————————————————————
// 7. Start Server
// ————————————————————————————————————————————————————————————————————————————————
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
