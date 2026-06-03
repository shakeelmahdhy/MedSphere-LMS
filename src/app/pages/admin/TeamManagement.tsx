import { useState, useEffect } from 'react';
import {
  Users,
  UsersRound,
  Plus,
  Shield,
  User,
  Crown,
  Briefcase,
  Edit,
  Trash2,
  UserPlus,
  MoreVertical,
  Search,
  Eye,
  X,
  Save,
  Loader2,
  Hash,
  BookOpen,
  CheckCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../../lib/api';
import { UserAvatar } from '../../components/UserAvatar';


export function TeamManagement() {
  const [activeTab, setActiveTab] = useState<'teams' | 'roles'>('teams');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showViewTeamModal, setShowViewTeamModal] = useState(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [teams, setTeams] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teamCourses, setTeamCourses] = useState<any[]>([]);
  
  const [teamForm, setTeamForm] = useState({
    name: '',
    location: '',
    admin_id: ''
  });
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsList, rolesList, usersList, coursesList] = await Promise.all([
        adminAPI.getTeams(),
        adminAPI.getRoles(),
        adminAPI.getUsers(),
        adminAPI.getCourses()
      ]);
      setTeams(teamsList);
      setRoles(rolesList);
      setUsers(usersList);
      setCourses(coursesList);
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      if (!teamForm.name || !teamForm.location) {
        toast.error('Please fill in team name and location');
        return;
      }
      
      const payload = {
        name: teamForm.name,
        location: teamForm.location,
        admin_id: teamForm.admin_id ? parseInt(teamForm.admin_id) : null
      };

      if (showEditTeamModal && selectedTeam) {
        await adminAPI.updateTeam(selectedTeam.id, payload.name, payload.location, payload.admin_id?.toString());
        toast.success('Team updated successfully!');
      } else {
        await adminAPI.createTeam(payload.name, payload.location, payload.admin_id?.toString());
        toast.success('Team created successfully!');
      }
      
      setShowCreateTeamModal(false);
      setShowEditTeamModal(false);
      setTeamForm({ name: '', location: '', admin_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save team');
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.name) {
        toast.error('Please enter a role name');
        return;
      }

      if (showEditRoleModal && selectedRole) {
        await adminAPI.updateRole(selectedRole.id, roleForm.name, roleForm.description, roleForm.permissions);
        toast.success('Role updated successfully!');
      } else {
        await adminAPI.createRole(roleForm.name, roleForm.description, roleForm.permissions);
        toast.success('Role created successfully!');
      }

      setShowCreateRoleModal(false);
      setShowEditRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: [] });
      fetchData();
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleConfirmDeleteTeam = async () => {
    try {
      await adminAPI.deleteTeam(selectedTeam.id);
      toast.success('Team deleted successfully');
      setShowDeleteTeamModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const handleConfirmDeleteRole = async (roleId: string) => {
    try {
      await adminAPI.deleteRole(roleId);
      toast.success('Role deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleAddTeamMember = async (userId: string) => {
    try {
      await adminAPI.addTeamMember(selectedTeam.id, userId);
      toast.success('Member added to team!');
      setShowAddMemberModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const openAddCourseModal = async (team: any) => {
    try {
      setSelectedTeam(team);
      const assignedCourses = await adminAPI.getTeamCourses(team.id);
      setTeamCourses(assignedCourses);
      setShowAddCourseModal(true);
    } catch (error) {
      toast.error('Failed to load team courses');
    }
  };

  const handleAddTeamCourse = async (courseId: string) => {
    try {
      const result = await adminAPI.addTeamCourse(selectedTeam.id, courseId);
      const assignedCourses = await adminAPI.getTeamCourses(selectedTeam.id);
      setTeamCourses(assignedCourses);
      setShowAddCourseModal(false);
      fetchData();
      toast.success(
        result.assigned_count > 0
          ? `Course added and assigned to ${result.assigned_count} team member${result.assigned_count === 1 ? '' : 's'}`
          : 'Course added to team'
      );
    } catch (error) {
      toast.error('Failed to add course to team');
    }
  };

  const handleRemoveTeamCourse = async (courseId: number) => {
    if (!window.confirm('Remove this course from the team? Existing learner enrollments will stay in place.')) return;

    try {
      await adminAPI.removeTeamCourse(selectedTeam.id, courseId);
      const assignedCourses = await adminAPI.getTeamCourses(selectedTeam.id);
      setTeamCourses(assignedCourses);
      fetchData();
      toast.success('Course removed from team');
    } catch (error) {
      toast.error('Failed to remove course from team');
    }
  };

  const handleRemoveTeamMember = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      await adminAPI.removeTeamMember(selectedTeam.id, userId);
      toast.success('Member removed from team');
      // Update local state to reflect removal immediately for better UX
      setSelectedTeam({
        ...selectedTeam,
        members: selectedTeam.members.filter((m:any) => m.id !== userId)
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleViewTeam = async (team: any) => {
    try {
      setTeamCourses([]);
      setSelectedTeam(team);
      const courses = await adminAPI.getTeamCourses(team.id);
      setTeamCourses(courses);
      setShowViewTeamModal(true);
    } catch (error) {
      toast.error('Failed to fetch team courses');
    }
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      location: team.location,
      admin_id: team.admin_id?.toString() || ''
    });
    setShowEditTeamModal(true);
  };

  const handleDeleteTeam = (team: any) => {
    setSelectedTeam(team);
    setShowDeleteTeamModal(true);
  };

  const handleAddMember = (team: any) => {
    setSelectedTeam(team);
    setShowAddMemberModal(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions
    });
    setShowEditRoleModal(true);
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin')) return Shield;
    if (name.includes('creator')) return Briefcase;
    if (name.includes('leader')) return UsersRound;
    return User;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage teams, user roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'teams') {
                setTeamForm({ name: '', location: '', admin_id: '' });
                setShowCreateTeamModal(true);
              } else {
                setRoleForm({ name: '', description: '', permissions: [] });
                setShowCreateRoleModal(true);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold hover:scale-105"
          >
            <Plus size={20} />
            {activeTab === 'teams' ? 'Create Team' : 'Create Role'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            User Roles
          </button>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={20} />
              <input
                type="text"
                placeholder="Search teams by name or location..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  No teams found. Create your first team to get started.
                </div>
              ) : (
                teams.map((team) => (
                  <div
                    key={team.id}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <UsersRound className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.location}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === team.id ? null : team.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={20} className="text-gray-600" />
                        </button>
                        {openMenuId === team.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-10 animate-scale-in">
                            <button
                              onClick={() => {
                                handleViewTeam(team);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                            >
                              <Eye size={16} /> View Activity
                            </button>
                            <button
                              onClick={() => {
                                // Simple CSV Export
                                const headers = ['Name', 'Email', 'Role'];
                                const rows = team.members?.map((m: any) => [m.name, m.email, m.role]) || [];
                                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.setAttribute('hidden', '');
                                a.setAttribute('href', url);
                                a.setAttribute('download', `${team.name}_data.csv`);
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                toast.success('Data exported successfully!');
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                            >
                              <Download size={16} /> Export Data
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-blue-600">{team.members?.length || 0}</p>
                        <p className="text-xs text-gray-600">Members</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-purple-600">{team.course_count ?? 0}</p>
                        <p className="text-xs text-gray-600">Courses</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-green-600">100%</p>
                        <p className="text-xs text-gray-600">Active</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                      <UserAvatar user={team.admin} className="w-8 h-8" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Team Admin</p>
                        <p className="text-xs text-gray-600">{team.admin ? team.admin.name : 'Not Assigned'}</p>
                      </div>
                    </div>


                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewTeam(team)}
                        className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="flex-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleAddMember(team)}
                        className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} />
                        Add
                      </button>
                      <button
                        onClick={() => openAddCourseModal(team)}
                        className="flex-1 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <BookOpen size={16} />
                        Course
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="p-6 space-y-6">
            <div className="grid gap-6">
              {roles.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  No custom roles found.
                </div>
              ) : (
                roles.map((role) => {
                  const Icon = getRoleIcon(role.name);
                  return (
                    <div
                      key={role.id}
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="text-white" size={32} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{role.name}</h3>
                            <p className="text-gray-600 mt-1">
                              {role.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                          >
                            <Edit size={20} className="text-gray-600 group-hover/btn:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteRole(role.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                          >
                            <Trash2 size={20} className="text-gray-600 group-hover/btn:text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Permissions:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {role.permissions.map((permission: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Team Modal */}
      {(showCreateTeamModal || showEditTeamModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditTeamModal ? 'Edit Team' : 'Create New Team'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setShowEditTeamModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={teamForm.location}
                  onChange={(e) => setTeamForm({ ...teamForm, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Admin</label>
                <select
                  value={teamForm.admin_id}
                  onChange={(e) => setTeamForm({ ...teamForm, admin_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Admin</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setShowEditTeamModal(false);
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold"
              >
                <Save size={20} />
                {showEditTeamModal ? 'Save Changes' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Member to {selectedTeam.name}</h2>
              <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.value) handleAddTeamMember(e.target.value);
                  }}
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => !selectedTeam.members.some((m:any) => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Course to {selectedTeam.name}</h2>
              <button onClick={() => setShowAddCourseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.value) handleAddTeamCourse(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="">Select a course...</option>
                  {courses
                    .filter((course) => !teamCourses.some((assigned) => assigned.id === course.id))
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} {course.status ? `(${course.status})` : ''}
                      </option>
                    ))}
                </select>
                {courses.filter((course) => !teamCourses.some((assigned) => assigned.id === course.id)).length === 0 && (
                  <p className="text-sm text-gray-500 mt-3">All available courses are already assigned to this team.</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {showDeleteTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Team?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "{selectedTeam.name}"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteTeamModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteTeam}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {showViewTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-8 text-white flex-shrink-0">
              <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                    <UsersRound size={28} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-3xl font-bold truncate">{selectedTeam.name}</h2>
                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                      <Hash size={14} /> {selectedTeam.location}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowViewTeamModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold">{selectedTeam.members?.length || 0}</p>
                  <p className="text-xs text-blue-100">Total Members</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold">{teamCourses.length}</p>
                  <p className="text-xs text-blue-100">Active Courses</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold">85%</p>
                  <p className="text-xs text-blue-100">Compliance</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {/* Team Members List */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                  <button 
                    onClick={() => {
                      setShowViewTeamModal(false);
                      setShowAddMemberModal(true);
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <UserPlus size={18} />
                    Add Member
                  </button>
                </div>

                <div className="space-y-3">
                  {!selectedTeam.members || selectedTeam.members.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      No members in this team yet.
                    </div>
                  ) : (
                    selectedTeam.members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={member} className="w-10 h-10 bg-white border border-gray-200" />
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove from team"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Team Courses List */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Enrolled Courses</h3>
                  <button
                    onClick={() => openAddCourseModal(selectedTeam)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <BookOpen size={18} />
                    Add Course
                  </button>
                </div>

                <div className="space-y-3">
                  {teamCourses.length > 0 ? teamCourses.map((course) => (
                    <div key={course.id} className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{course.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Users size={12} /> {course.enrollment_count} Learners
                            </p>
                            <p className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                              <CheckCircle size={12} /> {course.completion_count} Completed
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTeamCourse(course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove course from team"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      No active courses for this team.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {(showCreateRoleModal || showEditRoleModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditRoleModal ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateRoleModal(false);
                  setShowEditRoleModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe this role..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {['Full system access', 'Manage users', 'Create courses', 'Edit courses', 'Delete courses', 'Assign courses', 'View analytics', 'Manage teams', 'System settings'].map((perm) => (
                    <label key={perm} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, perm] });
                          } else {
                            setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter(p => p !== perm) });
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateRoleModal(false);
                  setShowEditRoleModal(false);
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-semibold"
              >
                <Save size={20} />
                {showEditRoleModal ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
