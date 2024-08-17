import express from 'express';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
      console.log('Login attempt for username:', req.body.username);
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      console.log('User found:', user.username);
      console.log('Stored password hash:', user.password);
      console.log('Provided password:', req.body.password);
      
      const isMatch = await user.comparePassword(req.body.password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.json({ user: { username: user.username, role: user.role }, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message });
    }
  });

// Get all users (admin only)
router.get('/', auth, authorize(['ADMIN']), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user (admin only)
router.post('/', auth, authorize(['ADMIN']), async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a user (admin only)
router.put('/:id', auth, authorize(['ADMIN']), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username) user.username = username;
    if (password) user.password = password;
    if (role) user.role = role;
    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user (admin only)
router.delete('/:id', auth, authorize(['ADMIN']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;