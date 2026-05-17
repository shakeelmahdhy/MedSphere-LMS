import { toast } from 'sonner';
import { Award, Download, Share2, Calendar, CheckCircle, Clock, Search, Filter, X, RefreshCw, FileText } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { certificatesAPI } from '../../lib/api';
import { CertificateTemplate } from '../components/CertificateTemplate';
import { downloadCertificate } from '../../lib/certificate';

export function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const [activeCert, setActiveCert] = useState<any>(null);
  
  const projectName = "MedSphere E-Learning";

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await certificatesAPI.getMyCertificates();
      setCertificates(data);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert: any) => {
    setDownloadingId(cert.id);
    setActiveCert(cert);
    
    // Small delay to ensure the component is rendered in the DOM
    setTimeout(async () => {
      if (certRef.current) {
        const success = await downloadCertificate(
          certRef.current, 
          `Certificate_${cert.domain || cert.course?.title || cert.course_id}_${cert.user?.name || 'User'}`
        );

        if (success) {
          toast.success('Certificate downloaded successfully');
        } else {
          toast.error('Failed to generate certificate');
        }
      }
      setDownloadingId(null);
      setActiveCert(null);
    }, 500);
  };

  const filteredCertificates = certificates.filter(cert => {
    const title = cert.course?.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <RefreshCw className="animate-spin text-blue-600" size={48} />
      <p className="text-gray-500 font-medium">Loading your achievements...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in p-4 md:p-0">
      {/* Hidden container for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {activeCert && (
          <CertificateTemplate 
            ref={certRef}
            learnerName={activeCert.user?.name || 'Learner'}
            courseName={activeCert.domain || activeCert.course?.title || 'Professional Course'}
            issueDate={new Date(activeCert.issued_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            certificateId={`CERT-${activeCert.id.toString().padStart(6, '0')}`}
            projectName={projectName}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Certificates</h1>
          <p className="text-gray-600 text-lg">Celebrate your learning journey and showcase your credentials</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-blue-100">
             <Award className="text-blue-600" size={24} />
             <div className="flex flex-col">
               <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Earned</span>
               <span className="text-xl font-bold text-blue-900">{certificates.length}</span>
             </div>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          placeholder="Search certificates by course name..." 
          className="pl-12 h-14 bg-white border-gray-200 rounded-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCertificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl">
              <div className="relative h-56 bg-gradient-to-br from-indigo-700 via-blue-800 to-blue-900 p-8 flex flex-col justify-between text-white overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                
                <div className="relative flex justify-between items-start">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                    <Award size={32} className="text-amber-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-100 border-green-500/30 backdrop-blur-sm px-3 py-1 text-xs font-semibold rounded-full">
                    <CheckCircle size={12} className="mr-1 inline" /> Verified
                  </Badge>
                </div>

                <div className="relative mt-auto">
                  <h3 className="text-2xl font-bold leading-tight group-hover:translate-x-1 transition-transform duration-300">
                    {cert.domain || cert.course?.title || `Course ID: ${cert.course_id}`}
                  </h3>

                  <div className="flex items-center mt-2 text-blue-100/80 text-sm">
                    <FileText size={14} className="mr-2" />
                    <span>Official Achievement</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issued On</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={16} className="text-blue-500" />
                      <span className="font-bold text-gray-700">{new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID</span>
                    <span className="font-mono text-xs font-bold text-blue-600 mt-1">CERT-{cert.id.toString().padStart(6, '0')}</span>
                  </div>
                </div>

                <Button 
                  disabled={downloadingId === cert.id}
                  className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                  onClick={() => handleDownload(cert)}
                >
                  {downloadingId === cert.id ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={22} />
                      Download Certificate
                    </>
                  )}
                </Button>
                
                <p className="text-center text-xs text-gray-400">
                  This certificate is a verified credential issued by {projectName}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={48} className="text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-500 max-w-md mx-auto text-lg">
            {searchQuery ? "We couldn't find any certificates matching your search." : "You haven't earned any certificates yet. Keep learning to unlock milestones!"}
          </p>
          {!searchQuery && (
            <Button 
              className="mt-8 rounded-2xl px-8 h-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
              onClick={() => navigate('/dashboard/courses')}
            >
              Browse Courses
            </Button>
          )}
        </div>
      )}
    </div>
  );
}