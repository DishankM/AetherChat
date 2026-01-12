import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'ai_response', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  aiContext: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
