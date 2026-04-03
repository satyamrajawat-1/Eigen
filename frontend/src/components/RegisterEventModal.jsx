import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, CheckCircle, Loader, UserPlus, Minus, Plus } from 'lucide-react';
import { registerForEvent, registerTeamForEvent } from '../lib/api';
import { useToast } from '../context/ToastContext';

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  transition: 'all 0.3s ease',
  outline: 'none',
};

const labelStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  marginBottom: '5px',
  display: 'block',
};

const RegisterEventModal = ({ isOpen, onClose, event }) => {
  const toast = useToast();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Team form state
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(0);
  const [memberEmails, setMemberEmails] = useState([]);

  if (!event) return null;

  const isTeam = event.participationType === 'TEAM';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleTeamSizeChange = (size) => {
    const num = Math.max(event.minTeamSize || 2, Math.min(event.maxTeamSize || 10, parseInt(size) || 0));
    setTeamSize(num);
    // Generate email fields based on size
    const newEmails = Array.from({ length: num }, (_, i) => memberEmails[i] || '');
    setMemberEmails(newEmails);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleRegister = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      if (isTeam) {
        // Validate team form
        if (!teamName.trim()) {
          setStatus('error');
          setErrorMsg('Team name is required.');
          toast.error('Team name is required.');
          return;
        }
        if (teamSize < (event.minTeamSize || 2)) {
          setStatus('error');
          setErrorMsg(`Team size must be at least ${event.minTeamSize || 2} members.`);
          toast.error(`Team size must be at least ${event.minTeamSize || 2} members.`);
          return;
        }
        const filledEmails = memberEmails.filter(e => e.trim() !== '');
        if (filledEmails.length < teamSize) {
          setStatus('error');
          setErrorMsg(`Please fill in all ${teamSize} member email fields.`);
          toast.error(`Please fill in all ${teamSize} member email fields.`);
          return;
        }

        const eventId = event.id || event._id;
        const res = await registerTeamForEvent(eventId, {
          teamName: teamName.trim(),
          memberEmails: filledEmails,
        });

        const msg = res.data?.message || `Team '${teamName}' registered successfully!`;
        toast.success(msg);
        setStatus('success');
      } else {
        // Individual registration
        const eventId = event.id || event._id;
        const res = await registerForEvent(eventId);
        const msg = res.data?.message || 'Registration successful!';
        toast.success(msg);
        setStatus('success');
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setStatus('error');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setStatus('idle');
      setErrorMsg('');
      setTeamName('');
      setTeamSize(0);
      setMemberEmails([]);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: isTeam ? '560px' : '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(13, 13, 21, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
            }}
          >
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '40px 0',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  <CheckCircle size={64} color="#10b981" />
                </motion.div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#10b981',
                }}>
                  Registration Successful!
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}>
                  {isTeam
                    ? `Team "${teamName}" is registered for ${event.title}.`
                    : `You're registered for ${event.title}. Check your email for QR ticket details.`
                  }
                </p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {isTeam ? 'Team Registration' : 'Confirm Registration'}
                    </h2>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                    }}>
                      {isTeam ? 'Enter your team details below' : 'Review event details below'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Event Details Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginBottom: '24px',
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '14px',
                  }}>
                    {event.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={14} color="var(--accent-blue)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={14} color="var(--accent-blue)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                        {event.startTime} — {event.endTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={14} color="var(--accent-blue)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                        {event.location}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={14} color="var(--accent-blue)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                        {isTeam ? `Team Event (${event.minTeamSize}-${event.maxTeamSize} members)` : 'Individual Event'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Team Registration Form */}
                {isTeam && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    {/* Team Name */}
                    <div>
                      <label style={labelStyle}>Team Name</label>
                      <input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="e.g., Code Warriors"
                        style={inputStyle}
                        onFocus={e => {
                          e.target.style.borderColor = 'var(--accent-blue)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Team Size */}
                    <div>
                      <label style={labelStyle}>
                        Team Size ({event.minTeamSize} – {event.maxTeamSize} members)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleTeamSizeChange(teamSize - 1)}
                          disabled={teamSize <= (event.minTeamSize || 2)}
                          style={{
                            width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white', cursor: 'pointer',
                            opacity: teamSize <= (event.minTeamSize || 2) ? 0.3 : 1,
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={teamSize || ''}
                          onChange={e => handleTeamSizeChange(e.target.value)}
                          min={event.minTeamSize || 2}
                          max={event.maxTeamSize || 10}
                          placeholder="0"
                          style={{
                            ...inputStyle,
                            width: '80px',
                            textAlign: 'center',
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleTeamSizeChange(teamSize + 1)}
                          disabled={teamSize >= (event.maxTeamSize || 10)}
                          style={{
                            width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white', cursor: 'pointer',
                            opacity: teamSize >= (event.maxTeamSize || 10) ? 0.3 : 1,
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Member Email Fields */}
                    {teamSize > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                      >
                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserPlus size={12} />
                          Member Emails
                        </label>
                        <p style={{
                          fontSize: '12px', color: 'var(--text-muted)',
                          fontFamily: 'var(--font-body)', marginBottom: '4px', lineHeight: 1.5,
                        }}>
                          Enter the registered email addresses of each team member. Your own email will be included automatically.
                        </p>
                        {memberEmails.map((email, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <span style={{
                              width: '28px', height: '28px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%',
                              background: 'rgba(59,130,246,0.1)',
                              border: '1px solid rgba(59,130,246,0.2)',
                              fontFamily: 'var(--font-mono)', fontSize: '11px',
                              color: '#3b82f6', fontWeight: 600, flexShrink: 0,
                            }}>
                              {idx + 1}
                            </span>
                            <input
                              value={email}
                              onChange={e => handleEmailChange(idx, e.target.value)}
                              placeholder={`member${idx + 1}@iiitkota.ac.in`}
                              type="email"
                              style={{ ...inputStyle, flex: 1 }}
                              onFocus={e => {
                                e.target.style.borderColor = 'var(--accent-blue)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                              }}
                              onBlur={e => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Error message */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px',
                      color: '#f87171',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      textAlign: 'center',
                    }}
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      flex: 1,
                      padding: '13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={status === 'loading' || (isTeam && (teamSize < (event.minTeamSize || 2) || !teamName.trim()))}
                    className="glow-btn"
                    style={{
                      flex: 2,
                      padding: '13px',
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: (status === 'loading' || (isTeam && (teamSize < (event.minTeamSize || 2) || !teamName.trim()))) ? 0.5 : 1,
                      cursor: (status === 'loading' || (isTeam && (teamSize < (event.minTeamSize || 2) || !teamName.trim()))) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Registering...
                      </>
                    ) : (
                      isTeam ? 'Register Team' : 'Confirm Registration'
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterEventModal;
