import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { query } = req.query;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    );

    if (!query || !query.trim()) {
      return res.json({ users: [] });
    }

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({
      _id: { $ne: decoded.userId },
      $or: [
        { username: { $regex: safeQuery, $options: 'i' } },
        { email: { $regex: safeQuery, $options: 'i' } }
      ]
    })
      .select('_id username email')
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
