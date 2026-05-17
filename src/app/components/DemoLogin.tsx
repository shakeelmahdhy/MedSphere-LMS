import { authAPI } from '../../lib/api';
import { toast } from 'sonner';

export function DemoLogin() {
  const loginAsLearner = async () => {
    try {
      const response = await authAPI.login({
        email: 'sarah.mitchell@example.com',
        password: 'password123'
      });

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('mockUser', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        userType: response.user.user_type,
        role: response.user.role
      }));

      toast.success(`Welcome, ${response.user.name}!`);
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      toast.error('Demo login failed. Please ensure backend is running.');
    }
  };

  const loginAsAdmin = async () => {
    try {
      const response = await authAPI.login({
        email: 'admin@medsphere.com',
        password: 'admin123'
      });

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('mockUser', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        userType: response.user.user_type,
        role: response.user.role
      }));

      toast.success(`Welcome, ${response.user.name}!`);
      window.history.pushState({}, '', '/admin/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      toast.error('Demo login failed. Please ensure backend is running.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-xs">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-2">🚀 Quick Demo Access</h3>
        <p className="text-xs text-gray-600">Click below to instantly access the dashboard</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={loginAsLearner}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium text-sm"
        >
          Login as Learner
        </button>

        <button
          onClick={loginAsAdmin}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium text-sm"
        >
          Login as Admin
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Or use the regular login form with any email/password
        </p>
      </div>
    </div>
  );
}
