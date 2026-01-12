import React, { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Added motion import
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const {
    socket,
    connected,
    joinConversation,
    leaveConversation,
    sendMessage,
    askAI,
    markAsRead,
    // Destructure these to fix the "not defined" errors
    startTyping,
    stopTyping,
    typingUsers = new Set() // Default to empty set if not in context
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const isAI = conversation?.isAI || conversation?.isAIContact;

  // 1. FETCH MESSAGES
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/messages/${conversation._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // 2. JOIN/LEAVE ROOM 
  // Optimization: Only run when ID changes or connection status flips
  useEffect(() => {
    if (!conversation?._id || !connected) return;

    joinConversation(conversation._id);
    markAsRead(conversation._id);

    // Cleanup: This ensures the user leaves the previous room 
    // before joining a new one or on unmount
    return () => {
      leaveConversation(conversation._id);
    };
  }, [conversation?._id, connected, joinConversation, leaveConversation, markAsRead]);

  // 3. SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    const onReceiveMessage = (msg) => {
      // Logic: Ensure the message belongs to THIS conversation
      if (msg.conversationId !== conversation?._id) return;

      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
      markAsRead(conversation._id);
    };

    const onAIThinking = ({ isThinking, conversationId }) => {
        if (conversationId === conversation?._id) {
            setAiThinking(isThinking);
        }
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("ai_thinking", onAIThinking);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("ai_thinking", onAIThinking);
    };
  }, [socket, conversation?._id, markAsRead]); // Added markAsRead to deps

  // 4. AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking]);

  const handleSendMessage = useCallback((text) => {
    if (!text.trim() || !conversation?._id) return;

    if (isAI) {
      const tempId = `temp_${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        text: text,
        sender: { _id: user?._id, username: user?.username },
        messageType: 'text',
        createdAt: new Date().toISOString(),
        isTemp: true
      };
      setMessages(prev => [...prev, tempMessage]);

      if (socket?.connected) {
        askAI({ conversationId: conversation._id, text: text.trim() });
      } else {
        setMessages(prev => [...prev, {
          _id: `error_${Date.now()}`,
          text: "Connection lost. Retrying...",
          sender: { _id: 'system', username: 'System' },
          messageType: 'ai_response'
        }]);
      }
    } else {
      sendMessage({ conversationId: conversation._id, text: text.trim() });
    }
  }, [conversation?._id, isAI, user, sendMessage, askAI, socket]);

  const handleTyping = useCallback((isTyping) => {
    if (!conversation?._id || isAI || !startTyping) return;

    if (isTyping) {
      startTyping(conversation._id);
    } else {
      stopTyping(conversation._id);
    }
  }, [conversation?._id, isAI, startTyping, stopTyping]);

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 bg-slate-50">
        <div className="text-center">
           <p>Connecting to secure chat...</p>
        </div>
      </div>
    );
  }


  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.header 
        style={styles.header}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div style={styles.headerContent}>
          <div style={styles.avatar}>
            {isAI ? (
              <div style={styles.aiAvatar}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="12" fill="#6366f1"/>
                  <path d="M10 14C10 12.5 10.8 11.3 12.2 10.9V8H10C9.44772 8 9 8.44772 9 9V16C9 16.5523 9.44772 17 10 17H12.2C10.8 16.6 10 15.4 10 14Z" fill="white"/>
                  <path d="M14 10C14 8.5 14.8 7.3 16.2 6.9V4H14C13.4477 4 13 4.44772 13 5V14C13 14.5523 13.4477 15 14 15H16.2C14.8 14.6 14 13.4 14 12V10Z" fill="white"/>
                  <path d="M18 14C18 12.5 18.8 11.3 20.2 10.9V8H18C17.4477 8 17 8.44772 17 9V16C17 16.5523 17.4477 17 18 17H20.2C18.8 16.6 18 15.4 18 14Z" fill="white"/>
                  <circle cx="14" cy="17" r="2" fill="white"/>
                </svg>
              </div>
            ) : (
              <div style={styles.userAvatar}>
                {(conversation?.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
            {!isAI && conversation?.otherUser?.isOnline && (
              <div style={styles.onlineDot} />
            )}
          </div>
          
          <div style={styles.userInfo}>
            <h2 style={styles.userName}>
              {isAI ? 'AI Assistant' : conversation?.displayName}
            </h2>
            <span style={styles.status}>
              {isAI 
                ? 'Ask me anything!' 
                : (conversation?.otherUser?.isOnline ? 'Online' : 'Offline')}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {loading ? (
          <div style={styles.loading}>
            <motion.div
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : messages.length === 0 ? (
          <EmptyChat isAI={isAI} />
        ) : (
          <div style={styles.messagesList}>
            <AnimatePresence>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender?._id ? message.sender._id === user?._id : message.sender === user?._id;
                return (
                  <MessageBubble
                    key={message._id || index}
                    message={message}
                    isOwnMessage={isOwnMessage}
                    isAI={message.messageType === 'ai_response'}
                  />
                );
              })}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <motion.div
                style={styles.typingIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div style={styles.typingDots}>
                  <span /><span /><span />
                </div>
                <span style={styles.typingText}>
                  {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </span>
              </motion.div>
            )}

            {/* AI Thinking Indicator */}
            {aiThinking && (
              <motion.div
                style={styles.typingIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div style={styles.typingDots}>
                  <span /><span /><span />
                </div>
                <span style={styles.typingText}>AI is thinking...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <InputBar
        onSend={handleSendMessage}
        onTyping={handleTyping}
        placeholder={isAI ? "Ask AI anything..." : "Type a message..."}
      />
    </div>
  );

  
}

function EmptyChat({ isAI }) {
  return (
    <motion.div
      style={styles.emptyChat}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={styles.emptyIcon}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="16" fill="#f1f5f9"/>
          {isAI ? (
            <path d="M30 18C30 15.5 31.5 13.5 34 12V10C34 8.5 33 7.5 31.5 7.5H28.5C27 7.5 26 8.5 26 10V20C26 21.5 27 22.5 28.5 22.5H34V12C31.5 13.5 30 15.5 30 18Z" fill="#6366f1"/>
          ) : (
            <path d="M15 26C15 22.5 17.5 20 21 20H39C42.5 20 45 22.5 45 26V34C45 37.5 42.5 40 39 40H34L24 48V40H15C12.5 40 10 37.5 10 34V26C10 22.5 12.5 20 15 20Z" stroke="#6366f1" strokeWidth="2" fill="none"/>
          )}
        </svg>
      </div>
      <h3 style={styles.emptyTitle}>
        {isAI ? 'Chat with AI' : 'No messages yet'}
      </h3>
      <p style={styles.emptyText}>
        {isAI 
          ? 'Ask me anything - coding questions, explanations, or just chat!' 
          : 'Send a message to start the conversation'}
      </p>
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f8fafc'
  },
  header: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  aiAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px'
  },
  onlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '10px',
    height: '10px',
    background: '#10b981',
    borderRadius: '50%',
    border: '2px solid white'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  status: {
    fontSize: '12px',
    color: '#64748b'
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '24px'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  spinner: {
    width: '32px',
    height: '32px'
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '700px',
    margin: '0 auto'
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'white',
    borderRadius: '16px',
    alignSelf: 'flex-start',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  typingDots: {
    display: 'flex',
    gap: '4px'
  },
  typingText: {
    fontSize: '13px',
    color: '#64748b'
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '20px'
  },
  emptyIcon: {
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '280px'
  }
};
