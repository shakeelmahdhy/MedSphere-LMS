import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Mail, X, Clock, CheckCircle, BookOpen, Award, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import { notificationsAPI, authAPI } from '../../../lib/api';
import { UserAvatar } from '../UserAvatar';
import { buildLearnerSearchIndex, filterSearchResults, type SearchResult } from '../../../lib/portalSearch';


export function TopBar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buildLearnerSearchIndex().then(setSearchIndex);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    
    const handleUserUpdate = () => fetchUser();
    window.addEventListener('userUpdated', handleUserUpdate);
    
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => {
      clearInterval(interval);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };

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

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('course')) return BookOpen;
    if (t.includes('message')) return MessageSquare;
    if (t.includes('team') || t.includes('group')) return Search;
    if (t.includes('certificate')) return Award;
    return Bell;
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id.toString());
      fetchNotifications();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      fetchNotifications();
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const searchResults = filterSearchResults(searchIndex, searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search courses, certificates, or resources..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <button
                      key={`${result.path}-${idx}`}
                      onClick={() => { navigate(result.path); setSearchQuery(''); setShowSearchResults(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Search size={16} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 block truncate">{result.label}</span>
                        {result.subtitle && (
                          <span className="text-xs text-gray-500 block truncate">{result.subtitle}</span>
                        )}
                      </div>
                      <span className="ml-auto text-xs text-gray-400 capitalize">{result.type}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-500">No results found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-slide-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="mx-auto mb-2 text-gray-300" size={32} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (showAllNotifications ? notifications : notifications.slice(0, 3)).map((notif) => {
                    const Icon = getIcon(notif.title);
                    const isRead = notif.is_read;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                          !isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {notifications.length > 3 && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {showAllNotifications ? 'Show Less' : `View All (${notifications.length})`}
                    </button>
                  </div>
                )}
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => { navigate('/dashboard/settings'); setShowNotifications(false); }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                  >
                    Notification Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <button
            onClick={() => navigate('/dashboard/community')}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageSquare size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-3 pl-3 pr-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <UserAvatar user={currentUser} className="w-10 h-10" />
            <div className="text-left hidden md:block">
              <div className="font-semibold text-sm text-gray-900">{currentUser?.name || 'User'}</div>
              <div className="text-xs text-gray-600">{currentUser?.role || 'Member'}</div>
            </div>
          </button>


        </div>
      </div>
    </header>
  );
}
