// import 'dotenv/config';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const app = express();
// const PORT      = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET= process.env.JWT_SECRET;

// // ————————————————————————————————————————————————————————————————————————————————
// // CORS: allow your frontend on render.com
// const corsOptions = {
//   origin: 'https://finanancedashboard-1.onrender.com',
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization'],
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// // JSON body parser
// app.use(express.json());

// // ————————————————————————————————————————————————————————————————————————————————
// // MongoDB connection
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser:    true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // ————————————————————————————————————————————————————————————————————————————————
// // User schema + model
// const userSchema = new mongoose.Schema({
//   username:  { type: String },
//   firstName: { type: String },
//   lastName:  { type: String },
//   email:     { type: String, required: true, unique: true },
//   password:  { type: String, required: true },
// }, { timestamps: true });

// // only enforce uniqueness on username when provided
// userSchema.index({ username: 1 }, { unique: true, sparse: true });

// const User = mongoose.model('User', userSchema);

// // ————————————————————————————————————————————————————————————————————————————————
// // JWT helper
// function generateToken(user) {
//   return jwt.sign(
//     { id: user._id, email: user.email },
//     JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// }

// // ————————————————————————————————————————————————————————————————————————————————
// // AUTH ROUTES

// // Register new user
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { username, firstName, lastName, email: rawEmail, password, confirmPassword } = req.body;
//     const email = rawEmail?.trim().toLowerCase();

//     if (!email || !password || !confirmPassword) {
//       return res.status(400).json({ message: 'Email and passwords are required' });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords don't match" });
//     }

//     if (username) {
//       if (await User.findOne({ username })) {
//         return res.status(400).json({ message: 'Username already taken' });
//       }
//     }

//     if (await User.findOne({ email })) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
//     const newUser = new User({ username: username||undefined, firstName, lastName, email, password: hash });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered. Please check your email.' });
//   } catch (err) {
//     console.error('Register error:', err);
//     if (err.code === 11000) {
//       if (err.keyPattern?.username) return res.status(400).json({ message: 'Username already taken' });
//       if (err.keyPattern?.email)    return res.status(400).json({ message: 'Email already in use' });
//     }
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login existing user
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email: rawEmail, password } = req.body;
//     const email = rawEmail?.trim().toLowerCase();

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password required' });
//     }

//     const user = await User.findOne({ email });
//     if (!user || !bcrypt.compareSync(password, user.password)) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = generateToken(user);
//     res.json({ token });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Example protected route
// app.get('/api/auth/protected', (req, res) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ message: `Welcome ${decoded.email}` });
//   } catch {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// });

// // ————————————————————————————————————————————————————————————————————————————————
// // Catch‑all 404 (Express 5 wildcard must be named)
// app.all('/*path', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // ————————————————————————————————————————————————————————————————————————————————


import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { MONGO_URI, JWT_SECRET, PORT } = process.env;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// User schema
type UserDoc = { email: string; password: string };
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });
    res.status(201).json({ message: 'User created' });
  } catch (e) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Protected example
def function authMiddleware(req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json({ error: 'No token' });
  const token = bearer.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ data: 'This is protected data.' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// // Launch server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
