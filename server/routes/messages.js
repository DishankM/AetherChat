import express from 'express';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'username avatar')
      .lean();

    // Reverse to get chronological order
    const reversedMessages = messages.reverse();

    // Get total count for pagination
    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: reversedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const message = await Message.findOne({
      _id: messageId,
      sender: decoded.userId
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.deleteOne();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
