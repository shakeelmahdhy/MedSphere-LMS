import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { adminAPI, coursesAPI, messagesAPI } from '../../../lib/api';
import {
  Users,
  UserPlus,
  Download,
  Search,
  Filter,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  UserMinus,
  X,
  Save,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from '../../components/UserAvatar';


export function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [learners, setLearners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddLearnerModal, setShowAddLearnerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [learnerForm, setLearnerForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    group: '',
    team: '',
    role: 'Learner',
    user_type: 'learner'
  });

  const [groups, setGroups] = useState<any[]>([]);


  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, [activeTab]);

  useEffect(() => {
    if (searchParams.get('add') !== 'true') return;
    setShowAddLearnerModal(true);
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await adminAPI.getUsers(status);
      setLearners(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await adminAPI.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };





  const handleSaveLearner = async () => {
    try {
      if (selectedLearner) {
        await adminAPI.updateUser(selectedLearner.id, {
          name: learnerForm.name,
          email: learnerForm.email,
          role: learnerForm.role,
          is_active: true
        });
        
        // Update group if changed
        if (learnerForm.group) {
          await adminAPI.bulkAssignGroup([selectedLearner.id.toString()], learnerForm.group);
        }
        
        toast.success('User updated successfully!');
      } else {
        const response: any = await adminAPI.createUser({
          name: learnerForm.name,
          email: learnerForm.email,
          password: learnerForm.password,
          role: learnerForm.role
        });
        
        // If a group was selected during creation, assign it
        if (learnerForm.group && response.user?.id) {
          await adminAPI.bulkAssignGroup([response.user.id.toString()], learnerForm.group);
        }
        
        toast.success('User created successfully!');
      }
      setShowAddLearnerModal(false);
      setShowEditModal(false);
      setLearnerForm({
        name: '',
        email: '',
        password: 'password123',
        group: '',
        team: '',
        role: 'learner',
        user_type: 'learner'
      });
      setSelectedLearner(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedLearner.id);
      toast.success(`User "${selectedLearner?.name}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedLearner(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleView = async (learner: any) => {
    try {
      const fullUser = await adminAPI.getUser(learner.id);
      setSelectedLearner(fullUser);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedLearner(learner);
    }
    setShowViewModal(true);
    setOpenMenuId(null);
  };

  const handleEdit = (learner: any) => {
    setSelectedLearner(learner);
    setLearnerForm({
      name: learner.name,
      email: learner.email,
      password: 'password123',
      group: learner.group_id?.toString() || '',
      team: '',
      role: learner.role,
      user_type: 'learner'
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };



  const handleSendEmail = (learner: any) => {
    setSelectedLearner(learner);
    setShowEmailModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = (learner: any) => {
    setSelectedLearner(learner);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage learners, groups, and user access</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedLearner(null);
              setLearnerForm({
                name: '',
                email: '',
                password: 'password123',
                group: '',
                team: '',
                role: 'learner',
                user_type: 'learner'
              });
              setShowAddLearnerModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold hover:scale-105"
          >
            <UserPlus size={20} />
            Add Learner
          </button>
        </div>
      </div>

      {/* Groups Overview */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users size={24} className="text-blue-600" />
          Learner Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {groups.length > 0 ? groups.map((group, index) => (
            <div
              key={group.id}
              onClick={() => toast.info(`Viewing ${group.name}`)}
              className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                <Users className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
              <p className="text-sm text-gray-600">{group.location}</p>
            </div>
          )) : (
            <div className="col-span-5 text-center py-8 text-gray-500">No groups found</div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Learners
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-4 px-4 font-semibold text-gray-700">Learner</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Group</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Enrolled</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Completed</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => {
                  const enrolledCount = learner.enrollments?.length || 0;
                  const completedCount = learner.enrollments?.filter((e: any) => e.status === 'completed').length || 0;
                  
                  return (
                    <tr key={learner.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={learner} className="w-10 h-10 border border-gray-100 shadow-sm" />
                          <div>
                            <div className="font-semibold text-gray-900">{learner.name}</div>
                            <div className="text-sm text-gray-600">{learner.email}</div>
                          </div>
                        </div>

                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {learner.group?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <BookOpen size={16} className="text-blue-600" />
                          {enrolledCount}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Award size={16} className="text-green-600" />
                          {completedCount}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {learner.is_active ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle size={16} className="text-gray-600" />
                            <span className="text-gray-600 font-medium">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(learner)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Eye size={18} className="text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <button onClick={() => handleEdit(learner)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors group">
                            <Edit size={18} className="text-gray-600 group-hover:text-purple-600" />
                          </button>
                          <button onClick={() => handleSendEmail(learner)} className="p-2 hover:bg-green-50 rounded-lg transition-colors group">
                            <MessageSquare size={18} className="text-gray-600 group-hover:text-green-600" />
                          </button>
                          <button onClick={() => handleDelete(learner)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                            <Trash2 size={18} className="text-gray-600 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showAddLearnerModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditModal ? 'Edit Learner' : 'Add New Learner'}
              </h2>
              <button onClick={() => { setShowAddLearnerModal(false); setShowEditModal(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={learnerForm.name}
                  onChange={(e) => setLearnerForm({ ...learnerForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={learnerForm.email}
                  onChange={(e) => setLearnerForm({ ...learnerForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              {!showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={learnerForm.password}
                    onChange={(e) => setLearnerForm({ ...learnerForm, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Set password"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                <select
                  value={learnerForm.group}
                  onChange={(e) => setLearnerForm({ ...learnerForm, group: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={learnerForm.role}
                  onChange={(e) => setLearnerForm({ ...learnerForm, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="learner">Learner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={() => { setShowAddLearnerModal(false); setShowEditModal(false); }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium">Cancel</button>
              <button onClick={handleSaveLearner} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold">
                <Save size={20} />
                {showEditModal ? 'Save Changes' : 'Add Learner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && selectedLearner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete User?</h2>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to delete {selectedLearner.name}? This action cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium">Cancel</button>
                <button onClick={handleDeleteUser} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg font-semibold">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details */}
      {showViewModal && selectedLearner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex items-center gap-4">
                <UserAvatar user={selectedLearner} className="w-20 h-20 text-2xl" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedLearner.name}</h3>
                  <p className="text-gray-600">{selectedLearner.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Group</p>
                  <p className="text-lg font-bold text-blue-600">{selectedLearner.group?.name || 'None'}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Enrollments</p>
                  <p className="text-lg font-bold text-green-600">{selectedLearner.enrollments?.length || 0}</p>
                </div>
              </div>

              {/* Enrollments List */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Course Enrollments
                </h4>
                {selectedLearner.enrollments && selectedLearner.enrollments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLearner.enrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{enrollment.course?.title || `Course ID: ${enrollment.course_id}`}</p>
                          <p className="text-sm text-gray-600">Status: {enrollment.status}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">{Math.round(enrollment.progress)}%</div>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                    No courses enrolled yet
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">

              <button onClick={() => setShowViewModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium">Close</button>
            </div>
          </div>
        </div>
      )}


      {/* Message Modal */}
      {showEmailModal && selectedLearner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Message {selectedLearner.name}</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                <textarea
                  id="message-content"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={() => setShowEmailModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium">Cancel</button>
              <button 
                onClick={async () => {
                  const content = (document.getElementById('message-content') as HTMLTextAreaElement).value;
                  if (!content) return toast.error('Please enter a message');
                  try {
                    await messagesAPI.sendMessage(selectedLearner.id, content);
                    toast.success('Message sent successfully!');
                    setShowEmailModal(false);
                  } catch (error) {
                    toast.error('Failed to send message');
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg font-semibold"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
