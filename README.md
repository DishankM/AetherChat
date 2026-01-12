# AetherChat - AI-Enhanced MERN Chat Application

A modern, minimalist real-time chat application built with the MERN stack, featuring Socket.io for real-time messaging and Groq API integration for AI-powered conversations.

![AetherChat Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=AetherChat+Preview)

## Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **AI Chat Assistant**: Integrated Groq API for intelligent conversations
- **User Authentication**: Secure JWT-based authentication
- **Message History**: Persistent chat history with MongoDB
- **Typing Indicators**: See when others are typing
- **Online Status**: Real-time online/offline indicators
- **Minimal Design**: Clean, distraction-free UI with smooth animations
- **Responsive**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- React 18 with Vite
- Framer Motion for animations
- Socket.io Client
- React Router v6

### Backend
- Node.js with Express
- Socket.io for WebSocket connections
- MongoDB with Mongoose
- JWT for authentication
- Groq SDK for AI integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Groq API Key (get one at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   cd /workspace/aetherchat
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/aetherchat
   JWT_SECRET=your_super_secret_jwt_key
   GROQ_API_KEY=gsk_your_groq_api_key
   CLIENT_URL=http://localhost:5173
   ```

4. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Create environment file for client**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
aetherchat/
├── server/                    # Backend application
│   ├── models/               # MongoDB schemas
│   │   ├── User.js          # User model
│   │   ├── Message.js       # Message model
│   │   └── Conversation.js  # Conversation model
│   ├── routes/              # Express routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── messages.js      # Message routes
│   │   └── conversations.js # Conversation routes
│   ├── services/            # Business logic
│   │   └── groqService.js   # Groq API integration
│   ├── socket/              # Socket.io handlers
│   │   └── handlers.js      # Real-time event handlers
│   ├── server.js            # Entry point
│   └── package.json
│
├── client/                   # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ChatLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── InputBar.jsx
│   │   │   └── UserSearch.jsx
│   │   ├── context/         # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Usage

### User Authentication
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Auto-AI Setup**: An AI Assistant conversation is automatically created

### Chatting with AI
- The AI Assistant is automatically added to your contacts
- Click on "AI Assistant" to start chatting
- Ask questions, get explanations, or just have a conversation

### Real-time Messaging
- Click "New Chat" to search for users
- Select a user to start a conversation
- Messages are delivered instantly
- See typing indicators and online status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/search` - Search users

### Conversations
- `GET /api/conversations` - Get all user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get specific conversation

### Messages
- `GET /api/messages/:conversationId` - Get conversation messages
- `DELETE /api/messages/:messageId` - Delete a message

## Socket Events

### Client → Server
- `join_conversation` - Join a chat room
- `leave_conversation` - Leave a chat room
- `send_message` - Send a text message
- `ask_ai` - Send message to AI
- `typing_start` / `typing_stop` - Typing indicators
- `mark_read` - Mark messages as read

### Server → Client
- `receive_message` - Receive new message
- `user_typing` - Typing status update
- `ai_thinking` - AI processing indicator
- `user_status` - Online/offline status
- `messages_read` - Read receipt

## Environment Variables

### Server (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT tokens |
| GROQ_API_KEY | Groq API key for AI |
| CLIENT_URL | Frontend URL for CORS |

### Client (.env)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |
| VITE_SOCKET_URL | Socket.io server URL |

## Animations

The app uses Framer Motion for smooth animations:
- Page transitions
- Message entry animations
- Typing indicators
- Modal popups
- Hover effects
- Status changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Groq](https://groq.com) for the fast AI inference API
- [Socket.io](https://socket.io) for real-time communication
- [Framer Motion](https://www.framer.com/motion/) for animations
