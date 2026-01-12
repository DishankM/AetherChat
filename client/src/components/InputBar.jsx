import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InputBar({ onSend, onTyping, placeholder }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  let typingTimeout = null;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setText(value);

    // Notify typing status
    if (onTyping) {
      if (typingTimeout) clearTimeout(typingTimeout);
      
      onTyping(true);
      typingTimeout = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  }, [onTyping]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text);
    setText('');
    
    // Reset typing status
    if (onTyping && typingTimeout) {
      clearTimeout(typingTimeout);
      onTyping(false);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, onSend, onTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <motion.div
      style={{
        ...styles.container,
        ...(isFocused ? styles.containerFocused : {})
      }}
      animate={{ 
        boxShadow: isFocused 
          ? '0 -4px 20px rgba(99, 102, 241, 0.15)' 
          : '0 -2px 10px rgba(0,0,0,0.05)'
      }}
    >
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
        />
        
        <AnimatePresence mode="wait">
          {text.trim() ? (
            <motion.button
              type="submit"
              style={styles.sendButton}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.5 10H16.5M16.5 10L11.5 5M16.5 10L11.5 15M3.5 10L6.5 12.5C7.5 13.5 9.5 15 10.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              style={styles.emojiButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="7" cy="8" r="1" fill="currentColor"/>
                <circle cx="13" cy="8" r="1" fill="currentColor"/>
                <path d="M6 12C6 12 7.5 14 10 14C12.5 14 14 12 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderTop: '1px solid #e2e8f0',
    padding: '16px 24px',
    transition: 'all 0.3s ease'
  },
  containerFocused: {
    background: '#ffffff'
  },
  form: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '12px 0',
    fontSize: '14px',
    lineHeight: '1.5',
    background: 'transparent',
    maxHeight: '120px',
    minHeight: '24px',
    color: '#1e293b'
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  emojiButton: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s'
  }
};
