import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import UserProfile from './UserProfile';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatLayout() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        
        // Set first conversation as active if none selected
        if (!activeConversation && data.conversations.length > 0) {
          setActiveConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv._id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: message.text,
                sender: message.sender,
                createdAt: message.createdAt
              },
              updatedAt: message.createdAt
            };
          }
          return conv;
        });
      });

      // Update active conversation messages
      setActiveConversation(prev => {
        if (prev && prev._id === message.conversationId) {
          return {
            ...prev,
            messages: [...(prev.messages || []), message]
          };
        }
        return prev;
      });
    };

    const handleUserStatus = ({ userId, isOnline }) => {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.otherUser && conv.otherUser._id === userId) {
            return {
              ...conv,
              otherUser: {
                ...conv.otherUser,
                isOnline
              }
            };
          }
          return conv;
        });
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_status', handleUserStatus);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_status', handleUserStatus);
    };
  }, [socket]);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Handle new conversation from user search
  const handleNewConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev]);
    setActiveConversation(conversation);
    setShowSearch(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          style={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#6366f1" strokeWidth="3" fill="none" opacity="0.3"/>
            <path d="M20 2a18 18 0 0 1 18 18" stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        </motion.div>
        <p style={styles.loadingText}>Loading AetherChat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      <motion.header 
        style={styles.mobileHeader}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div style={styles.mobileHeaderContent}>
          <button 
            style={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <span style={styles.mobileTitle}>AetherChat</span>
          <div style={styles.mobileHeaderRight}>
            <motion.button
              style={styles.profileIconButton}
              onClick={() => setShowProfile(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div style={styles.mobileAvatar}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </motion.button>
            <div style={{
              ...styles.connectionDot,
              background: connected ? '#10b981' : '#ef4444'
            }} />
          </div>
        </div>
      </motion.header>

      <div style={styles.content}>
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              style={styles.sidebarWrapper}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <Sidebar
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                onNewChat={() => setShowSearch(true)}
                onOpenProfile={() => setShowProfile(true)}
                onLogout={handleLogout}
                connected={connected}
                currentUser={user}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <main style={styles.chatArea}>
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              onBack={() => setSidebarOpen(true)}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <UserSearch
            onClose={() => setShowSearch(false)}
            onSelect={handleNewConversation}
          />
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <UserProfile
            user={user}
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={styles.emptyContainer}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={styles.emptyIcon}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect width="80" height="80" rx="20" fill="#f1f5f9"/>
          <path d="M20 35C20 29.477 24.477 25 30 25H50C55.523 25 60 29.477 60 35V45C60 50.523 55.523 55 50 55H40L30 62V55H20C15.477 55 11 50.523 11 45V35C11 29.477 15.477 25 20 25Z" stroke="#6366f1" strokeWidth="2" fill="none"/>
        </svg>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.emptyTitle}
      >
        Welcome to AetherChat
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={styles.emptyText}
      >
        Select a conversation to start chatting or chat with our AI assistant
      </motion.p>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc'
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#f8fafc'
  },
  spinner: {
    width: '40px',
    height: '40px'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px'
  },
  mobileHeader: {
    display: 'none',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 16px',
    height: '60px',
    alignItems: 'center',
    zIndex: 100
  },
  mobileHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '8px'
  },
  mobileTitle: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#1e293b'
  },
  mobileHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  profileIconButton: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    borderRadius: '50%'
  },
  mobileAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebarWrapper: {
    width: '320px',
    flexShrink: 0,
    borderRight: '1px solid #e2e8f0',
    background: 'white',
    height: '100%'
  },
  chatArea: {
    flex: 1,
    height: '100%',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column'
  },
  emptyContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  emptyIcon: {
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '300px'
  }
};
