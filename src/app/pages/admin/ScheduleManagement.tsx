import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Plus, Trash2, Search, Filter, Clock, MapPin, User, Tag } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminAPI, userAPI } from '../../../lib/api';

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: 'lesson',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    user_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // For now, get all users to assign schedules
      const [allUsers, allSchedules] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAllSchedules()
      ]);
      setUsers(allUsers);
      setSchedules(allSchedules);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.user_id || !newSchedule.start_time) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await adminAPI.createSchedule({
        ...newSchedule,
        user_id: parseInt(newSchedule.user_id)
      });
      toast.success('Schedule created successfully');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await adminAPI.deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600">Assign and manage learning schedules for all users</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={20} className="mr-2" />
          Create Schedule
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input placeholder="Search schedules..." className="pl-10" />
          </div>
          <Button variant="outline"><Filter size={20} className="mr-2" />Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-semibold text-gray-600">Event</th>
                <th className="py-4 font-semibold text-gray-600">Assigned To</th>
                <th className="py-4 font-semibold text-gray-600">Date & Time</th>
                <th className="py-4 font-semibold text-gray-600">Type</th>
                <th className="py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No schedules found</td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.location}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm">{s.user ? s.user.name : `User ID: ${s.user_id}`}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm">{new Date(s.start_time).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(s.start_time).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{s.type}</Badge>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <h3 className="text-xl font-bold">New Schedule Event</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={newSchedule.title} onChange={e => setNewSchedule({...newSchedule, title: e.target.value})} placeholder="Event Title" />
              </div>
              <div>
                <label className="text-sm font-medium">Assigned User</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={newSchedule.user_id}
                  onChange={e => setNewSchedule({...newSchedule, user_id: e.target.value})}
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="datetime-local" value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="datetime-local" value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={newSchedule.type}
                  onChange={e => setNewSchedule({...newSchedule, type: e.target.value})}
                >
                  <option value="lesson">Lesson</option>
                  <option value="workshop">Workshop</option>
                  <option value="assessment">Assessment</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={newSchedule.location} onChange={e => setNewSchedule({...newSchedule, location: e.target.value})} placeholder="Online or Room 101" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddSchedule}>Create</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
