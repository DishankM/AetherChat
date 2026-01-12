import React from 'react';
import { motion } from 'framer-motion';

export default function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewChat,
  onLogout,
  onOpenProfile,
  connected,
  currentUser
}) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6366f1"/>
              <path d="M8 13C8 11.5 9 10.5 10.5 10.5H21.5C23 10.5 24 11.5 24 13V19C24 20.5 23 21.5 21.5 21.5H17L12 25V21.5H8C6.5 21.5 5.5 20.5 5.5 19V13C5.5 11.5 6.5 10.5 8 10.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brand}>AetherChat</span>
        </div>
        
        <div style={styles.headerActions}>
          <div style={{
            ...styles.statusDot,
            background: connected ? '#10b981' : '#ef4444'
          }} title={connected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>

      {/* New Chat Button */}
      <motion.button
        style={styles.newChatButton}
        onClick={onNewChat}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 4V16M4 10H16" strokeLinecap="round"/>
        </svg>
        New Chat
      </motion.button>

      {/* Conversations List */}
      <div style={styles.conversationsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Conversations</span>
          <span style={styles.count}>{conversations.length}</span>
        </div>

        <div style={styles.conversationsList}>
          {conversations.map((conv, index) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isActive={activeConversation?._id === conv._id}
              onClick={() => onSelectConversation(conv)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Footer with User Profile */}
      <div style={styles.footer}>
        {/* Profile Button */}
        <motion.button
          style={styles.profileButton}
          onClick={onOpenProfile}
          whileHover={{ background: '#f1f5f9' }}
          whileTap={{ scale: 0.98 }}
        >
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{currentUser?.username || 'User'}</span>
              <span style={styles.userEmail}>{currentUser?.email || 'user@email.com'}</span>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <path d="M8 4H12M12 4V14M12 4L16 8M8 16H12M12 16L8 12M12 16L16 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        
        {/* Logout Button */}
        <motion.button
          style={styles.logoutButton}
          onClick={onLogout}
          whileHover={{ scale: 1.05, background: '#fef2f2', color: '#ef4444' }}
          whileTap={{ scale: 0.95 }}
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7M7 17L17 17M7 17L17 7M13 10V13" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick, index }) {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  return (
    <motion.button
      style={{
        ...styles.conversationItem,
        ...(isActive ? styles.conversationItemActive : {})
      }}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ background: '#f8fafc' }}
    >
      <div style={styles.convAvatar}>
        {conversation.isAI ? (
          <div style={styles.aiAvatar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#6366f1"/>
              <path d="M8 12C8 10.5 9 9.5 10.5 9.5H13.5C15 9.5 16 10.5 16 12V15C16 16.5 15 17.5 13.5 17.5H10.5C9 17.5 8 16.5 8 15V12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="9" r="1.5" fill="white"/>
              <circle cx="9" cy="12" r="1" fill="white"/>
              <circle cx="15" cy="12" r="1" fill="white"/>
            </svg>
          </div>
        ) : (
          <div style={styles.convAvatarInitial}>
            {(conversation.displayName || conversation.otherUser?.username || 'U')[0].toUpperCase()}
          </div>
        )}
        {!conversation.isAI && conversation.otherUser?.isOnline && (
          <div style={styles.onlineDot} />
        )}
      </div>

      <div style={styles.convInfo}>
        <div style={styles.convHeader}>
          <span style={styles.convName}>
            {conversation.isAI ? 'AI Assistant' : conversation.displayName}
          </span>
          <span style={styles.convTime}>
            {formatTime(conversation.updatedAt)}
          </span>
        </div>
        <div style={styles.convPreview}>
          <span style={styles.convLastMessage}>
            {conversation.lastMessage?.text || 'No messages yet'}
          </span>
        </div>
      </div>

      {isActive && (
        <motion.div
          style={styles.activeIndicator}
          layoutId="activeIndicator"
        />
      )}
    </motion.button>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'white'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brand: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  newChatButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '16px',
    padding: '12px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  conversationsSection: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    marginBottom: '4px'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  count: {
    fontSize: '12px',
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  conversationsList: {
    flex: 1,
    overflow: 'auto'
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    textAlign: 'left'
  },
  conversationItemActive: {
    background: '#f8fafc'
  },
  convAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0
  },
  aiAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  convAvatarInitial: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  onlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    background: '#10b981',
    borderRadius: '50%',
    border: '3px solid white'
  },
  convInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  convHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  convName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  convTime: {
    fontSize: '12px',
    color: '#94a3b8',
    flexShrink: 0,
    fontWeight: '500'
  },
  convPreview: {
    overflow: 'hidden'
  },
  convLastMessage: {
    fontSize: '13px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '28px',
    background: '#6366f1',
    borderRadius: '0 4px 4px 0'
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fafafa'
  },
  profileButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    flexShrink: 0
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutButton: {
    background: 'transparent',
    border: 'none',
    padding: '12px',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '12px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
