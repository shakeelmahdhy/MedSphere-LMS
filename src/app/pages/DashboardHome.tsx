import { useState, useEffect } from 'react';
import { userAPI } from '../../lib/api';
import { AnalyticsCards } from '../components/dashboard/AnalyticsCards';
import { RecentActivities } from '../components/dashboard/RecentActivities';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TaskCalendar } from '../components/dashboard/TaskCalendar';
import { CourseProgress } from '../components/dashboard/CourseProgress';
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Activities & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <CourseProgress courses={dashboardData?.continue_learning || []} />
          <RecentActivities activities={dashboardData?.recent_activities || []} />
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-1">
          <TaskCalendar tasks={dashboardData?.upcoming_tasks || []} />
        </div>
      </div>
    </div>
  );
}
