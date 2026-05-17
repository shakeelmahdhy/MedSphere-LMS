import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UsersRound,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Shield,
  ArrowLeftRight,
  Calendar,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationsAPI, authAPI } from '../../lib/api';
import { UserAvatar } from './UserAvatar';

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id.toString());
      fetchNotifications();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/';
  };



  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/dashboard/courses', icon: BookOpen, label: 'Course Management' },
    { path: '/admin/dashboard/users', icon: Users, label: 'User Management' },
    { path: '/admin/dashboard/teams', icon: UsersRound, label: 'Team Management' },
    { path: '/admin/dashboard/schedules', icon: Calendar, label: 'Schedule Management' },
    { path: '/admin/dashboard/community', icon: MessageSquare, label: 'Community Management' },
    { path: '/admin/dashboard/messages', icon: MessageSquare, label: 'Private Messages' },
    { path: '/admin/dashboard/certificates', icon: Award, label: 'Certificates' },
    { path: '/admin/dashboard/analytics', icon: BarChart3, label: 'Analytics & Reports' },
    { path: '/admin/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center overflow-hidden">
                <img src="/logo.svg" alt="Medsphere Logo" className="h-12 w-auto" />
              </div>
            ) : (
              <div className="flex items-center overflow-hidden mx-auto">
                <img src="/logo2.svg" alt="Medsphere Logo" className="h-10 w-auto" />
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Main Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-2xl">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Search courses, users, teams..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4 ml-6">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <Bell size={22} className="text-gray-600 group-hover:text-blue-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-scale-in max-h-[580px] overflow-hidden flex flex-col">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell className="mx-auto mb-2 opacity-20" size={32} />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          (showAllNotifications ? notifications : notifications.slice(0, 3)).map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                              onClick={() => handleMarkAsRead(notif.id)}
                            >
                              <div className="flex gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${!notif.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                  <Bell size={16} />
                                </div>
                                <div>
                                  <p className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 3 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                          <button
                            onClick={() => setShowAllNotifications(!showAllNotifications)}
                            className="w-full py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            {showAllNotifications ? 'Show Less' : `View All (${notifications.length})`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <UserAvatar user={currentUser} className="w-10 h-10 shadow-md" />
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{currentUser?.role === 'admin' ? 'Administrator' : 'Staff'}</p>
                      </div>
                      <ChevronDown size={18} className={`text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>


                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{currentUser?.name || 'Admin User'}</p>
                        <p className="text-sm text-gray-500">{currentUser?.email || 'admin@medsphere.com'}</p>
                      </div>

                      <Link
                        to="/admin/dashboard/settings"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Settings size={18} className="text-gray-600" />
                        <span className="text-gray-700">Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600 border-t border-gray-100"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
