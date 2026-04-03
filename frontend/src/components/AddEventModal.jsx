import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLUBS = [
  'CODEBASE', 'KERNEL', 'ARC ROBOTICS', 'ALGORITHMUS',
  'CYPHER', 'GDF', 'GFG', 'TGCC', 'TECHKNOW'
];

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
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
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  marginBottom: '6px',
  display: 'block',
};

const AddEventModal = ({ isOpen, onClose }) => {
  const { getUserClubs } = useAuth();
  const userClubs = getUserClubs();

  const [form, setForm] = useState({
    title: '',
    clubName: userClubs[0] || '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: 'IIIT KOTA CAMPUS',
    participationType: 'INDIVIDUAL',
    minTeamSize: 2,
    maxTeamSize: 4,
    image: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    onClose();
    setForm({
      title: '', clubName: userClubs[0] || '', description: '', date: '',
      startTime: '', endTime: '', location: 'IIIT KOTA CAMPUS',
      participationType: 'INDIVIDUAL', minTeamSize: 2, maxTeamSize: 4, image: null,
    });
    setFileName('');
  };

  const availableClubs = userClubs.length > 0 ? userClubs : CLUBS;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
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
              maxWidth: '560px',
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
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Create Event
              </h2>
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Event Name */}
              <div>
                <label style={labelStyle}>Event Name</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Hack The Matrix"
                  required
                  style={inputStyle}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Club Selection */}
              <div>
                <label style={labelStyle}>Club</label>
                <select
                  name="clubName"
                  value={form.clubName}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {availableClubs.map(club => (
                    <option key={club} value={club} style={{ background: '#0d0d15' }}>{club}</option>
                  ))}
                </select>
              </div>

              {/* Date & Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}><Calendar size={12} style={{display: 'inline', marginRight: '4px'}} />Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><Clock size={12} style={{display: 'inline', marginRight: '4px'}} />Start</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><Clock size={12} style={{display: 'inline', marginRight: '4px'}} />End</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}><MapPin size={12} style={{display: 'inline', marginRight: '4px'}} />Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Main Auditorium"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}><FileText size={12} style={{display: 'inline', marginRight: '4px'}} />Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this event is about..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Participation Type */}
              <div>
                <label style={labelStyle}><Users size={12} style={{display: 'inline', marginRight: '4px'}} />Participation Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['INDIVIDUAL', 'TEAM'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, participationType: type }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: form.participationType === type ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.participationType === type ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: form.participationType === type ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Size (conditional) */}
              {form.participationType === 'TEAM' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                >
                  <div>
                    <label style={labelStyle}>Min Team Size</label>
                    <input type="number" name="minTeamSize" value={form.minTeamSize} onChange={handleChange} min="2" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Team Size</label>
                    <input type="number" name="maxTeamSize" value={form.maxTeamSize} onChange={handleChange} min="2" style={inputStyle} />
                  </div>
                </motion.div>
              )}

              {/* Image Upload */}
              <div>
                <label style={labelStyle}>Event Poster</label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Upload size={18} />
                  {fileName || 'Click to upload image'}
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="glow-btn"
                style={{
                  padding: '14px',
                  fontSize: '15px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  opacity: submitting ? 0.6 : 1,
                  marginTop: '8px',
                }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
