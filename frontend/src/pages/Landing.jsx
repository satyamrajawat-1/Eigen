import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAllEvents, deleteEvent } from '../lib/api';
import AddEventModal from '../components/AddEventModal';
import RegisterEventModal from '../components/RegisterEventModal';
import FestPassModal from '../components/FestPassModal';
import { Calendar, Clock, MapPin, Users, User as UserIcon, Plus, LogOut, LayoutDashboard, Edit3, Trash2, Ticket } from 'lucide-react';

const TAGLINE = 'Where Innovation Meets Celebration';

// Club metadata (colors, gradients, taglines — UI-only, not stored in DB)
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

// Generic fallback images for events without backend images
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

// Build CLUBS array from API data (grouped by club)
const buildClubsFromApi = (grouped) => {
  return CLUB_ORDER.map(name => {
    const meta = CLUB_META[name] || {};
    const events = (grouped[name] || []).map((evt, idx) => ({
      id: evt._id || evt.id,
      _id: evt._id,
      title: evt.title,
      description: evt.description || '',
      date: evt.date,
      startTime: evt.startTime,
      endTime: evt.endTime,
      location: evt.location,
      participationType: evt.participationType,
      minTeamSize: evt.minTeamSize,
      maxTeamSize: evt.maxTeamSize,
      clubName: evt.clubName || name,
      image: evt.image || GENERIC_IMAGES[idx % GENERIC_IMAGES.length],
    }));
    return { id: name.toLowerCase().replace(/\s+/g, '-'), name, events, ...meta };
  });
};

