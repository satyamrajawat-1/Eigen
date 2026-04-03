import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllEvents } from '../lib/api';
import AddEventModal from '../components/AddEventModal';
import RegisterEventModal from '../components/RegisterEventModal';
import { Calendar, Clock, MapPin, Users, User as UserIcon, Plus, LogOut, LayoutDashboard } from 'lucide-react';

const TAGLINE = 'Where Innovation Meets Celebration';

// Club metadata (colors, gradients, taglines — not stored in DB)
const CLUB_META = {
  'CODEBASE':    { gradient: 'linear-gradient(135deg,#7c3aed,#3b82f6)', accentColor: '#7c3aed', tagline: 'Code. Create. Conquer.', description: 'The premier coding club of IIIT Kota, driving innovation through competitive programming, hackathons, and open-source contributions.' },
  'KERNEL':      { gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)', accentColor: '#06b6d4', tagline: 'Deep Dive into Systems.', description: 'Exploring the depths of operating systems, low-level programming, and systems architecture.' },
  'ARC ROBOTICS':{ gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', accentColor: '#f59e0b', tagline: 'Engineer the Future.', description: 'Bridging the gap between software and hardware through robotics, IoT, and embedded systems.' },
  'ALGORITHMUS': { gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', accentColor: '#10b981', tagline: 'Think. Solve. Optimize.', description: 'Mastering the art of algorithms, data structures, and mathematical problem solving.' },
  'CYPHER':      { gradient: 'linear-gradient(135deg,#ec4899,#8b5cf6)', accentColor: '#ec4899', tagline: 'Decrypt the Unknown.', description: 'Cryptography, cybersecurity, and ethical hacking — defending the digital frontier.' },
  'GDF':         { gradient: 'linear-gradient(135deg,#ef4444,#f59e0b)', accentColor: '#ef4444', tagline: 'Design. Develop. Deploy.', description: 'Game Development Forum — creating immersive gaming experiences and interactive digital art.' },
  'GFG':         { gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', accentColor: '#22c55e', tagline: 'Learn. Practice. Excel.', description: 'GeeksforGeeks Student Chapter — fostering coding culture and placement preparation.' },
  'TGCC':        { gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', accentColor: '#3b82f6', tagline: 'Cloud. Compute. Create.', description: 'The Google Cloud Community — exploring cloud computing, DevOps, and scalable architecture.' },
  'TECHKNOW':    { gradient: 'linear-gradient(135deg,#a855f7,#ec4899)', accentColor: '#a855f7', tagline: 'Know Tech. Be Tech.', description: 'The flagship technical society — orchestrating the biggest tech events and workshops on campus.' },
};

const CLUB_ORDER = ['CODEBASE','KERNEL','ARC ROBOTICS','ALGORITHMUS','CYPHER','GDF','GFG','TGCC','TECHKNOW'];

// Fallback event images
const FALLBACK_IMAGES = {
  'cb-1':'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'cb-2':'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
  'cb-3':'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=200&fit=crop',
  'kn-1':'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=200&fit=crop',
  'kn-2':'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
  'ar-1':'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=400&h=200&fit=crop',
  'ar-2':'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
  'al-1':'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop',
  'al-2':'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=200&fit=crop',
  'cy-1':'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
  'cy-2':'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=200&fit=crop',
  'gd-1':'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop',
  'gd-2':'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
  'gf-1':'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=200&fit=crop',
  'gf-2':'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=200&fit=crop',
  'tg-1':'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
  'tg-2':'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=200&fit=crop',
  'tk-1':'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
  'tk-2':'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
  'tk-3':'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop',
};

// Generic fallback images by index for real DB events without specific mapping
const GENERIC_IMAGES = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
];

// Image sequence
const TOTAL_FRAMES = 193;
const IMAGE_PATH = '/TechFestAbckground/ezgif-frame-';

const preloadBgImages = () => {
  const images = [];
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = `${IMAGE_PATH}${String(i).padStart(3, '0')}.jpg`;
    images.push(img);
  }
  return images;
};

// Build CLUBS array from API data (grouped by club), falling back to mock
const buildClubsFromApi = (grouped) => {
  return CLUB_ORDER.map(name => {
    const meta = CLUB_META[name] || {};
    const events = (grouped[name] || []).map((evt, idx) => ({
      id: evt._id || evt.id,
      title: evt.title,
      description: evt.description || '',
      date: evt.date,
      startTime: evt.startTime,
      endTime: evt.endTime,
      location: evt.location,
      participationType: evt.participationType,
      minTeamSize: evt.minTeamSize,
      maxTeamSize: evt.maxTeamSize,
      image: evt.image || GENERIC_IMAGES[idx % GENERIC_IMAGES.length],
    }));
    return { id: name.toLowerCase().replace(/\s+/g, '-'), name, events, ...meta };
  }); // Keep all clubs, even if they have 0 events currently
};

const Landing = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const navigate = useNavigate();
  const { isAuthenticated, isCoordinator, isAdmin, logout } = useAuth();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [sp, setSp] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [clubs, setClubs] = useState([]); // start empty, replace with real
  const [dataSource, setDataSource] = useState('mock'); // 'mock' | 'api'

  // Derived
  const NUM_PHASES = 1 + clubs.length;
  const CONTAINER_VH = NUM_PHASES * 150 + 100;

  // Fetch real events from backend
  useEffect(() => {
    getAllEvents()
      .then(res => {
        const grouped = res.data?.data || {};
        const built = buildClubsFromApi(grouped);
        // Always set clubs so club sections render (even with 0 events)
        setClubs(built);
        setDataSource('api');
      })
      .catch(() => {
        // Backend unreachable — still build club shells with empty events
        const built = buildClubsFromApi({});
        setClubs(built);
        setDataSource('mock');
      });
  }, []);

  // Preload bg images
  useEffect(() => {
    const images = preloadBgImages();
    imagesRef.current = images;
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      setBgProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
      if (loaded >= TOTAL_FRAMES) setBgLoaded(true);
    };
    images.forEach(img => {
      if (img.complete) onLoad();
      else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
    });
    return () => images.forEach(img => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onLoad); });
  }, []);

  // Draw frame
  const drawFrame = useCallback((progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1))));
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const { width: cw, height: ch } = canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const sw = img.naturalWidth * scale, sh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawFrame(sp); };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [sp, drawFrame]);

  // Typewriter
  useEffect(() => {
    const t = setTimeout(() => {
      setShowCursor(true);
      let i = 0;
      const iv = setInterval(() => {
        if (i <= TAGLINE.length) { setTypedText(TAGLINE.slice(0, i)); i++; }
        else { clearInterval(iv); setTimeout(() => setShowCursor(false), 2000); }
      }, 50);
      return () => clearInterval(iv);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Scroll listener
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => { setSp(v); drawFrame(v); });
    return () => unsub();
  }, [scrollYProgress, drawFrame]);

  useEffect(() => { if (bgLoaded) drawFrame(sp); }, [bgLoaded, drawFrame, sp]);

  // Phase calculations
  const rawPhase = sp * NUM_PHASES;
  const phase = Math.min(Math.floor(rawPhase), NUM_PHASES - 1);
  const pp = rawPhase - phase;

  const shrink = phase === 0 ? Math.max(0, Math.min(1, (pp - 0.4) / 0.6)) : 1;
  const eigenTop = `calc(${50 * (1 - shrink)}% + ${28 * shrink}px)`;
  const eigenLeft = `calc(${50 * (1 - shrink)}% + ${48 * shrink}px)`;
  const eigenTranslate = `translate(${-50 * (1 - shrink)}%, ${-50 * (1 - shrink)}%)`;
  const eigenFontSize = Math.max(28, Math.round(160 - shrink * 132));

  const taglineOp = phase === 0 ? Math.max(0, 1 - pp * 3) : 0;
  const ctaOp     = phase === 0 ? Math.max(0, 1 - pp * 3.5) : 0;
  const scrollOp  = phase === 0 ? Math.max(0, 1 - pp * 5) : 0;
  const navBarOp  = Math.min(1, Math.max(0, shrink - 0.5) * 2);

  const clubIdx = phase - 1;
  const club = clubIdx >= 0 && clubIdx < clubs.length ? clubs[clubIdx] : null;
  const clubFadeIn = Math.min(1, pp / 0.12);
  const clubNameP  = club ? Math.min(1, pp / 0.15) : 0;
  const clubTagP   = club ? Math.min(1, Math.max(0, (pp - 0.05) / 0.12)) : 0;
  const clubDescP  = club ? Math.min(1, Math.max(0, (pp - 0.08) / 0.12)) : 0;
  const eventsP    = club ? Math.min(1, Math.max(0, (pp - 0.15) / 0.15)) : 0;

  const handleEvtReg = (evt) => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    setSelectedEvent(evt); setShowRegister(true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

  const getEventImg = (evt, idx) => {
    if (!evt.image) return FALLBACK_IMAGES[evt.id] || GENERIC_IMAGES[idx % GENERIC_IMAGES.length];
    // If it's already a full URL (http/https), use directly
    if (evt.image.startsWith('http://') || evt.image.startsWith('https://')) return evt.image;
    // Backend stores as "public/temp/filename.png" — strip the "public/" prefix
    // and serve via the backend static server on port 3000
    const cleanPath = evt.image.replace(/^public[/\\]/, '').replace(/\\/g, '/');
    return `http://localhost:3000/${cleanPath}`;
  };

  return (
    <>
      <style>{`
        @keyframes scrollDot { 0%,100%{opacity:1;transform:translateY(0)} 50%{opacity:0;transform:translateY(8px)} }

        /* ---- Club content layout ---- */
        .e-content { padding: 90px 48px 32px; }
        .e-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          overflow-y: auto;
          max-height: calc(100vh - 240px);
          padding-right: 4px;
          padding-bottom: 8px;
          align-items: start;
        }
        .e-grid::-webkit-scrollbar{ width:4px; }
        .e-grid::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.2); border-radius:4px; }

        /* ---- Event card ---- */
        .e-card {
          background: rgba(8,8,18,0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .e-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        /* Shorter image container to ensure full card fits on screen */
        .e-img-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: rgba(0,0,0,0.4);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .e-img { width:100%; height:100%; object-fit:cover; display:block; position:absolute; inset:0; }
        /* A blurred background behind the contain image to fill empty space nicely */
        .e-img-bg { position: absolute; inset: -10%; width: 120%; height: 120%; object-fit: cover; filter: blur(15px); opacity: 0.5; z-index: 0; }
        .e-img-fg { position: relative; width:100%; height:100%; object-fit:contain; display:block; z-index: 1; }

        .e-fb  { width:100%; height:100%; display:flex; align-items:center; justify-content:center;
                  font-family:var(--font-display); font-size:36px; font-weight:900;
                  color:rgba(255,255,255,0.15); letter-spacing:-1px; position:absolute; inset:0; z-index: 2; }
        .e-body { padding: 16px; flex: 1; display:flex; flex-direction:column; min-height: fit-content; }
        .e-reg-btn {
          width:100%; padding:10px; border-radius:var(--radius-md);
          font-family:var(--font-display); font-size:12px; font-weight:600;
          letter-spacing:1px; text-transform:uppercase; color:white; cursor:pointer;
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14);
          transition: background 0.2s, border-color 0.2s;
        }
        .e-reg-btn:hover { background:rgba(255,255,255,0.16); border-color:rgba(255,255,255,0.28); }
        .e-admin-btns {
          display: flex; gap: 6px; margin-top: 6px;
        }
        .e-admin-btn {
          flex:1; padding:7px; border-radius:var(--radius-sm);
          font-family:var(--font-display); font-size:10px; font-weight:600;
          letter-spacing:0.5px; text-transform:uppercase; cursor:pointer;
          transition: background 0.2s, border-color 0.2s;
        }

        /* ---- Tablet ---- */
        @media (max-width:1024px){
          .e-content { padding: 76px 24px 24px; }
          .e-grid { grid-template-columns: repeat(2, 1fr); gap:14px; max-height:calc(100vh - 200px); }
          .e-img-wrap { height: 180px; }
        }
        /* ---- Mobile (≤640px) → 2 column grid ---- */
        @media (max-width:640px){
          .e-content { padding: 68px 12px 16px; }
          .e-grid { grid-template-columns: repeat(2, 1fr); gap:10px; max-height:calc(100vh - 180px); }
          .e-img-wrap { height: 140px; }
          .e-body { padding:10px; }
          .e-fb { font-size:24px; }
          .e-admin-btns { flex-direction: column; }
        }
        /* ---- Very small (≤360px) → 1 column ---- */
        @media (max-width:360px){
          .e-grid { grid-template-columns: 1fr; }
          .e-img-wrap { height: 200px; }
        }
      `}</style>

      {/* Loading screen */}
      {!bgLoaded && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999, background:'#06060b',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20,
        }}>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:'clamp(36px,8vw,56px)', fontWeight:900, letterSpacing:'-3px',
            background:'linear-gradient(135deg,#f5e6c8 0%,#e8b86d 35%,#c4863c 65%,#f5c778 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>EIGEN</div>
          <div style={{ width:200, height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ width:`${bgProgress}%`, height:'100%', background:'linear-gradient(90deg,#c4863c,#f5c778)', borderRadius:2, transition:'width 0.15s ease' }} />
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(245,199,120,0.45)', letterSpacing:'3px', textTransform:'uppercase' }}>
            Loading... {bgProgress}%
          </span>
        </div>
      )}

      <div ref={containerRef} style={{ position:'relative', height:`${CONTAINER_VH}vh` }}>
        <div style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden', background:'#06060b' }}>

          {/* BG canvas */}
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, zIndex:0, width:'100%', height:'100%', opacity: bgLoaded ? 1 : 0, transition:'opacity 0.8s ease' }} />

          {/* Dark vignette overlay */}
          <div style={{
            position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
            background: club
              ? 'radial-gradient(ellipse at center,rgba(6,6,11,0.48) 0%,rgba(6,6,11,0.76) 55%,rgba(6,6,11,0.93) 100%)'
              : 'radial-gradient(ellipse at center,rgba(6,6,11,0.08) 0%,rgba(6,6,11,0.42) 65%,rgba(6,6,11,0.68) 100%)',
            transition:'background 0.5s ease',
          }} />

          {/* ── NAVBAR ── */}
          <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, padding:'12px 16px', opacity:navBarOp, pointerEvents:navBarOp>0.3?'auto':'none' }}>
            <div style={{
              maxWidth:1400, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'flex-end',
              padding:'10px 20px', background:'rgba(6,6,11,0.65)',
              backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-xl)', minHeight:54,
            }}>
              <div style={{ flex:1 }} />
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                {isAuthenticated && (isCoordinator() || isAdmin()) && (
                  <button onClick={() => setShowAddEvent(true)} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)',
                    borderRadius:'var(--radius-md)', color:'white',
                    fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, cursor:'pointer', letterSpacing:'0.5px',
                  }}><Plus size={14}/>Add Event</button>
                )}
                {isAuthenticated && isAdmin() && (
                  <button onClick={() => navigate('/admin')} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:'var(--radius-md)', color:'white',
                    fontFamily:'var(--font-display)', fontSize:13, fontWeight:500, cursor:'pointer',
                  }}><LayoutDashboard size={14}/>Dashboard</button>
                )}
                {isAuthenticated ? (
                  <button onClick={() => { logout(); navigate('/'); }} style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    width:34, height:34, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.22)',
                    borderRadius:'var(--radius-sm)', cursor:'pointer', color:'#ef4444',
                  }}><LogOut size={14}/></button>
                ) : (
                  <button onClick={() => navigate('/auth')} className="glow-btn" style={{ padding:'7px 20px', fontSize:13, letterSpacing:'1px', textTransform:'uppercase' }}>Login</button>
                )}
              </div>
            </div>
          </div>

          {/* ── EIGEN LOGO — gold/amber gradient ── */}
          <div
            onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
            style={{
              position:'absolute', zIndex:25, top:eigenTop, left:eigenLeft, transform:eigenTranslate,
              fontSize:`${eigenFontSize}px`, fontFamily:'var(--font-display)', fontWeight:900,
              background:'linear-gradient(135deg,#f5e6c8 0%,#e8b86d 30%,#c4863c 60%,#f5c778 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              letterSpacing: shrink > 0.5 ? '-1px' : '-3px', lineHeight:1,
              userSelect:'none', cursor:'pointer', whiteSpace:'nowrap',
              filter: shrink < 0.4 ? 'drop-shadow(0 0 28px rgba(245,199,120,0.18))' : 'none',
            }}
          >EIGEN</div>

          {/* ── TAGLINE ── */}
          <div style={{ position:'absolute', top:'calc(50% + 80px)', left:'50%', transform:'translateX(-50%)', zIndex:5, opacity:taglineOp, pointerEvents:'none' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(11px,1.8vw,19px)', color:'rgba(255,255,255,0.72)', letterSpacing:'3px', textTransform:'uppercase', textAlign:'center', whiteSpace:'nowrap', textShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
              {typedText}{showCursor && <span className="typewriter-cursor"/>}
            </p>
          </div>

          {/* ── CTA ── */}
          {!isAuthenticated && (
            <div style={{ position:'absolute', top:'calc(50% + 140px)', left:'50%', transform:'translateX(-50%)', zIndex:5, opacity:ctaOp, pointerEvents:ctaOp>0.2?'auto':'none' }}>
              <button onClick={() => navigate('/auth')} className="glow-btn" style={{ padding:'13px 44px', fontSize:15, letterSpacing:'2px', textTransform:'uppercase' }}>
                Register / Login
              </button>
            </div>
          )}

          {/* ── SCROLL INDICATOR ── */}
          <div style={{ position:'absolute', bottom:34, left:'50%', transform:'translateX(-50%)', zIndex:5, opacity:scrollOp, display:'flex', flexDirection:'column', alignItems:'center', gap:8, pointerEvents:'none' }}>
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.35)', letterSpacing:'2px', textTransform:'uppercase' }}>Scroll to explore</span>
            <div style={{ width:18, height:28, border:'2px solid rgba(255,255,255,0.25)', borderRadius:9, display:'flex', justifyContent:'center', paddingTop:5 }}>
              <div style={{ width:3, height:7, background:'rgba(255,255,255,0.45)', borderRadius:2, animation:'scrollDot 1.5s ease-in-out infinite' }}/>
            </div>
          </div>

          {/* ── CLUB CONTENT ── */}
          {club && (
            <div className="e-content" style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', opacity:clubFadeIn, pointerEvents:clubFadeIn>0.3?'auto':'none' }}>

              {/* Header */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(11px,1.1vw,13px)', color:'rgba(255,255,255,0.45)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:5, opacity:clubNameP, transform:`translateY(${(1-clubNameP)*14}px)` }}>
                  {String(clubIdx+1).padStart(2,'0')} / {String(clubs.length).padStart(2,'0')}
                  {dataSource === 'api' && <span style={{ marginLeft:10, fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'2px' }}>LIVE</span>}
                </div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5.5vw,58px)', fontWeight:900, color:'white', letterSpacing:'-2px', lineHeight:1.1, marginBottom:4, transform:`translateY(${(1-clubNameP)*22}px)`, clipPath:`inset(0 ${(1-clubNameP)*100}% 0 0)`, textShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
                  {club.name}
                </h2>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(10px,1.1vw,13px)', color:'rgba(255,255,255,0.5)', letterSpacing:'2px', marginBottom:3, opacity:clubTagP, transform:`translateY(${(1-clubTagP)*14}px)` }}>
                  {club.tagline}
                </p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'clamp(11px,1vw,13px)', color:'rgba(255,255,255,0.35)', maxWidth:520, lineHeight:1.6, opacity:clubDescP, transform:`translateY(${(1-clubDescP)*10}px)` }}>
                  {club.description}
                </p>
              </div>

              {/* Divider */}
              <div style={{ height:1, maxWidth:380, background:'linear-gradient(90deg,rgba(255,255,255,0.2),transparent)', marginBottom:16, transform:`scaleX(${clubDescP})`, transformOrigin:'left' }}/>

              {/* Events grid — all appear together */}
              <div className="e-grid" style={{ opacity:eventsP, transform:`translateY(${(1-eventsP)*28}px)` }}>
                {club.events.length === 0 ? (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-mono)', fontSize:13, letterSpacing:'2px', textTransform:'uppercase', padding:'40px 0' }}>
                    No events yet — check back soon
                  </div>
                ) : club.events.map((evt, i) => {
                  const isTeam = evt.participationType === 'TEAM';
                  const imgSrc = getEventImg(evt, i);
                  return (
                    <div key={evt.id || i} className="e-card">
                      {/* Image — 9:16 aspect container */}
                      <div className="e-img-wrap">
                        {/* Background blurry crop to fill empty space nicely */}
                        <img src={imgSrc} alt="" className="e-img-bg" aria-hidden="true" />
                        {/* Foreground full image */}
                        <img src={imgSrc} alt={evt.title} className="e-img-fg" loading="lazy"
                          onError={e => { 
                            e.target.style.display='none'; 
                            e.target.previousSibling.style.display='none'; 
                            e.target.parentNode.querySelector('.e-fb').style.display='flex'; 
                          }}
                        />
                        <div className="e-fb" style={{ display:'none', background:club.gradient }}>{evt.title?.[0]}</div>
                      </div>

                      <div className="e-body">
                        {/* Accent line */}
                        <div style={{ width:'100%', height:2, marginBottom:9, background:club.gradient, opacity:0.45, borderRadius:1 }}/>

                        {/* Badge */}
                        <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 9px', borderRadius:14, marginBottom:9, background: isTeam?'rgba(255,255,255,0.05)':'rgba(16,185,129,0.08)', border:`1px solid ${isTeam?'rgba(255,255,255,0.1)':'rgba(16,185,129,0.18)'}` }}>
                          {isTeam ? <Users size={10} color="rgba(255,255,255,0.6)"/> : <UserIcon size={10} color="#10b981"/>}
                          <span style={{ fontSize:10, fontFamily:'var(--font-mono)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', color: isTeam?'rgba(255,255,255,0.6)':'#10b981' }}>
                            {isTeam ? `Team (${evt.minTeamSize}-${evt.maxTeamSize})` : 'Individual'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(13px,1.2vw,17px)', fontWeight:700, color:'white', marginBottom:5, letterSpacing:'-0.3px', lineHeight:1.2 }}>{evt.title}</h3>

                        {/* Desc */}
                        <p style={{ fontFamily:'var(--font-body)', fontSize:'clamp(11px,0.9vw,13px)', color:'rgba(255,255,255,0.45)', lineHeight:1.5, marginBottom:11, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{evt.description}</p>

                        {/* Meta */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 10px', marginBottom:11 }}>
                          {[
                            [Calendar, formatDate(evt.date)],
                            [Clock, `${evt.startTime}–${evt.endTime}`],
                            [MapPin, evt.location],
                          ].map(([Icon, txt], k) => txt && (
                            <span key={k} style={{ display:'flex', alignItems:'center', gap:3, fontSize:'clamp(10px,0.8vw,11px)', color:'rgba(255,255,255,0.35)', fontFamily:'var(--font-mono)' }}>
                              <Icon size={10}/>{txt}
                            </span>
                          ))}
                        </div>

                        {/* Spacer to push buttons to bottom */}
                        <div style={{ flex:1 }} />

                        {/* Register button — for regular users */}
                        <button className="e-reg-btn" onClick={() => handleEvtReg(evt)}>
                          Register Now
                        </button>

                        {/* Admin/Coordinator action buttons */}
                        {isAuthenticated && (isAdmin?.() || isCoordinator?.()) && (
                          <div className="e-admin-btns">
                            <button className="e-admin-btn" style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa' }}
                              onClick={(e) => { e.stopPropagation(); /* TODO: Edit event */ }}>
                              Edit
                            </button>
                            <button className="e-admin-btn" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.22)', color:'#f87171' }}
                              onClick={(e) => { e.stopPropagation(); /* TODO: Delete event */ }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ position:'absolute', bottom:0, left:0, height:3, zIndex:30, width:`${sp*100}%`, background:'linear-gradient(90deg,#c4863c,#f5c778)', transition:'width 0.05s linear' }}/>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding:'70px 24px 36px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)', background:'#06060b' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:900, background:'linear-gradient(135deg,#f5e6c8,#c4863c,#f5c778)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:10 }}>EIGEN</div>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,0.25)', letterSpacing:'2px', textTransform:'uppercase' }}>IIIT KOTA COLLEGE FEST 2026</p>
      </footer>

      <AddEventModal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)}/>
      <RegisterEventModal isOpen={showRegister} onClose={() => { setShowRegister(false); setSelectedEvent(null); }} event={selectedEvent}/>
    </>
  );
};

export default Landing;
