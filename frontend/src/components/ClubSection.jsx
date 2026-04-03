import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';

const ClubSection = ({ club, index, onRegisterEvent, isCoordinator }) => {
  return (
    <section
      id={`club-${club.id}`}
      style={{
        position: 'relative',
        padding: '120px 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '80vh',
      }}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: index % 2 === 0 ? '-10%' : 'auto',
        right: index % 2 !== 0 ? '-10%' : 'auto',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${club.accentColor}08 0%, transparent 70%)`,
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      {/* Club Number */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          color: club.accentColor,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: '16px',
          opacity: 0.6,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(9).padStart(2, '0')}
      </motion.div>

      {/* Club Name */}
      <motion.h2
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 900,
          background: club.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-2px',
          lineHeight: 1.1,
          marginBottom: '8px',
        }}
      >
        {club.name}
      </motion.h2>

      {/* Club Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          color: 'var(--text-secondary)',
          letterSpacing: '2px',
          marginBottom: '8px',
        }}
      >
        {club.tagline}
      </motion.p>

      {/* Club Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          lineHeight: 1.7,
          marginBottom: '48px',
        }}
      >
        {club.description}
      </motion.p>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '1px',
          background: `linear-gradient(90deg, ${club.accentColor}40, transparent)`,
          marginBottom: '48px',
          transformOrigin: 'left',
        }}
      />

      {/* Events Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {club.events.map((event, eventIndex) => (
          <EventCard
            key={event.id}
            event={event}
            clubGradient={club.gradient}
            clubAccent={club.accentColor}
            index={eventIndex}
            onRegister={onRegisterEvent}
            isCoordinator={isCoordinator}
          />
        ))}
      </div>
    </section>
  );
};

export default ClubSection;
