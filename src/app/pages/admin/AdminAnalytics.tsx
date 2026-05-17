import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Download, Loader2 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import api from '../../../lib/api';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.admin.getDashboard();
        setData(response);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportReport = () => {
    const reportData = JSON.stringify(data, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-600 font-medium italic">Loading your insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 p-8 rounded-2xl text-center border border-red-100">
        <p className="text-red-600 font-medium">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 font-semibold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: (data?.total_users || 0).toLocaleString(), icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Learners', value: (data?.active_learners || 0).toLocaleString(), icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { title: 'Completion Rate', value: `${(data?.course_completion_rate || 0).toFixed(1)}%`, icon: BookOpen, color: 'from-green-500 to-green-600' },
    { title: 'Avg Quiz Score', value: `${(data?.avg_quiz_score || 0)}%`, icon: Award, color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Real-time performance metrics and learner engagement</p>
        </div>
        <button 
          onClick={exportReport}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold hover:scale-105 active:scale-95"
        >
          <Download size={20} />
          Export JSON Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollment Trends */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Enrollment Trends
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.enrollment_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={24} className="text-purple-600" />
            User Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.user_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="role"
                >
                  {(data?.user_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Popularity */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen size={24} className="text-green-600" />
            Top Performing Courses
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data?.course_popularity || []} 
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Bar 
                  dataKey="enrollments" 
                  fill="#10B981" 
                  radius={[0, 10, 10, 0]}
                  barSize={40}
                >
                  {(data?.course_popularity || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award size={24} className="text-orange-600" />
          Recent Completions Report
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-600">Learner Name</th>
                <th className="pb-4 font-semibold text-gray-600">Course Title</th>
                <th className="pb-4 font-semibold text-gray-600">Completion Date</th>
                <th className="pb-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.recent_completions?.length > 0 ? (
                data.recent_completions.map((comp: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{comp.user_name}</td>
                    <td className="py-4 text-gray-600">{comp.course_title}</td>
                    <td className="py-4 text-gray-600">{comp.date}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 italic">
                    No recent completions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
