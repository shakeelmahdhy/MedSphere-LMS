import React from 'react';
import { Award, ShieldCheck, Check } from 'lucide-react';

interface CertificateTemplateProps {
  learnerName: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
  projectName: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ learnerName, courseName, issueDate, certificateId, projectName }, ref) => {
    // Standard Hex Colors to avoid oklch issues with html2canvas
    const colors = {
      primary: '#1e3a8a',    // blue-900
      secondary: '#3b82f6',  // blue-500
      accent: '#fbbf24',     // amber-400
      textMain: '#1a202c',   // gray-900
      textMuted: '#64748b',  // gray-500
      textLight: '#475569',  // gray-600
      border: '#e2e8f0',     // gray-200
      white: '#ffffff',
      gold: '#d97706'        // amber-600
    };

    return (
      <div 
        ref={ref}
        className="certificate-container"
        style={{
          width: '1122px', // A4 Landscape roughly
          height: '793px',
          padding: '40px',
          background: colors.white,
          position: 'relative',
          fontFamily: "'Inter', sans-serif",
          color: colors.textMain,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: `20px solid ${colors.primary}`,
          boxSizing: 'border-box'
        }}
      >
        {/* Inner Border */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          border: `2px solid ${colors.secondary}`,
          pointerEvents: 'none'
        }} />

        {/* Decorative Corners */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', opacity: 0.2, color: colors.primary }}><Award size={48} /></div>
        <div style={{ position: 'absolute', top: '40px', right: '40px', opacity: 0.2, color: colors.primary }}><Award size={48} /></div>
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', opacity: 0.2, color: colors.primary }}><Award size={48} /></div>
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', opacity: 0.2, color: colors.primary }}><Award size={48} /></div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
             <div style={{ 
               width: '80px', 
               height: '80px', 
               background: colors.primary, 
               borderRadius: '50%', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
             }}>
                <Award size={40} style={{ color: colors.accent }} />
             </div>
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '800', letterSpacing: '-0.025em', color: colors.primary, margin: 0 }}>
            CERTIFICATE
          </h1>
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: colors.textMuted, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, marginTop: '16px' }}>
            OF COMPLETION
          </h2>
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ fontSize: '20px', color: colors.textLight, margin: 0, marginBottom: '32px' }}>
            This is to certify that
          </p>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: '#0f172a', 
              margin: 0, 
              borderBottom: `2px solid ${colors.border}`, 
              paddingBottom: '10px',
              display: 'inline-block',
              minWidth: '400px'
            }}>
              {learnerName}
            </h3>
          </div>

          <p style={{ fontSize: '20px', color: colors.textLight, lineHeight: '1.6', margin: 0, marginBottom: '24px' }}>
            has successfully completed the course on
          </p>

          <h4 style={{ fontSize: '32px', fontWeight: '600', color: '#1e40af', margin: 0, marginBottom: '32px' }}>
            {courseName}
          </h4>

          <p style={{ fontSize: '18px', color: colors.textMuted, maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
            demonstrating exceptional dedication, skill mastery, and academic excellence 
            throughout the duration of the program hosted by <strong style={{ color: colors.primary }}>{projectName}</strong>.
          </p>
        </div>

        {/* Footer / Signatures */}
        <div style={{ width: '100%', marginTop: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 80px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '200px', borderBottom: `1px solid ${colors.textMuted}`, marginBottom: '10px' }}></div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Program Director</p>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{projectName}</p>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              border: `4px double ${colors.gold}`,
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.gold,
              transform: 'rotate(-15deg)',
              background: 'rgba(217, 119, 6, 0.05)'
            }}>
              <ShieldCheck size={32} />
              <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '4px' }}>VERIFIED</span>
              <span style={{ fontSize: '8px' }}>{certificateId}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
             <div style={{ width: '200px', borderBottom: `1px solid ${colors.textMuted}`, marginBottom: '10px' }}></div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Issue Date</p>
            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>{issueDate}</p>
          </div>
        </div>

        {/* Watermark Logo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.03,
          pointerEvents: 'none',
          color: colors.primary
        }}>
          <Award size={400} />
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
