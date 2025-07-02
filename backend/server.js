import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// User Schema & Model
const userSchema = new mongoose.Schema({
  // username is optional, but if provided it must be unique
  username:   { type: String },
  firstName:  { type: String },
  lastName:   { type: String },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
}, { timestamps: true });

// sparse unique index on username
userSchema.index({ username: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    // if username provided, check uniqueness manually to get nicer error
    if (username) {
      const existsUsername = await User.findOne({ username });
      if (existsUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username || undefined,  // omit field if blank
      firstName,
      lastName,
      email,
      password: hash
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered. Please check your email.' });

  } catch (err) {
    console.error(err);
    // catch duplicate‑key at Mongo level
    if (err.code === 11000) {
      if (err.keyPattern.username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      if (err.keyPattern.email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PROTECTED DASHBOARD
app.get('/api/dashboard', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: `Welcome ${decoded.email}` });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
