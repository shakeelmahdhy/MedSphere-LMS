import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function TaskCalendar({ tasks = [] }: { tasks?: any[] }) {
  const [currentDate] = useState(new Date());
  const navigate = useNavigate();
  
  const getDaysUntil = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Overdue';
    return `${diffDays} days`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
      {/* Current Date Display */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Today's Date</h2>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="text-4xl font-bold mb-1">
            {currentDate.getDate()}
          </div>
          <div className="text-sm opacity-90">
            {currentDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
          </div>
          <div className="text-xs opacity-75 mt-2">
            {currentDate.toLocaleDateString('en-AU', { weekday: 'long' })}
          </div>
        </div>
      </div>

      {/* Due Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
            {tasks.filter(task => task.priority === 'high').length} Urgent
          </span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.length > 0 ? tasks.map((task) => {
            const daysUntil = getDaysUntil(task.dueDate);
            const isUrgent = daysUntil === 'Today' || daysUntil === 'Tomorrow' || daysUntil === 'Overdue';
            
            return (
              <div
                key={task.id}
                onClick={() => {
                  toast.info(`Task: ${task.title} - Due ${daysUntil}`);
                  navigate('/dashboard/schedule');
                }}
                className={`p-4 rounded-xl border-2 ${getPriorityColor(task.priority)} hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{task.title}</h4>
                  {isUrgent && (
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{task.type}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Clock size={12} className="text-gray-500" />
                  <span className={`font-medium ${isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                    Due {daysUntil}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-500 text-sm">No upcoming tasks</div>
          )}
        </div>
      </div>

      {/* Calendar Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.priority === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}