import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  ArrowLeft, TrendingUp, Users, CalendarDays, Activity,
  BarChart3, Loader2, AlertTriangle, MapPin, Clock,
  Edit3, Trash2,
} from 'lucide-react';
import { getAllEvents, getMyClubEvents, deleteEvent } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AddEventModal from '../components/AddEventModal';

/* ───── Tooltip ───── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13,13,21,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'white', fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: entry.color, margin: '2px 0' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

/* ───── Stat Card ───── */
const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
      background: `linear-gradient(90deg, ${color}, transparent)`,
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px',
      }}>
        {label}
      </span>
    </div>
    <div style={{
      fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800,
      color: 'white', letterSpacing: '-1px',
    }}>
      {value}{suffix}
    </div>
  </motion.div>
);

/* ───── Chart Colors ───── */
const CHART_COLORS = ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#a855f7', '#22c55e'];

const CLUB_ORDER = ['CODEBASE', 'KERNEL', 'ARC ROBOTICS', 'ALGORITHMUS', 'CYPHER', 'GDF', 'GFG', 'TGCC', 'TECHKNOW'];

/* ═══════════════════════════════════════════ */
/*  DASHBOARD (ADMIN + COORDINATOR)            */
/* ═══════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isCoordinator, getUserClubs } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [clubData, setClubData] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const userIsAdmin = isAdmin();
  const userIsCoordinator = isCoordinator();
  const userClubs = getUserClubs();

  /* ── Fetch data ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let grouped = {};

      if (userIsAdmin) {
        // Admin sees ALL events
        const res = await getAllEvents();
        grouped = res.data?.data || {};
      } else if (userIsCoordinator) {
        // Coordinator sees only their club events
        const res = await getMyClubEvents();
        const events = res.data?.data || [];
        // Group by club name for consistency
        events.forEach(evt => {
          if (!grouped[evt.clubName]) grouped[evt.clubName] = [];
          grouped[evt.clubName].push(evt);
        });
      }

      setClubData(grouped);

      // Flatten all events
      const flat = [];
      Object.entries(grouped).forEach(([clubName, events]) => {
        events.forEach(evt => flat.push({ ...evt, clubName }));
      });
      setAllEvents(flat);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load dashboard data. Make sure the backend is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [userIsAdmin, userIsCoordinator]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Delete event ── */
  const handleDelete = async (evt) => {
    const eventId = evt._id || evt.id;
    if (!eventId) return;
    setDeletingId(eventId);
    try {
      const res = await deleteEvent(eventId);
      const msg = res.data?.message || 'Event deleted successfully!';
      toast.success(msg);
      // Remove from local state
      setAllEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
      setClubData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(club => {
          updated[club] = updated[club].filter(e => (e._id || e.id) !== eventId);
        });
        return updated;
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete event.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Edit event ── */
  const handleEdit = (evt) => {
    setEditingEvent(evt);
    setShowEditModal(true);
  };

  const handleEventUpdated = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    fetchData(); // Re-fetch from backend
  };

  /* ── Computed stats ── */
  const totalEvents = allEvents.length;
  const displayClubs = userIsAdmin ? CLUB_ORDER : userClubs;
  const totalClubsWithEvents = Object.values(clubData).filter(arr => arr.length > 0).length;
  const teamEvents = allEvents.filter(e => e.participationType === 'TEAM').length;
  const individualEvents = allEvents.filter(e => e.participationType !== 'TEAM').length;

  // Events per club chart data
  const chartClubs = userIsAdmin ? CLUB_ORDER : userClubs;
  const clubChartData = chartClubs.map((club, i) => ({
    club: club.length > 8 ? club.slice(0, 7) + '…' : club,
    fullName: club,
    events: (clubData[club] || []).length,
    color: CHART_COLORS[CLUB_ORDER.indexOf(club) % CHART_COLORS.length],
  }));

  // Participation type pie
  const participationPie = [
    { name: 'Individual', value: individualEvents || 0, color: '#3b82f6' },
    { name: 'Team', value: teamEvents || 0, color: '#ec4899' },
  ].filter(d => d.value > 0);

  // Events timeline (by month)
  const monthMap = {};
  allEvents.forEach(evt => {
    if (evt.date) {
      const d = new Date(evt.date);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
  });
  const timelineData = Object.entries(monthMap).map(([month, count]) => ({ month, events: count }));

  // Upcoming events (sorted by date, future first)
  const now = new Date();
  const upcomingEvents = [...allEvents]
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const dashboardTitle = userIsAdmin ? 'Admin Dashboard' : 'Coordinator Dashboard';
  const dashboardSubtitle = userIsAdmin
    ? `EIGEN 2026 • ${user?.name || 'Admin'}`
    : `${userClubs.join(', ')} • ${user?.name || 'Coordinator'}`;

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#06060b',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <Loader2 size={36} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Loading Dashboard…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#06060b',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <AlertTriangle size={36} color="#ef4444" />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#f87171', textAlign: 'center', maxWidth: 400 }}>
          {error}
        </p>
        <button
          onClick={() => fetchData()}
          style={{
            padding: '10px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: 'white', fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={{ minHeight: '100vh', background: '#06060b', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '40px', flexWrap: 'wrap', gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800,
                color: 'white', letterSpacing: '-0.5px',
              }}>
                {dashboardTitle}
              </h1>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                {dashboardSubtitle}
              </p>
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900,
            background: 'linear-gradient(135deg, #f5e6c8, #c4863c, #f5c778)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            EIGEN
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px', marginBottom: '32px',
        }}>
          <StatCard icon={CalendarDays} label="Total Events" value={totalEvents} color="#7c3aed" delay={0.1} />
          <StatCard icon={Users} label={userIsAdmin ? "Active Clubs" : "Your Clubs"} value={userIsAdmin ? totalClubsWithEvents : userClubs.length} color="#3b82f6" delay={0.15} />
          <StatCard icon={Activity} label="Team Events" value={teamEvents} color="#10b981" delay={0.2} />
          <StatCard icon={TrendingUp} label="Solo Events" value={individualEvents} color="#f59e0b" delay={0.25} />
        </div>

        {/* Charts Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px', marginBottom: '32px',
        }}>

          {/* Bar Chart: Events per Club */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <BarChart3 size={18} color="#7c3aed" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'white' }}>
                Events per Club
              </h3>
            </div>
            {totalEvents > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clubChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="club"
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    angle={-25} textAnchor="end" height={70}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="events" name="Events" radius={[6, 6, 0, 0]}>
                    {clubChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '2px' }}>
                NO EVENTS YET
              </div>
            )}
          </motion.div>

          {/* Pie Chart: Participation Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Activity size={18} color="#7c3aed" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'white' }}>
                Event Types
              </h3>
            </div>
            {participationPie.length > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={participationPie} cx="50%" cy="50%"
                        innerRadius={70} outerRadius={110}
                        paddingAngle={4} dataKey="value" stroke="none"
                      >
                        {participationPie.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
                  {participationPie.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color }} />
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '2px' }}>
                NO DATA
              </div>
            )}
          </motion.div>
        </div>

        {/* Timeline Chart */}
        {timelineData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
              padding: '28px', marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <TrendingUp size={18} color="#7c3aed" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'white' }}>
                Events Timeline
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="events" stroke="#7c3aed" fill="url(#areaGrad)" strokeWidth={2} name="Events" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Events Table with Edit/Delete Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{
            background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
            padding: '28px', marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <CalendarDays size={18} color="#7c3aed" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'white' }}>
              {upcomingEvents.length > 0 ? 'Upcoming Events' : 'All Events'}
            </h3>
            <span style={{
              marginLeft: '8px', padding: '2px 10px', borderRadius: '10px',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#a78bfa',
            }}>
              {upcomingEvents.length > 0 ? upcomingEvents.length : allEvents.length}
            </span>
          </div>

          {(upcomingEvents.length > 0 ? upcomingEvents : allEvents.slice(0, 10)).length === 0 ? (
            <div style={{
              padding: '48px 0', textAlign: 'center',
              color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)',
              fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              No events created yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(upcomingEvents.length > 0 ? upcomingEvents : allEvents.slice(0, 10)).map((evt, i) => {
                const eventId = evt._id || evt.id;
                const isDeleting = deletingId === eventId;
                const clubIndex = CLUB_ORDER.indexOf(evt.clubName);
                const color = CHART_COLORS[clubIndex >= 0 ? clubIndex % CHART_COLORS.length : 0];

                return (
                  <motion.div
                    key={eventId || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px 18px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    {/* Club badge */}
                    <div style={{
                      minWidth: '100px', padding: '5px 12px', borderRadius: '8px',
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                      color: color,
                      letterSpacing: '0.5px', textAlign: 'center', textTransform: 'uppercase',
                    }}>
                      {evt.clubName}
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600,
                        color: 'white', marginBottom: '4px',
                      }}>
                        {evt.title}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>
                          <CalendarDays size={10} />{formatDate(evt.date)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>
                          <Clock size={10} />{evt.startTime}–{evt.endTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>
                          <MapPin size={10} />{evt.location}
                        </span>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{
                      padding: '4px 12px', borderRadius: '8px',
                      background: evt.participationType === 'TEAM' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)',
                      border: `1px solid ${evt.participationType === 'TEAM' ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)'}`,
                      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                      color: evt.participationType === 'TEAM' ? '#ec4899' : '#3b82f6',
                      letterSpacing: '1px',
                    }}>
                      {evt.participationType === 'TEAM' ? `TEAM ${evt.minTeamSize}-${evt.maxTeamSize}` : 'SOLO'}
                    </div>

                    {/* Edit & Delete Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleEdit(evt)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px',
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          borderRadius: '8px', cursor: 'pointer',
                          color: '#93c5fd', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                        title="Edit Event"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(evt)}
                        disabled={isDeleting}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '8px', cursor: isDeleting ? 'not-allowed' : 'pointer',
                          color: '#fca5a5', transition: 'all 0.2s ease',
                          opacity: isDeleting ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <AddEventModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingEvent(null); }}
          onEventAdded={handleEventUpdated}
          editEvent={editingEvent}
        />
      )}
    </div>
  );
};

export default Dashboard;
