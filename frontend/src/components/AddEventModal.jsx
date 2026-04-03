import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createEvent, updateEvent } from '../lib/api';

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

const AddEventModal = ({ isOpen, onClose, onEventAdded, editEvent = null }) => {
  const { getUserClubs, isAdmin } = useAuth();
  const toast = useToast();
  const userClubs = getUserClubs();
  const isEditing = !!editEvent;

  // Set initial club name from available clubs
  const initialClubName = isEditing
    ? editEvent.clubName
    : (userClubs && userClubs.length > 0 ? userClubs[0] : CLUBS[0]);

  const [form, setForm] = useState({
    title: isEditing ? editEvent.title : '',
    clubName: initialClubName,
    description: isEditing ? (editEvent.description || '') : '',
    date: isEditing ? (editEvent.date ? new Date(editEvent.date).toISOString().split('T')[0] : '') : '',
    startTime: isEditing ? (editEvent.startTime || '') : '',
    endTime: isEditing ? (editEvent.endTime || '') : '',
    location: isEditing ? (editEvent.location || 'IIIT KOTA CAMPUS') : 'IIIT KOTA CAMPUS',
    participationType: isEditing ? (editEvent.participationType || 'INDIVIDUAL') : 'INDIVIDUAL',
    minTeamSize: isEditing ? (editEvent.minTeamSize || 2) : 2,
    maxTeamSize: isEditing ? (editEvent.maxTeamSize || 4) : 4,
    image: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

    // Validation
    const requiredFields = ['title', 'clubName', 'date', 'startTime', 'endTime'];
    const missingFields = requiredFields.filter(field => {
      const value = form[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      const msg = `Missing required fields: ${missingFields.join(', ')}`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Image required only for create, not edit
    if (!isEditing && !form.image) {
      const msg = 'Event poster image is required. Please upload an image file.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('clubName', form.clubName);
    formData.append('description', form.description);
    formData.append('date', form.date);
    formData.append('startTime', form.startTime);
    formData.append('endTime', form.endTime);
    formData.append('location', form.location);
    formData.append('participationType', form.participationType);
    if (form.participationType === 'TEAM') {
      formData.append('minTeamSize', form.minTeamSize);
      formData.append('maxTeamSize', form.maxTeamSize);
    }
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      let res;
      if (isEditing) {
        const eventId = editEvent._id || editEvent.id;
        res = await updateEvent(eventId, formData);
        const msg = res.data?.message || 'Event updated successfully!';
        toast.success(msg);
      } else {
        res = await createEvent(formData);
        const msg = res.data?.message || 'Event created successfully!';
        toast.success(msg);
      }

      if (res.data?.data) {
        onEventAdded(res.data.data, isEditing);
      }

      // Reset form after successful submission
      setForm({
        title: '', clubName: initialClubName, description: '', date: '',
        startTime: '', endTime: '', location: 'IIIT KOTA CAMPUS',
        participationType: 'INDIVIDUAL', minTeamSize: 2, maxTeamSize: 4, image: null,
      });
      setFileName('');
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save event';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Admin sees all clubs, coordinator sees only their clubs
  const availableClubs = isAdmin() ? CLUBS : (userClubs && userClubs.length > 0 ? userClubs : CLUBS);

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
                {isEditing ? 'Edit Event' : 'Create Event'}
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
              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fca5a5',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {errorMessage}
                </motion.div>
              )}

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
                    e.target.style.borderColor = 'var(--accent-blue)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
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
                    <option key={club} value={club} style={{ background: '#0d0d15' }}>
                      {club}
                    </option>
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
                        background: form.participationType === type ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.participationType === type ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: form.participationType === type ? '#93c5fd' : 'var(--text-secondary)',
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
                <label style={labelStyle}>
                  Event Poster {isEditing && <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(optional when editing)</span>}
                </label>
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
                disabled={submitting || !form.title || !form.clubName || !form.date || !form.startTime || !form.endTime || (!isEditing && !form.image)}
                className="glow-btn"
                style={{
                  padding: '14px',
                  fontSize: '15px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  opacity: (submitting || !form.title || !form.clubName || !form.date || !form.startTime || !form.endTime || (!isEditing && !form.image)) ? 0.6 : 1,
                  marginTop: '8px',
                  cursor: (submitting || !form.title || !form.clubName || !form.date || !form.startTime || !form.endTime || (!isEditing && !form.image)) ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
