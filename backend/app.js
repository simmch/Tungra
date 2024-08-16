import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

import loreRoutes from './routes/lore.js';
import aiSearchRoutes from './routes/aiSearch.js';
import userRoutes from './routes/user.js';  // Import the new user routes
import { auth } from './middleware/auth.js';  // Import the auth middleware

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Determine the correct build path
let buildPath;
if (process.env.NODE_ENV === 'production') {
  buildPath = path.join(__dirname, 'build');
} else {
  buildPath = path.join(__dirname, '..', 'backend', 'build');
}

console.log('Build path:', buildPath);

if (fs.existsSync(buildPath)) {
  console.log('Build directory exists');
  app.use(express.static(buildPath));
} else {
  console.error('Build directory does not exist');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Use routes
app.use('/api/users', userRoutes);  // New user routes (for login, etc.)
app.use('/api/lore', auth, loreRoutes);  // Protect lore routes
app.use('/api/ai-search', auth, aiSearchRoutes);  // Protect AI search routes

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Trying to serve:', indexPath);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));