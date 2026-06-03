import { useState, useEffect } from 'react';
import { userAPI } from '../../lib/api';
import { AnalyticsCards } from '../components/dashboard/AnalyticsCards';
import { RecentActivities } from '../components/dashboard/RecentActivities';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TaskCalendar } from '../components/dashboard/TaskCalendar';
import { CourseProgress } from '../components/dashboard/CourseProgress';
import { TeamAssignments } from '../components/dashboard/TeamAssignments';
import { Loader2 } from 'lucide-react';

export function DashboardHome() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Learner';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const continueLearning = dashboardData?.continue_learning || [];
  const recentActivities = dashboardData?.recent_activities || (dashboardData?.notifications || []).map((notification: any) => ({
    title: notification.title,
    description: notification.message,
    time: 'Update',
    icon: 'Clock',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    link: '/dashboard/courses',
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-slide-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your learning today</p>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Team Course Guidance */}
      <TeamAssignments />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Activities & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <CourseProgress courses={continueLearning} />
          <RecentActivities activities={recentActivities} />
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-1">
          <TaskCalendar tasks={dashboardData?.upcoming_tasks || []} />
        </div>
      </div>
    </div>
  );
}
