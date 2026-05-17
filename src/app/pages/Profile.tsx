import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Clock, Edit2, Save, X, Camera, Briefcase, GraduationCap, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from 'react-router';
import { authAPI, learnerAPI } from '../../lib/api';
import { UserAvatar } from '../components/UserAvatar';

const achievements = [
  { id: 1, title: 'First Course Completed', icon: Award, date: '2024-02-01', color: 'blue' },
  { id: 2, title: '5 Certificates Earned', icon: GraduationCap, date: '2024-06-15', color: 'green' },
  { id: 3, title: 'Perfect Attendance', icon: Calendar, date: '2024-09-01', color: 'purple' },
  { id: 4, title: '50 Hours Completed', icon: Clock, date: '2025-01-10', color: 'amber' },
];

const recentActivity = [
  { id: 1, action: 'Completed', item: 'Person-Centered Care', date: '2026-03-10', type: 'course' },
  { id: 2, action: 'Started', item: 'Dementia Care Fundamentals', date: '2026-03-05', type: 'course' },
  { id: 3, action: 'Earned', item: 'Communication Skills Certificate', date: '2026-02-28', type: 'certificate' },
  { id: 4, action: 'Joined', item: 'Falls Prevention Workshop', date: '2026-02-20', type: 'workshop' },
];

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setProfileData(user);
        setEditedData(user);
        
        // Fetch analytics for stats
        const analytics = await learnerAPI.getAnalytics();
        setStats([
          { label: 'Courses Enrolled', value: (analytics?.enrolled_courses ?? 0).toString(), icon: BookOpen, color: 'blue', path: '/dashboard/courses' },
          { label: 'Certificates', value: (analytics?.completed_courses ?? 0).toString(), icon: Award, color: 'green', path: '/dashboard/certificates' },
          { label: 'Learning Hours', value: (analytics?.learning_hours ?? 0).toString(), icon: Clock, color: 'purple', path: '/dashboard/schedule' },
          { label: 'Completion Rate', value: `${analytics?.completion_rate ?? 0}%`, icon: GraduationCap, color: 'amber', path: '/dashboard/courses' },
        ]);
      } catch (error) {
        console.error('Profile load error:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = async () => {
    try {
      const updated = await authAPI.updateProfile(editedData);
      setProfileData(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await authAPI.uploadProfilePicture(file);
        setProfileData({ ...profileData, avatar_url: url });
        setEditedData({ ...editedData, avatar_url: url });
        window.dispatchEvent(new Event('userUpdated'));
        toast.success('Profile picture updated!');

      } catch (error) {
        toast.error('Failed to upload profile picture');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!profileData) return <div>Error loading profile</div>;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your personal information and view your progress</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit2 size={20} className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X size={20} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={20} className="mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <UserAvatar 
                  user={profileData} 
                  className="w-32 h-32 border-4 border-white shadow-xl" 
                  fallbackClassName="text-4xl"
                />

                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all shadow-lg cursor-pointer hover:scale-110">
                    <Camera size={20} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData.name}
              </h2>
              <p className="text-gray-600 mt-1">{profileData.role === 'admin' ? 'Administrator' : 'Learner'}</p>
              <p className="text-sm text-gray-500 mt-1">{profileData.group?.name || 'No Group'}</p>
              <Badge className="mt-3 bg-green-500 hover:bg-green-600">Active {profileData.role}</Badge>
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <MessageSquare size={18} className="flex-shrink-0" />
                <span className="text-sm">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="flex-shrink-0" />
                <span className="text-sm">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="flex-shrink-0" />
                <span className="text-sm">{profileData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase size={18} className="flex-shrink-0" />
                <span className="text-sm">ID: {profileData.id}</span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Learning Statistics</h3>
            <div className="space-y-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600',
                  amber: 'bg-amber-100 text-amber-600',
                };
                return (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => navigate(stat.path)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const colorClasses = {
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  purple: 'bg-purple-500',
                  amber: 'bg-amber-500',
                };
                return (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => toast.success(`${achievement.title} - Earned on ${new Date(achievement.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}`)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[achievement.color as keyof typeof colorClasses]} mb-2`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">{achievement.title}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={editedData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editedData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedData.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('en-AU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editedData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <p className="text-gray-900 font-medium">{profileData.employeeId}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <p className="text-gray-900 font-medium">
                      {profileData.startDate ? new Date(profileData.startDate).toLocaleDateString('en-AU', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Not set'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    {isEditing ? (
                      <Input
                        id="position"
                        value={editedData.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.position}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={editedData.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.department}</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Activity History */}
            <TabsContent value="activity">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        if (activity.type === 'course') navigate('/dashboard/courses');
                        else if (activity.type === 'certificate') navigate('/dashboard/certificates');
                        else if (activity.type === 'workshop') navigate('/dashboard/schedule');
                        toast.info(`Navigating to ${activity.item}`);
                      }}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                        {activity.type === 'course' && <BookOpen size={20} />}
                        {activity.type === 'certificate' && <Award size={20} />}
                        {activity.type === 'workshop' && <GraduationCap size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-semibold">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString('en-AU', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}