const Landing = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const navigate = useNavigate();
  const { user, isAuthenticated, isCoordinator, isAdmin, isParticipant, getUserClubs, logout } = useAuth();
  const toast = useToast();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [sp, setSp] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [clubs, setClubs] = useState([]);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [showFestPass, setShowFestPass] = useState(false);

  // Derived
  const NUM_PHASES = 1 + clubs.length;
  const CONTAINER_VH = NUM_PHASES * 150 + 100;

  // Determine user role for RBAC
  const userIsAdmin = isAuthenticated && isAdmin();
  const userIsCoordinator = isAuthenticated && isCoordinator();
  const userIsParticipant = isAuthenticated && !userIsAdmin && !userIsCoordinator;
  const userClubs = getUserClubs();

  // Check if the user can manage (edit/delete) events for a given club
  const canManageClub = (clubName) => {
    if (userIsAdmin) return true;
    if (userIsCoordinator && userClubs.includes(clubName)) return true;
    return false;
  };

  // Check if user should see the Register button for an event
  const canRegister = (evt) => {
    // Admin never registers
    if (userIsAdmin) return false;
    // Coordinator never registers for their own club's events
    if (userIsCoordinator && userClubs.includes(evt.clubName)) return false;
    // Everyone else (participants, non-auth users) can register
    return true;
  };

  // Fetch real events from backend
  const fetchEvents = useCallback(() => {
    getAllEvents()
      .then(res => {
        const grouped = res.data?.data || {};
        const built = buildClubsFromApi(grouped);
        setClubs(built);
        // Only show toast on initial load if we want — skip for cleanliness
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Failed to fetch events. Backend may be offline.';
        toast.error(msg);
        // Build club shells with empty events
        const built = buildClubsFromApi({});
        setClubs(built);
      });
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    setSelectedEvent(evt);
    setShowRegister(true);
  };

  const handleEditEvent = (evt) => {
    setEditingEvent(evt);
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (evt) => {
    const eventId = evt._id || evt.id;
    if (!eventId) return;
    setDeletingEventId(eventId);

    try {
      const res = await deleteEvent(eventId);
      const msg = res.data?.message || 'Event deleted successfully!';
      toast.success(msg);
      // Remove from local state
      setClubs(prevClubs => {
        return prevClubs.map(c => ({
          ...c,
          events: c.events.filter(e => (e._id || e.id) !== eventId),
        }));
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete event.';
      toast.error(msg);
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEventAdded = (newEvent, isEdit = false) => {
    if (isEdit) {
      // Refresh from backend to get fresh data
      fetchEvents();
    } else {
      setClubs(prevClubs => {
        const newClubs = [...prevClubs];
        const clubIndex = newClubs.findIndex(c => c.name === newEvent.clubName);
        if (clubIndex !== -1) {
          newClubs[clubIndex] = {
            ...newClubs[clubIndex],
            events: [...newClubs[clubIndex].events, {
              id: newEvent._id,
              _id: newEvent._id,
              title: newEvent.title,
              description: newEvent.description,
              date: newEvent.date,
              startTime: newEvent.startTime,
              endTime: newEvent.endTime,
              location: newEvent.location,
              participationType: newEvent.participationType,
              minTeamSize: newEvent.minTeamSize,
              maxTeamSize: newEvent.maxTeamSize,
              clubName: newEvent.clubName,
              image: newEvent.image,
            }],
          };
        }
        return newClubs;
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('../lib/api');
      const res = await logoutUser();
      const msg = res.data?.message || 'Logged out successfully';
      toast.success(msg);
    } catch (err) {
      // Even if API fails, log out locally
      toast.info('Logged out locally.');
    }
    logout();
    navigate('/');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

  const getEventImg = (evt, idx) => {
    if (!evt.image) return GENERIC_IMAGES[idx % GENERIC_IMAGES.length];
    if (evt.image.startsWith('http://') || evt.image.startsWith('https://')) return evt.image;
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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-auto-rows: min-content;
          gap: 24px;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: calc(100vh - 200px);
          padding-right: 8px;
          padding-bottom: 32px;
          align-items: stretch;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        .e-grid::-webkit-scrollbar { 
          display: none; /* Chrome, Safari and Opera */
        }

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
          height: 100%;
          position: relative;
        }
        .e-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          z-index: 10;
        }
        .e-img-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          min-height: 200px;
          overflow: hidden;
          background: rgba(0,0,0,0.4);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .e-img { width:100%; height:100%; object-fit:cover; display:block; position:absolute; inset:0; }
        .e-img-bg { position: absolute; inset: -10%; width: 120%; height: 120%; object-fit: cover; filter: blur(15px); opacity: 0.5; z-index: 0; }
        .e-img-fg { position: relative; width:100%; height:100%; object-fit:contain; display:block; z-index: 1; }
        .e-fb  { width:100%; height:100%; display:flex; align-items:center; justify-content:center;
                  font-family:var(--font-display); font-size:36px; font-weight:900;
                  color:rgba(255,255,255,0.15); letter-spacing:-1px; position:absolute; inset:0; z-index: 2; }
        .e-body { padding: 18px; flex: 1; display:flex; flex-direction:column; justify-content: space-between; }
        .e-reg-btn {
          width:100%; padding:10px; border-radius:var(--radius-md);
          font-family:var(--font-display); font-size:12px; font-weight:600;
          letter-spacing:1px; text-transform:uppercase; color:white; cursor:pointer;
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14);
          transition: background 0.2s, border-color 0.2s;
          margin-top: auto;
        }
        .e-reg-btn:hover { background:rgba(255,255,255,0.16); border-color:rgba(255,255,255,0.28); }
        .e-manage-btns {
          display: flex; gap: 8px; margin-top: auto; padding-top: 12px;
        }
        .e-manage-btn {
          flex:1; padding:8px; border-radius:var(--radius-sm);
          font-family:var(--font-display); font-size:11px; font-weight:600;
          letter-spacing:0.5px; text-transform:uppercase; cursor:pointer;
          transition: background 0.2s, border-color 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 5px;

        }
        .e-edit-btn {
          background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); color: #93c5fd;
        }
        .e-edit-btn:hover { background: rgba(59,130,246,0.22); border-color: rgba(59,130,246,0.4); }
        .e-delete-btn {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5;
        }
        .e-delete-btn:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.35); }

        /* ---- Tablet ---- */
        @media (max-width:1024px){
          .e-content { padding: 76px 24px 24px; }
          .e-grid { grid-template-columns: repeat(2, 1fr); gap:14px; max-height:calc(100vh - 200px); }
          .e-img-wrap { height: 180px; }
        }
        /* ---- Mobile ---- */
        @media (max-width:640px){
          .e-content { padding: 68px 12px 16px; }
          .e-grid { grid-template-columns: repeat(2, 1fr); gap:10px; max-height:calc(100vh - 180px); }
          .e-img-wrap { height: 140px; }
          .e-body { padding:10px; }
          .e-fb { font-size:24px; }
          .e-manage-btns { flex-direction: column; }
        }
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
                {/* Add Event — ADMIN or COORDINATOR only */}
                {isAuthenticated && (userIsAdmin || userIsCoordinator) && (
                  <button onClick={() => { setEditingEvent(null); setShowAddEvent(true); }} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)',
                    borderRadius:'var(--radius-md)', color:'white',
                    fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, cursor:'pointer', letterSpacing:'0.5px',
                  }}><Plus size={14}/>Add Event</button>
                )}
                {/* Dashboard — ADMIN or COORDINATOR */}
                {isAuthenticated && (userIsAdmin || userIsCoordinator) && (
                  <button onClick={() => navigate('/dashboard')} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:'var(--radius-md)', color:'white',
                    fontFamily:'var(--font-display)', fontSize:13, fontWeight:500, cursor:'pointer',
                  }}><LayoutDashboard size={14}/>Dashboard</button>
                )}
                {/* Fest Pass — STUDENT or OUTSIDE_STUDENT only */}
                {isAuthenticated && isParticipant() && (
                  <button onClick={() => setShowFestPass(true)} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    background:'linear-gradient(135deg, rgba(196,134,60,0.15), rgba(245,199,120,0.1))',
                    border:'1px solid rgba(245,199,120,0.25)',
                    borderRadius:'var(--radius-md)', color:'#f5c778',
                    fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, cursor:'pointer', letterSpacing:'0.5px',
                    transition:'all 0.3s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,134,60,0.25), rgba(245,199,120,0.18))'; e.currentTarget.style.borderColor = 'rgba(245,199,120,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,134,60,0.15), rgba(245,199,120,0.1))'; e.currentTarget.style.borderColor = 'rgba(245,199,120,0.25)'; }}
                  ><Ticket size={14}/>Fest Pass</button>
                )}
                {isAuthenticated ? (
                  <button onClick={handleLogout} style={{
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

          {/* ── EIGEN LOGO ── */}
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
                  <span style={{ marginLeft:10, fontSize:10, color:'rgba(59,130,246,0.5)', letterSpacing:'2px' }}>LIVE</span>
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

              {/* Events grid */}
              <div className="e-grid" style={{ opacity:eventsP, transform:`translateY(${(1-eventsP)*28}px)` }}>
                {club.events.length === 0 ? (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-mono)', fontSize:13, letterSpacing:'2px', textTransform:'uppercase', padding:'40px 0' }}>
                    No events yet — check back soon
                  </div>
                ) : club.events.map((evt, i) => {
                  const isTeam = evt.participationType === 'TEAM';
                  const imgSrc = getEventImg(evt, i);
                  const showManage = canManageClub(club.name);
                  const showReg = canRegister(evt);
                  const isDeleting = deletingEventId === (evt._id || evt.id);

                  return (
                    <div key={evt.id || i} className="e-card">
                      {/* Image */}
                      <div className="e-img-wrap">
                        <img src={imgSrc} alt="" className="e-img-bg" aria-hidden="true" />
                        <img src={imgSrc} alt={evt.title} className="e-img-fg" loading="lazy"
                          onError={e => {
                            e.target.style.display='none';
                            e.target.previousSibling.style.display='none';
                            const fb = e.target.parentElement.querySelector('.e-fb');
                            if(fb) fb.style.display = 'flex';
                          }}
                        />
                        <div className="e-fb" style={{display:'none'}}>{club.name.split(' ').map(w=>w[0]).join('')}</div>
                      </div>
                      <div className="e-body">
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                          <span style={{
                            padding:'3px 8px', borderRadius:'var(--radius-sm)',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontFamily:'var(--font-mono)', fontSize:10, fontWeight:500, color:'rgba(255,255,255,0.6)',
                            whiteSpace:'nowrap',
                          }}>{club.name}</span>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>
                            {formatDate(evt.date)}
                          </span>
                        </div>
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, color:'white', marginBottom:4, lineHeight:1.3, flex:1 }}>
                          {evt.title}
                        </h3>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.4)', fontSize:11 }}>
                            <Clock size={11}/> {evt.startTime}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.4)', fontSize:11 }}>
                            {isTeam ? <Users size={11}/> : <UserIcon size={11}/>}
                            {isTeam ? `${evt.minTeamSize}-${evt.maxTeamSize} members` : 'Individual'}
                          </div>
                        </div>

                        {/* RBAC: Register button — only for participants / unauthenticated */}
                        {showReg && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEvtReg(evt); }}
                            className="e-reg-btn"
                          >
                            Register
                          </button>
                        )}

                        {/* RBAC: Edit & Delete buttons — only for admin/coordinator of this club */}
                        {showManage && (
                          <div className="e-manage-btns">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditEvent(evt); }}
                              className="e-manage-btn e-edit-btn"
                            >
                              <Edit3 size={12}/> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt); }}
                              className="e-manage-btn e-delete-btn"
                              disabled={isDeleting}
                              style={{ opacity: isDeleting ? 0.5 : 1 }}
                            >
                              <Trash2 size={12}/> {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ position:'absolute', bottom:0, left:0, height:3, zIndex:30, width:`${sp*100}%`, background:'linear-gradient(90deg,#c4863c,#f5c778)', transition:'width 0.05s linear' }}/>
        </div>
      </div>

      {showAddEvent && (
        <AddEventModal
          isOpen={showAddEvent}
          onClose={() => { setShowAddEvent(false); setEditingEvent(null); }}
          onEventAdded={handleEventAdded}
          editEvent={editingEvent}
        />
      )}
      {showRegister && selectedEvent && (
        <RegisterEventModal
          isOpen={showRegister}
          onClose={() => { setShowRegister(false); setSelectedEvent(null); }}
          event={selectedEvent}
        />
      )}
      <FestPassModal
        isOpen={showFestPass}
        onClose={() => setShowFestPass(false)}
      />
    </>
  );
};

export default Landing;
