import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TAGLINE = 'Where Innovation Meets Celebration';

const HeroSection = ({ scrollProgress = 0, onCtaClick, isAuthenticated }) => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const canvasRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroReady(true);
      setShowCursor(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!heroReady) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index <= TAGLINE.length) {
        setTypedText(TAGLINE.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [heroReady]);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 262 : 280;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        // Draw connections
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const eigenScale = 1 - scrollProgress * 0.65;
  const eigenOpacity = 1 - scrollProgress * 0.3;
  const taglineOpacity = 1 - scrollProgress * 2.5;
  const ctaOpacity = 1 - scrollProgress * 3;

  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Particle Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Radial glow behind title */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
      }} />

      {/* Geometric decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          border: '1px solid rgba(124,58,237,0.1)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          border: '1px solid rgba(168,85,247,0.07)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      {/* Main EIGEN Title */}
      <motion.h1
        initial={{ scale: 0.3, opacity: 0, filter: 'blur(20px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 15vw, 180px)',
          fontWeight: 900,
          letterSpacing: '-4px',
          background: 'linear-gradient(135deg, #e0d0ff 0%, #7c3aed 40%, #ec4899 70%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          position: 'relative',
          zIndex: 1,
          lineHeight: 1,
          textAlign: 'center',
          transform: `scale(${Math.max(eigenScale, 0.35)})`,
          opacity: Math.max(eigenOpacity, 0.7),
          userSelect: 'none',
        }}
      >
        EIGEN
      </motion.h1>

      {/* Tagline with typewriter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: heroReady ? 1 : 0, y: heroReady ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '16px',
          opacity: Math.max(taglineOpacity, 0),
        }}
      >
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(14px, 2vw, 22px)',
          color: 'var(--text-secondary)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {typedText}
          {showCursor && <span className="typewriter-cursor" />}
        </p>
      </motion.div>

      {/* CTA Button */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: heroReady ? 1 : 0, y: heroReady ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '48px',
            opacity: Math.max(ctaOpacity, 0),
          }}
        >
          <button
            onClick={onCtaClick}
            className="glow-btn"
            style={{
              padding: '16px 48px',
              fontSize: '16px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Register / Login
          </button>
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress < 0.1 ? 0.6 : 0 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '20px',
            height: '32px',
            border: '2px solid var(--text-muted)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '6px',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0], y: [0, 10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '3px',
              height: '8px',
              background: 'var(--text-muted)',
              borderRadius: '2px',
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
