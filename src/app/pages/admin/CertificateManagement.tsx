import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Award, Download, Search, Filter, Plus, User, BookOpen, Clock, Trash2, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminAPI } from '../../../lib/api';
import { CertificateTemplate } from '../../components/CertificateTemplate';
import { downloadCertificate } from '../../../lib/certificate';
import { UserAvatar } from '../../components/UserAvatar';


export function CertificateManagement() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [activeCert, setActiveCert] = useState<any>(null);
  const certRef = useRef<HTMLDivElement>(null);
  
  const [newCert, setNewCert] = useState({
    user_id: '',
    course_id: '',
    domain: ''
  });

  const projectName = "MedSphere E-Learning";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allCerts, allUsers, allCourses] = await Promise.all([
        adminAPI.getAllCertificates(),
        adminAPI.getUsers(),
        adminAPI.getCourses()
      ]);
      setCertificates(allCerts);
      setUsers(allUsers);
      setCourses(allCourses);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!newCert.user_id || (!newCert.course_id && !newCert.domain)) {
      toast.error('Please select a learner and either a course or provide a domain');
      return;
    }

    try {
      // Find course title if course_id is selected but domain is empty
      let finalDomain = newCert.domain;
      if (!finalDomain && newCert.course_id) {
        const course = courses.find(c => c.id.toString() === newCert.course_id.toString());
        finalDomain = course?.title || '';
      }

      await adminAPI.generateCertificate({
        user_id: parseInt(newCert.user_id),
        course_id: newCert.course_id ? parseInt(newCert.course_id) : null,
        domain: finalDomain
      });

      toast.success('Certificate generated and issued successfully');
      setShowGenerateModal(false);
      setNewCert({ user_id: '', course_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to generate certificate');
    }
  };

  const handleDownload = async (cert: any) => {
    setDownloadingId(cert.id);
    setActiveCert(cert);
    
    setTimeout(async () => {
      if (certRef.current) {
        const success = await downloadCertificate(
          certRef.current, 
          `Certificate_${cert.course?.title || cert.course_id}_${cert.user?.name || 'User'}`
        );
        if (success) {
          toast.success('Certificate downloaded');
        } else {
          toast.error('Download failed');
        }
      }
      setDownloadingId(null);
      setActiveCert(null);
    }, 500);
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) return;
    
    try {
      await adminAPI.deleteCertificate(id);
      toast.success('Certificate revoked successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to revoke certificate');
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Hidden container for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {activeCert && (
          <CertificateTemplate 
            ref={certRef}
            learnerName={activeCert.user?.name || 'Learner'}
            courseName={activeCert.course?.title || 'Professional Course'}
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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Credential Management</h1>
          <p className="text-gray-600 text-lg mt-1">Issue, track, and manage official certificates for your organization</p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} className="mr-2" />
          Issue New Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Award size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Issued</p>
              <h3 className="text-3xl font-black text-gray-900">{certificates.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl rounded-[32px] bg-white">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input placeholder="Search by learner name or course..." className="pl-12 h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500" />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-gray-200 hover:bg-white">
            <Filter size={20} className="mr-2" /> Filter Results
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Certificate ID</th>
                <th className="px-8 py-5">Learner Details</th>
                <th className="px-8 py-5">Course / Domain</th>
                <th className="px-8 py-5">Issue Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ShieldCheck size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No certificates have been issued yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        CERT-{cert.id.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <UserAvatar user={cert.user} className="w-10 h-10 border border-gray-100 shadow-inner" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cert.user?.name || 'Unknown Learner'}</span>
                          <span className="text-xs text-gray-500 font-medium">{cert.user?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                          <BookOpen size={14} />
                        </div>
                        <span className="font-semibold text-gray-700">{cert.domain || cert.course?.title || `Course ID: ${cert.course_id}`}</span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span className="font-medium">{new Date(cert.issued_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          disabled={downloadingId === cert.id}
                          onClick={() => handleDownload(cert)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all active:scale-90 disabled:opacity-50" 
                          title="Download PDF"
                        >
                          {downloadingId === cert.id ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                        </button>
                        <button 
                          onClick={() => handleRevoke(cert.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90" 
                          title="Revoke Certificate"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 space-y-6 rounded-[32px] border-0 shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 text-white">
                  <Award size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Issue Official Credential</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <Clock className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Select Learner</label>
                <select 
                  className="w-full h-14 px-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                  value={newCert.user_id}
                  onChange={e => setNewCert({...newCert, user_id: e.target.value})}
                >
                  <option value="">Choose a student from the directory</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Select Course Domain</label>
                <select 
                  className="w-full h-14 px-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                  value={newCert.course_id}
                  onChange={e => setNewCert({...newCert, course_id: e.target.value})}
                >
                  <option value="">Select established curriculum</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Custom Domain / Topic (Optional)</label>
                <Input 
                  placeholder="e.g. Advanced Neurology Specialization"
                  className="h-14 px-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold text-gray-700"
                  value={newCert.domain}
                  onChange={e => setNewCert({...newCert, domain: e.target.value})}
                />
                <p className="text-[10px] text-gray-400 px-1">Leave empty to use the selected course title</p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex gap-4 items-start">

                <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm text-amber-900 font-medium leading-relaxed">
                  Issuing this certificate will generate a cryptographically unique identifier and permanently record this achievement in the learner's profile.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50"
                onClick={() => setShowGenerateModal(false)}
              >
                Discard
              </Button>
              <Button 
                className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                onClick={handleGenerate}
              >
                Confirm & Issue
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
