import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/api/auth/search?query=${encodeURIComponent(query.trim())}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.users || []);
          
          if (data.users?.length === 0) {
            setError('No users found matching your search');
          }
        } else {
          setError('Failed to search users');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectUser = useCallback(async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: user._id })
      });

      if (response.ok) {
        const data = await response.json();
        onSelect(data.conversation);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }, [onSelect]);

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={styles.highlightedText}>{part}</span>
      ) : part
    );
  };

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>New Conversation</h2>
          <motion.button
            style={styles.closeButton}
            onClick={onClose}
            whileHover={{ scale: 1.1, background: '#f1f5f9' }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Search Input */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIconWrapper}>
            {loading ? (
              <motion.div
                style={styles.smallSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="9" cy="9" r="6" strokeLinecap="round"/>
                <path d="M13.5 13.5L17 17" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            style={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or email..."
            autoComplete="off"
          />
          {query && (
            <motion.button
              style={styles.clearButton}
              onClick={() => setQuery('')}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ background: '#e2e8f0' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4L4 12M4 4L12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          )}
        </div>

        {/* Search Tips */}
        {!query && (
          <div style={styles.tipsContainer}>
            <p style={styles.tipsTitle}>Search by</p>
            <div style={styles.tipsList}>
              <span style={styles.tipBadge}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 12C2 9.5 4 8 7 8C10 8 12 9.5 12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Username
              </span>
              <span style={styles.tipBadge}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="3" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 3V2C4 1.5 4.5 1 5 1H9C9.5 1 10 1.5 10 2V3" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
                </svg>
                Email
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        <div style={styles.results}>
          {error && (
            <div style={styles.errorContainer}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="2" fill="none"/>
                <path d="M24 18V26M24 30V30.5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {!error && results.map((user, index) => (
            <motion.button
              key={user._id}
              style={styles.userItem}
              onClick={() => handleSelectUser(user)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ background: '#f8fafc' }}
            >
              <div style={styles.userAvatar}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>
                  {highlightMatch(user.username, query)}
                </span>
                <span style={styles.userEmail}>
                  {highlightMatch(user.email, query)}
                </span>
              </div>
              <div style={styles.actionArrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M8 5H12M12 5V15M12 5L16 9M12 15L8 15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.button>
          ))}

          {!error && query && results.length === 0 && !loading && (
            <div style={styles.noResults}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="2" fill="none"/>
                <path d="M16 16L24 24L32 16M16 24H32" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={styles.noResultsText}>No users found</p>
              <p style={styles.noResultsHint}>Try searching with a different username or email</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Click on a user to start a conversation
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '440px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafafa'
  },
  searchIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px'
  },
  smallSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '15px',
    color: '#1e293b',
    padding: '4px 0',
    minWidth: 0
  },
  clearButton: {
    background: '#f1f5f9',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  tipsContainer: {
    padding: '12px 24px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  tipsTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  tipsList: {
    display: 'flex',
    gap: '8px'
  },
  tipBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
    background: 'white',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  results: {
    flex: 1,
    overflow: 'auto',
    padding: '8px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#64748b'
  },
  errorText: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '14px',
    textAlign: 'left',
    transition: 'background 0.2s'
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
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
  actionArrow: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  highlightedText: {
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '2px',
    fontWeight: '500'
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#64748b'
  },
  noResultsText: {
    marginTop: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#64748b'
  },
  noResultsHint: {
    marginTop: '4px',
    fontSize: '13px',
    color: '#94a3b8'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    background: '#fafafa'
  },
  footerText: {
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: 0
  }
};
