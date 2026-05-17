import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  ArrowLeftRight,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { messagesAPI } from '../../../lib/api';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}



export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/dashboard/courses' },
    { icon: Shield, label: 'Browse Courses', path: '/dashboard/browse' },
    { icon: Calendar, label: 'Schedule', path: '/dashboard/schedule' },
    { icon: Award, label: 'Certificates', path: '/dashboard/certificates' },
    { icon: Users, label: 'Community', path: '/dashboard/community' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', badge: unreadCount > 0 ? unreadCount.toString() : undefined },
  ];

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { unread_count } = await messagesAPI.getUnreadCount();
        setUnreadCount(unread_count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  return (
    <>
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {isOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AC</span>
                </div>
                <span className="font-semibold text-lg text-gray-900">Medsphere</span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">AC</span>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Main Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Settings */}
            <Link
              to="/dashboard/settings"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === '/dashboard/settings'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} className="flex-shrink-0" />
              {isOpen && <span className="font-medium">Settings</span>}
            </Link>

            {/* Help & Support */}
            <button
              onClick={handleHelp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
            >
              <HelpCircle size={20} className="flex-shrink-0" />
              {isOpen && <span className="font-medium">Help & Support</span>}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHelpModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <HelpCircle className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Help & Support</h3>
                <p className="text-sm text-gray-600">We're here to help you succeed</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => { toast.success('Opening knowledge base...'); setShowHelpModal(false); }}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <h4 className="font-semibold text-gray-900">Knowledge Base</h4>
                <p className="text-sm text-gray-600 mt-1">Browse FAQs and helpful articles</p>
              </button>
              <button
                onClick={() => { toast.success('Live chat initiated! A support agent will be with you shortly.'); setShowHelpModal(false); }}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
              >
                <h4 className="font-semibold text-gray-900">Live Chat</h4>
                <p className="text-sm text-gray-600 mt-1">Chat with our support team in real-time</p>
              </button>
              <button
                onClick={() => { toast.success('Support ticket created! We\'ll respond within 24 hours.'); setShowHelpModal(false); }}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
              >
                <h4 className="font-semibold text-gray-900">Submit a Ticket</h4>
                <p className="text-sm text-gray-600 mt-1">Create a support request for complex issues</p>
              </button>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Contact us:</span> support@medspherelearning.com.au
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-900">Phone:</span> 1800 123 456 (Mon-Fri, 9am-5pm AEST)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}