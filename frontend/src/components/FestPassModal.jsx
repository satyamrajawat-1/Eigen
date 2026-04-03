import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Ticket, AlertTriangle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FestPassModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const toast = useToast();
  const qrRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  if (!user) return null;

  const qrValue = user.qrCodeIdentifier;
  const userName = user.name || 'PARTICIPANT';
  const userEmail = user.email || '';
  const userRole = user.roles?.includes('OUTSIDE_STUDENT') ? 'OUTSIDE STUDENT' : 'STUDENT';

  const handleDownloadPDF = async () => {
    setGenerating(true);
    toast.info('Generating your Fest Pass PDF…');

    try {
      // Grab the QR canvas element directly from the DOM
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (!qrCanvas) {
        toast.error('QR code not found. Please try again.');
        setGenerating(false);
        return;
      }
      const qrImgData = qrCanvas.toDataURL('image/png');

      const W = 105; // A6 width mm
      const H = 148; // A6 height mm
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, H] });
      const cx = W / 2; // center X

      // ── Background ──
      pdf.setFillColor(6, 6, 11);
      pdf.rect(0, 0, W, H, 'F');

      // ── Gold top border ──
      pdf.setFillColor(196, 134, 60);
      pdf.rect(0, 0, W, 1.5, 'F');

      // ── Inner card background ──
      pdf.setFillColor(14, 14, 24);
      pdf.roundedRect(8, 10, W - 16, H - 20, 4, 4, 'F');

      // ── Gold card border ──
      pdf.setDrawColor(196, 134, 60);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(8, 10, W - 16, H - 20, 4, 4, 'S');

      // ── EIGEN title ──
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(232, 184, 109);
      pdf.text('EIGEN', cx, 28, { align: 'center' });

      // ── Subtitle ──
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(196, 134, 60);
      pdf.text('IIIT KOTA  \u2022  COLLEGE FEST 2026', cx, 34, { align: 'center' });

      // ── Separator line ──
      pdf.setDrawColor(196, 134, 60);
      pdf.setLineWidth(0.15);
      const sepY = 39;
      pdf.line(20, sepY, 38, sepY);
      pdf.setFontSize(6);
      pdf.setTextColor(160, 120, 60);
      pdf.text('FEST PASS', cx, sepY + 0.5, { align: 'center' });
      pdf.line(W - 38, sepY, W - 20, sepY);

      // ── User name ──
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text(userName, cx, 50, { align: 'center' });

      // ── User email ──
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 160);
      pdf.text(userEmail, cx, 56, { align: 'center' });

      // ── Role badge ──
      const badgeW = pdf.getTextWidth(userRole) + 10;
      pdf.setFillColor(40, 32, 18);
      pdf.setDrawColor(196, 134, 60);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(cx - badgeW / 2, 59, badgeW, 6, 2, 2, 'FD');
      pdf.setFontSize(6);
      pdf.setTextColor(245, 199, 120);
      pdf.text(userRole, cx, 63, { align: 'center' });

      // ── QR Code ──
      const qrSize = 42;
      const qrX = cx - qrSize / 2;
      const qrY = 70;
      // White bg for QR
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, 'F');
      // QR image
      pdf.addImage(qrImgData, 'PNG', qrX, qrY, qrSize, qrSize);

      // ── Scan instruction ──
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.5);
      pdf.setTextColor(100, 100, 110);
      pdf.text('SCAN AT ENTRY  \u2022  ' + qrValue.slice(0, 8).toUpperCase() + '\u2026', cx, qrY + qrSize + 8, { align: 'center' });

      // ── Gold bottom border ──
      pdf.setFillColor(196, 134, 60);
      pdf.rect(0, H - 1.5, W, 1.5, 'F');

      // ── Footer ──
      pdf.setFontSize(5);
      pdf.setTextColor(80, 80, 90);
      pdf.text('This pass is non-transferable. Present at venue entry.', cx, H - 4, { align: 'center' });

      pdf.save('Eigen_Fest_Pass.pdf');
      toast.success('Fest Pass downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

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
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '400px',
              background: 'rgba(13, 13, 21, 0.97)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Ticket size={20} color="#f5c778" />
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700,
                  color: 'white', margin: 0,
                }}>
                  Your Fest Pass
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Pass Content */}
            <div style={{ padding: '0 24px 24px' }}>
              {/* The Pass Card */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(20,20,35,0.95), rgba(10,10,18,0.98))',
                border: '1px solid rgba(245,199,120,0.15)',
                borderRadius: '16px',
                padding: '28px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative corner accents */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #c4863c, #f5c778, #e8b86d, #c4863c)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #c4863c, #f5c778, #e8b86d, #c4863c)',
                  opacity: 0.5,
                }} />

                {/* EIGEN Branding */}
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900,
                    background: 'linear-gradient(135deg, #f5e6c8 0%, #e8b86d 30%, #c4863c 60%, #f5c778 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    letterSpacing: '-1px', lineHeight: 1,
                  }}>
                    EIGEN
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: 'rgba(245,199,120,0.5)', letterSpacing: '4px',
                    textTransform: 'uppercase', marginTop: 4,
                  }}>
                    IIIT KOTA • COLLEGE FEST 2026
                  </div>
                </div>

                {/* Separator */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0',
                }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(245,199,120,0.12)' }} />
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '8px',
                    color: 'rgba(245,199,120,0.35)', letterSpacing: '3px',
                  }}>
                    FEST PASS
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(245,199,120,0.12)' }} />
                </div>

                {/* User Info */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700,
                    color: 'white', letterSpacing: '-0.3px', marginBottom: 4,
                  }}>
                    {userName}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px',
                  }}>
                    {userEmail}
                  </div>
                  <div style={{
                    display: 'inline-block', marginTop: 8,
                    padding: '3px 14px', borderRadius: '12px',
                    background: 'rgba(245,199,120,0.1)', border: '1px solid rgba(245,199,120,0.2)',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
                    color: '#f5c778', letterSpacing: '2px', textTransform: 'uppercase',
                  }}>
                    {userRole}
                  </div>
                </div>

                {/* QR Code */}
                {qrValue ? (
                  <div ref={qrRef} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      padding: 14, background: 'white', borderRadius: '12px',
                      display: 'inline-flex',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}>
                      <QRCodeCanvas
                        value={qrValue}
                        size={160}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#0d0d15"
                      />
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '8px',
                      color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}>
                      SCAN AT ENTRY • {qrValue.slice(0, 8).toUpperCase()}…
                    </div>
                  </div>
                ) : (
                  /* Fallback: No QR code available */
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 12, padding: '24px 0',
                  }}>
                    <AlertTriangle size={32} color="#f59e0b" />
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6,
                      maxWidth: 240,
                    }}>
                      Your QR code is not available yet. Please contact the registration desk or try logging in again.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button (outside the captured area for cleaner PDF) */}
            {qrValue && (
              <div style={{ padding: '0 24px 24px' }}>
                <button
                  onClick={handleDownloadPDF}
                  disabled={generating}
                  style={{
                    width: '100%', padding: '14px',
                    background: generating
                      ? 'rgba(245,199,120,0.08)'
                      : 'linear-gradient(135deg, #c4863c, #e8b86d)',
                    border: 'none', borderRadius: '12px',
                    color: generating ? 'rgba(245,199,120,0.5)' : '#0d0d15',
                    fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
                    cursor: generating ? 'wait' : 'pointer',
                    letterSpacing: '1px', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.3s ease',
                    opacity: generating ? 0.6 : 1,
                  }}
                >
                  {generating ? (
                    <>
                      <div style={{
                        width: 16, height: 16, border: '2px solid rgba(13,13,21,0.3)',
                        borderTopColor: '#0d0d15', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download Pass (PDF)
                    </>
                  )}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FestPassModal;
