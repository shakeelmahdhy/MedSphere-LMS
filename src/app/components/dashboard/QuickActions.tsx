import { PlayCircle, Plus, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

const actions = [
  {
    icon: PlayCircle,
    label: 'Continue Learning',
    mobileLabel: 'Continue',
    description: 'Pick up where you left off',
    color: 'from-blue-600 to-indigo-600',
    path: '/dashboard/courses'
  },
  {
    icon: Plus,
    label: 'Browse Courses',
    mobileLabel: 'Browse',
    description: 'Discover new courses',
    color: 'from-purple-600 to-pink-600',
    path: '/dashboard/courses'
  },
  {
    icon: FileText,
    label: 'View Certificates',
    mobileLabel: 'Certificates',
    description: 'Download your certificates',
    color: 'from-green-600 to-emerald-600',
    path: '/dashboard/certificates'
  },
  {
    icon: Users,
    label: 'Join Community',
    mobileLabel: 'Community',
    description: 'Connect with peers',
    color: 'from-orange-600 to-red-600',
    path: '/dashboard/community'
  }
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="group min-w-0 p-2.5 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 text-[11px] leading-tight text-center sm:text-base sm:text-left sm:mb-1">
                <span className="sm:hidden">{action.mobileLabel}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </h3>
              <p className="hidden sm:block text-sm text-gray-600 text-left">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
