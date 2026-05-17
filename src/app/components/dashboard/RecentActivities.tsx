import { CheckCircle2, PlayCircle, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

const iconMap: Record<string, any> = {
  CheckCircle2,
  PlayCircle,
  Award,
  Clock
};

export function RecentActivities({ activities = [] }: { activities?: any[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? activities.map((activity, index) => {
          const Icon = iconMap[activity.icon] || Clock;
          return (
            <div
              key={index}
              onClick={() => navigate(activity.link)}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`${activity.iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={activity.iconColor} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{activity.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
            </div>
          );
        }) : (
          <div className="text-center py-8 text-gray-500">No recent activities found</div>
        )}
      </div>
    </div>
  );
}
