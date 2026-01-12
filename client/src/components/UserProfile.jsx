import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserProfile({ user, isOpen, onClose, onLogout }) {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
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
            <motion.button
              style={styles.closeButton}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            <h2 style={styles.title}>My Profile</h2>
            <div style={styles.headerSpacer} />
          </div>

          {/* Profile Content */}
          <div style={styles.content}>
            {/* Avatar Section */}
            <motion.div
              style={styles.avatarSection}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <div style={styles.avatar}>
                {(user.username?.[0] || 'U').toUpperCase()}
              </div>
              <div style={styles.avatarBadge}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10 5H14L11 8L12 12L8 10L4 12L5 8L2 5H6L8 1Z" fill="#10b981"/>
                </svg>
              </div>
            </motion.div>

            {/* User Info Section */}
            <motion.div
              style={styles.infoSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Username</div>
                <div style={styles.infoValue}>{user.username}</div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{user.email}</div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>User ID</div>
                <div style={styles.infoValueSmall}>{user._id}</div>
              </div>
            </motion.div>

            {/* Account Stats */}
            <motion.div
              style={styles.statsSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="10" r="8" strokeLinecap="round"/>
                    <path d="M10 6V10L13 12" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={styles.statInfo}>
                  <span style={styles.statLabel}>Member since</span>
                  <span style={styles.statValue}>{formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="10" r="8" strokeLinecap="round"/>
                    <path d="M10 5V10L13 12" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={styles.statInfo}>
                  <span style={styles.statLabel}>Last seen</span>
                  <span style={styles.statValue}>{formatDate(user.lastSeen)}</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              style={styles.actionsSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <motion.button
                style={styles.logoutButton}
                onClick={onLogout}
                whileHover={{ scale: 1.02, background: '#dc2626' }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7M7 17L17 17M7 17L17 7M13 10V13" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </motion.button>
            </motion.div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>AetherChat - AI Enhanced Messenger</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Online';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
    maxWidth: '400px',
    maxHeight: '90vh',
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
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  headerSpacer: {
    width: '40px'
  },
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'auto'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
  },
  avatarBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: 'calc(50% - 45px)',
    width: '28px',
    height: '28px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoCard: {
    background: '#f8fafc',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #e2e8f0'
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1e293b',
    wordBreak: 'break-all'
  },
  infoValueSmall: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#94a3b8',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: '#fefce8',
    borderRadius: '14px',
    border: '1px solid #fef08a'
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ca8a04'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  statLabel: {
    fontSize: '11px',
    color: '#a16207',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '14px',
    color: '#854d0e',
    fontWeight: '600'
  },
  actionsSection: {
    marginTop: '8px'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  footerText: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: 0
  }
};
