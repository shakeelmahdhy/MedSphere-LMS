import { PlayCircle, Plus, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

const actions = [
  {
    icon: PlayCircle,
    label: 'Continue Learning',
    description: 'Pick up where you left off',
    color: 'from-blue-600 to-indigo-600',
    path: '/dashboard/courses'
  },
  {
    icon: Plus,
    label: 'Browse Courses',
    description: 'Discover new courses',
    color: 'from-purple-600 to-pink-600',
    path: '/dashboard/courses'
  },
  {
    icon: FileText,
    label: 'View Certificates',
    description: 'Download your certificates',
    color: 'from-green-600 to-emerald-600',
    path: '/dashboard/certificates'
  },
  {
    icon: Users,
    label: 'Join Community',
    description: 'Connect with peers',
    color: 'from-orange-600 to-red-600',
    path: '/dashboard/community'
  }
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="group p-4 rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-left">{action.label}</h3>
              <p className="text-sm text-gray-600 text-left">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
