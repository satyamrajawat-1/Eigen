import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, Users, CalendarDays, Activity, 
  Flame, BarChart3 
} from 'lucide-react';

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
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
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

const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, ${color}, transparent)`,
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {label}
      </span>
    </div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: '36px',
      fontWeight: 800,
      color: 'var(--text-primary)',
      letterSpacing: '-1px',
    }}>
      {value}{suffix}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const CHART_COLORS = ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#a855f7', '#22c55e', '#f97316'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}>
                Admin Dashboard
              </h1>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                EIGEN 2026 Analytics
              </p>
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #c084fc, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            EIGEN
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatCard icon={CalendarDays} label="Total Events" value={overviewStats.totalEvents} color="#7c3aed" delay={0.1} />
          <StatCard icon={Users} label="Registrations" value={overviewStats.totalRegistrations} color="#3b82f6" delay={0.15} />
          <StatCard icon={Activity} label="Active Users" value={overviewStats.activeUsers} color="#10b981" delay={0.2} />
          <StatCard icon={TrendingUp} label="Attendance Rate" value={overviewStats.attendanceRate} suffix="%" color="#f59e0b" delay={0.25} />
        </div>

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Bar Chart: Participation per Event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <BarChart3 size={18} color="var(--accent-primary)" />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Participation per Event
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participationByEvent} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis 
                  dataKey="event" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="registrations" fill="#7c3aed" name="Registrations" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" fill="#3b82f6" name="Attended" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart: RSVP vs Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Activity size={18} color="var(--accent-primary)" />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                RSVP vs Actual Attendance
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rsvpVsAttendance}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {rsvpVsAttendance.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
              {rsvpVsAttendance.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color }} />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Second row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Line Chart: Peak Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <TrendingUp size={18} color="var(--accent-primary)" />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Peak Participation Times
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={peakParticipationTimes}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#7c3aed" fill="url(#userGradient)" strokeWidth={2} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Trending Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Flame size={18} color="#ef4444" />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Trending Events
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {trendingEvents.map((event, i) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Rank */}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: i < 3 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    width: '30px',
                    textAlign: 'center',
                  }}>
                    {i + 1}
                  </span>

                  {/* Name + bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {event.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {event.hot && <Flame size={12} color="#ef4444" />}
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: 600,
                        }}>
                          {event.trend}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(event.interest / trendingEvents[0].interest) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, var(--accent-primary), ${i < 3 ? 'var(--accent-pink)' : 'var(--accent-blue)'})`,
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Count */}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    minWidth: '40px',
                    textAlign: 'right',
                  }}>
                    {event.interest}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Club Participation Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Users size={18} color="var(--accent-primary)" />
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              Club-wise Participation
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clubParticipation}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="club" 
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                angle={-25}
                textAnchor="end"
                height={70}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="participants" name="Participants" radius={[6, 6, 0, 0]}>
                {clubParticipation.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
