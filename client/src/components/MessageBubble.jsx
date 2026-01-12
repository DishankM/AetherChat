import React from 'react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message, isOwn, isAI }) {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      style={{
        ...styles.container,
        ...(isOwn ? styles.ownContainer : {}),
        ...(isAI ? styles.aiContainer : {})
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      layout
    >
      {/* Avatar for received messages */}
      {!isOwn && !isAI && (
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            {(message.sender?.username || 'U')[0].toUpperCase()}
          </div>
        </div>
      )}

      <div style={{
        ...styles.bubbleWrapper,
        ...(isOwn ? styles.ownBubbleWrapper : {}),
        ...(isAI ? styles.aiBubbleWrapper : {})
      }}>
        {/* Sender name for received messages */}
        {!isOwn && !isAI && (
          <span style={styles.senderName}>
            {message.sender?.username || 'Unknown'}
          </span>
        )}
        
        <div style={{
          ...styles.bubble,
          ...(isOwn ? styles.ownBubble : {}),
          ...(isAI ? styles.aiBubble : {}),
          ...(message.isTemp ? styles.tempBubble : {})
        }}>
          {/* AI Label */}
          {isAI && (
            <div style={styles.aiLabel}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="#6366f1"/>
                <path d="M5 6.5C5 5.5 5.5 4.5 6.5 4.2V3H5C4.7 3 4.5 3.2 4.5 3.5V7C4.5 7.2 4.7 7.5 5 7.5H6.5C5.5 7.2 5 6.2 5 5.2V6.5Z" fill="white"/>
                <circle cx="7" cy="7.5" r="1" fill="white"/>
              </svg>
              AI Assistant
            </div>
          )}
          
          <p style={{
            ...styles.text,
            ...(isOwn ? styles.ownText : {}),
            ...(isAI ? styles.aiText : {})
          }}>
            {message.text}
          </p>
          
          <div style={styles.bubbleFooter}>
            <span style={{
              ...styles.time,
              ...(isOwn ? styles.ownTime : {}),
              ...(isAI ? styles.aiTime : {})
            }}>
              {formatTime(message.createdAt)}
            </span>
            {isOwn && !message.isTemp && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={styles.readIcon}>
                <path d="M12.5 3.5L5.5 10.5L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    maxWidth: '85%',
    width: 'fit-content',
    marginBottom: '4px'
  },
  ownContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    marginLeft: 'auto'
  },
  aiContainer: {
    alignSelf: 'flex-start'
  },
  avatarWrapper: {
    flexShrink: 0,
    marginTop: '2px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600'
  },
  bubbleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%'
  },
  ownBubbleWrapper: {
    alignItems: 'flex-end'
  },
  aiBubbleWrapper: {
    alignItems: 'flex-start'
  },
  senderName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '4px',
    marginLeft: '4px'
  },
  bubble: {
    padding: '14px 18px',
    background: 'white',
    borderRadius: '18px',
    borderTopLeftRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    maxWidth: '100%',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
  },
  ownBubble: {
    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
    borderRadius: '18px',
    borderTopRightRadius: '6px',
    borderTopLeftRadius: '18px',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
  },
  aiBubble: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: '1px solid #bae6fd',
    borderRadius: '18px',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '18px'
  },
  tempBubble: {
    opacity: 0.7
  },
  aiLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(186, 230, 253, 0.5)'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    margin: 0,
    color: '#1e293b'
  },
  ownText: {
    color: '#ffffff'
  },
  aiText: {
    color: '#0c4a6e'
  },
  bubbleFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)'
  },
  time: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.85)'
  },
  aiTime: {
    color: '#0369a1'
  },
  readIcon: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: '-1px'
  }
};
