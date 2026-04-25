import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registerCollege, loginGoogle } from '../lib/api';
import { ArrowLeft } from 'lucide-react';

const CLIENT_ID = "286316884208-147gsfjhufu2etijs2neg6vaqrg8pq4e.apps.googleusercontent.com";

const AuthPage = () => {
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, isCoordinator } = useAuth();
  const toast = useToast();
  const canvasRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin() || isCoordinator()) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated]);

  // Background particles
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
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.25 + 0.05;
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
        ctx.fillStyle = `hsla(38, 70%, 55%, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const googleToken = credentialResponse.credential;
      let response;

      if (isLogin) {
        response = await loginGoogle(googleToken);
      } else {
        response = await registerCollege(googleToken);
      }

      const msg = response.data?.message || (isLogin ? 'Logged in successfully!' : 'Registered successfully!');
      toast.success(msg);

      const userData = response.data.data?.user || response.data.data;
      login(userData);

      if (userData?.roles?.includes('ADMIN') || userData?.roles?.includes('COORDINATOR')) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error. Could not connect to the server.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        padding: '20px',
      }}>
        {/* Background canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }} />

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '440px',
            background: 'rgba(13, 13, 21, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {/* Top gradient line */}
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
          }} />

          <div style={{ padding: '40px 32px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '40px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #f5e6c8, #c4863c, #f5c778)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-2px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
              >
                EIGEN
              </motion.h1>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}>
                IIIT Kota • College Fest
              </p>
            </div>

            {/* Toggle Tabs: Register / Login */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['Register', 'Login'].map((tab, i) => {
                const isActive = (i === 0 && !isLogin) || (i === 1 && isLogin);
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setError('');
                      setIsLogin(i === 1);
                    }}
                    style={{
                      flex: 1,
                      padding: '9px',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Google Login Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)', textAlign: 'center',
                  lineHeight: 1.6, marginBottom: '22px',
                }}>
                  {isLogin
                    ? 'Welcome back! Sign in with your Google account to continue.'
                    : <>Use your official <strong style={{ color: 'rgba(255,255,255,0.8)' }}>@iiitkota.ac.in</strong> email to register.</>
                  }
                </p>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '11px 14px', background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)',
                      marginBottom: '16px', color: '#f87171', fontSize: '13px',
                      fontFamily: 'var(--font-body)', textAlign: 'center',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Google Login */}
                <div style={{
                  display: 'flex', justifyContent: 'center', marginBottom: '24px',
                  opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto',
                }}>
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                      const msg = "Google Sign-In popup closed or failed.";
                      setError(msg);
                      toast.error(msg);
                    }}
                    theme="filled_black"
                    size="large"
                    text={isLogin ? 'signin_with' : 'continue_with'}
                    shape="rectangular"
                    useOneTap={false}
                    width="360"
                  />
                </div>

                {/* Footer text */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px',
                  color: 'rgba(255,255,255,0.25)', textAlign: 'center',
                  lineHeight: 1.6,
                }}>
                  {isLogin
                    ? "Don't have an account? Switch to Register above."
                    : 'Not a college student? Please see an Executive at the registration desk.'
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Back to home link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          style={{
            position: 'absolute', top: '24px', left: '24px',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            zIndex: 2, transition: 'all 0.3s ease', letterSpacing: '0.5px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </motion.button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;