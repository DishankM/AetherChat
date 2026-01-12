import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get all conversations for user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const conversations = await Conversation.find({
      participants: decoded.userId
    })
    .populate('participants', 'username avatar email isOnline')
    .populate('lastMessage.sender', 'username avatar')
    .sort({ updatedAt: -1 })
    .lean();

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipants = conv.participants.filter(
        p => p._id.toString() !== decoded.userId.toString()
      );

      // For AI contact, use a special format
      if (conv.isAIContact) {
        return {
          ...conv,
          displayName: 'AI Assistant',
          avatar: null,
          isAI: true,
          otherUser: {
            username: 'AI Assistant',
            _id: 'ai',
            isOnline: true
          }
        };
      }

      return {
        ...conv,
        displayName: conv.isGroup 
          ? conv.groupName 
          : (otherParticipants[0]?.username || 'Unknown'),
        avatar: conv.isGroup ? conv.groupAvatar : otherParticipants[0]?.avatar,
        otherUser: otherParticipants[0] || otherParticipants[1]
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create new conversation
router.post('/', async (req, res) => {
  try {
    const { participantId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [decoded.userId, participantId], $size: 2 },
      isGroup: false,
      isAIContact: false
    });

    if (conversation) {
      return res.json({ conversation, exists: true });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [decoded.userId, participantId],
      isGroup: false
    });

    await conversation.save();
    await conversation.populate('participants', 'username avatar email isOnline');

    res.status(201).json({ conversation, exists: false });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get single conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: decoded.userId
    })
    .populate('participants', 'username avatar email isOnline')
    .populate('lastMessage.sender', 'username avatar');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
