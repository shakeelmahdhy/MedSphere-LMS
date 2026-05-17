import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Plus,
  Upload,
  UserPlus,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '../../../lib/api';
import { Link } from 'react-router';

export function AdminDashboardHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllEnrollments, setShowAllEnrollments] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.admin.getDashboard();
        setData(response);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-600 font-medium italic">Preparing your dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Learners',
      value: data?.total_users || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Courses',
      value: data?.course_popularity?.length || '0',
      change: '+8.2%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Completion Rate',
      value: `${data?.course_completion_rate?.toFixed(1)}%` || '0%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Avg Quiz Score',
      value: `${data?.avg_quiz_score}%` || '0%',
      change: '+15.7%',
      trend: 'up',
      icon: Award,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Course',
      icon: Plus,
      color: 'from-blue-500 to-indigo-600',
      description: 'Build from scratch or use AI',
      link: '/admin/courses'
    },
    {
      title: 'Course Management',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      description: 'Edit and publish content',
      link: '/admin/courses'
    },
    {
      title: 'Add Learners',
      icon: UserPlus,
      color: 'from-green-500 to-teal-600',
      description: 'Add new individual learners',
      link: '/admin/users'
    },
    {
      title: 'System Settings',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      description: 'Configure platform settings',
      link: '/admin/settings'
    }
  ];

  const iconMap: any = {
    'BookOpen': BookOpen,
    'UserPlus': UserPlus,
    'Award': Award,
    'Settings': Settings,
    'Users': Users,
    'Activity': Activity,
    'Clock': Clock,
    'TrendingUp': TrendingUp,
    'CheckCircle': CheckCircle,
    'AlertCircle': AlertCircle
  };

  const activityToDisplay = showAllActivity 
    ? data?.recent_activity 
    : data?.recent_activity?.slice(0, 5);

  const enrollmentsToDisplay = showAllEnrollments 
    ? data?.course_popularity 
    : data?.course_popularity?.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-blue-100 text-lg">Here's what's happening with your platform today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity size={24} className="text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                to={action.link}
                key={index}
                className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left block"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={24} className="text-purple-600" />
            Recent Activity
          </h2>
          <div className="space-y-4 flex-1">
            {activityToDisplay?.length > 0 ? (
              activityToDisplay.map((activity: any, index: number) => {
                const Icon = iconMap[activity.icon] || Activity;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-10 text-gray-400 italic">No recent activity found</p>
            )}
          </div>
          
          {data?.recent_activity?.length > 5 && (
            <button 
              onClick={() => setShowAllActivity(!showAllActivity)}
              className="mt-6 w-full py-3 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {showAllActivity ? 'Show Less' : `View All (${data.recent_activity.length})`}
            </button>
          )}
        </div>

        {/* Course Enrollment Status */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Course Enrollment Status
          </h2>
          <div className="space-y-4 flex-1">
            {enrollmentsToDisplay?.map((stat: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 truncate mr-4">{stat.title}</span>
                  <span className="font-bold text-gray-900">{stat.enrollments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-blue-500 h-full rounded-full transition-all duration-500 hover:scale-x-105 origin-left`}
                    style={{ width: `${Math.min((stat.enrollments / (data.total_users || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {(!data?.course_popularity || data.course_popularity.length === 0) && (
              <p className="text-center py-10 text-gray-400 italic">No enrollment data available</p>
            )}
          </div>

          {data?.course_popularity?.length > 5 && (
            <button 
              onClick={() => setShowAllEnrollments(!showAllEnrollments)}
              className="mt-6 w-full py-3 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {showAllEnrollments ? 'Show Less' : `View All (${data.course_popularity.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
