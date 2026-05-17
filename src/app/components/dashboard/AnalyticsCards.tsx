import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { learnerAPI, LearnerAnalytics } from '../../../lib/api';

export function AnalyticsCards() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<LearnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await learnerAPI.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching learner analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    {
      icon: BookOpen,
      label: 'Courses in Progress',
      value: analytics?.courses_in_progress.toString() || '0',
      change: 'Real-time',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      path: '/dashboard/courses'
    },
    {
      icon: Award,
      label: 'Certificates Earned',
      value: analytics?.certificates_earned.toString() || '0',
      change: 'Verified',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      path: '/dashboard/certificates'
    },
    {
      icon: Clock,
      label: 'Learning Hours',
      value: analytics?.learning_hours.toFixed(1) || '0.0',
      change: 'Total time',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      path: '/dashboard/schedule'
    },
    {
      icon: TrendingUp,
      label: 'Completion Rate',
      value: `${analytics?.completion_rate.toFixed(0) || '0'}%`,
      change: 'Success rate',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      path: '/dashboard/courses'
    }
  ];

  if (loading) {
    return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
    </div>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={stat.textColor} size={24} />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                {stat.change}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}