import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, User as UserIcon } from 'lucide-react';

const EventCard = ({ event, clubGradient, clubAccent, index, onRegister, isCoordinator }) => {
  const isTeam = event.participationType === 'TEAM';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3 },
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.boxShadow = `0 8px 40px ${clubAccent}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: clubGradient,
        opacity: 0.6,
      }} />

      {/* Event Type Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        background: isTeam ? 'rgba(124,58,237,0.12)' : 'rgba(16,185,129,0.12)',
        border: `1px solid ${isTeam ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)'}`,
        marginBottom: '16px',
      }}>
        {isTeam ? <Users size={12} color={clubAccent} /> : <UserIcon size={12} color="#10b981" />}
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: isTeam ? clubAccent : '#10b981',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          {isTeam ? `Team (${event.minTeamSize}-${event.maxTeamSize})` : 'Individual'}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '10px',
        letterSpacing: '-0.5px',
      }}>
        {event.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: '20px',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {event.description}
      </p>

      {/* Meta info */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {formatDate(event.date)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {event.startTime} - {event.endTime}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {event.location}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRegister && onRegister(event);
        }}
        style={{
          width: '100%',
          padding: '12px',
          background: isCoordinator ? 'rgba(255,255,255,0.06)' : clubGradient,
          border: isCoordinator ? '1px solid rgba(255,255,255,0.1)' : 'none',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 4px 20px ${clubAccent}30`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isCoordinator ? 'Manage Event' : 'Register Now'}
      </button>
    </motion.div>
  );
};

export default EventCard;
