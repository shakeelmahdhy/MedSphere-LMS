import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, Users, ChevronLeft, ChevronRight, Plus, Filter, X, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { scheduleAPI, authAPI } from '../../lib/api';

export function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'lesson',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, data] = await Promise.all([
          authAPI.getCurrentUser(),
          scheduleAPI.getSchedules()
        ]);
        setCurrentUser(user);
        setEvents(data);
      } catch (error) {
        console.error('Schedule load error:', error);
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      lesson: 'bg-blue-100 text-blue-700 border-blue-300',
      workshop: 'bg-green-100 text-green-700 border-green-300',
      assessment: 'bg-purple-100 text-purple-700 border-purple-300',
      meeting: 'bg-amber-100 text-amber-700 border-amber-300',
      training: 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return colors[type] || colors.lesson;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return <Users size={16} />;
      case 'assessment': return <CalendarIcon size={16} />;
      case 'training': return <Video size={16} />;
      case 'meeting': return <Users size={16} />;
      case 'lesson': return <Video size={16} />;
      default: return <CalendarIcon size={16} />;
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      try {
        const start_time = new Date(`${newEvent.date}T${newEvent.time.split(' - ')[0] || '09:00'}`);
        const end_time = new Date(`${newEvent.date}T${newEvent.time.split(' - ')[1] || '10:00'}`);
        
        const event = await scheduleAPI.createSchedule({
          title: newEvent.title,
          type: newEvent.type,
          description: newEvent.description || '',
          start_time: start_time.toISOString(),
          end_time: end_time.toISOString(),
          location: newEvent.location || 'Online',
          user_id: currentUser.id
        });
        
        setEvents(prev => [...prev, event]);
        setNewEvent({ title: '', type: 'lesson', date: '', time: '', location: '', description: '' });
        setShowAddEvent(false);
        toast.success(`Event "${event.title}" added successfully!`);
      } catch (error) {
        toast.error('Failed to add event');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    // In a real app, call API
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success(`Event deleted successfully!`);
  };

  const handleTodayItemClick = (item: any) => {
    toast.info(`Event: ${item.title} at ${new Date(item.start_time).toLocaleTimeString()}`);
  };

  const monthName = currentMonth.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  const todayEvents = events.filter(e => {
    const d = new Date(e.start_time);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    const today = new Date();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600">Manage your learning calendar and upcoming events</p>
        </div>
        <Button className="md:w-auto" onClick={() => setShowAddEvent(true)}>
          <Plus size={20} className="mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Events</p>
              <p className="text-3xl font-bold text-gray-900">{todayEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <CalendarIcon className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{thisWeekEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Workshops</p>
              <p className="text-3xl font-bold text-gray-900">{events.filter(e => e.type === 'workshop' || e.type === 'training').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assessments</p>
              <p className="text-3xl font-bold text-gray-900">{events.filter(e => e.type === 'assessment').length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Video className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar and Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Selector */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <h3 className="font-semibold text-gray-900 min-w-[150px] text-center">{monthName}</h3>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={() => toast.info('Filter options coming soon!')}>
                  <Filter size={16} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events scheduled for today</p>
              ) : todayEvents.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTodayItemClick(item)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-white border-gray-200 hover:border-blue-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-12 rounded-full bg-blue-500`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-sm text-gray-500">{item.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <Button variant="link" className="text-blue-600" onClick={() => toast.info(`${events.length} total events`)}>View All</Button>
            </div>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming events</p>
              ) : events.map((event) => (
                <Card
                  key={event.id}
                  className={`p-4 border-2 ${getEventColor(event.type)} hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => toast.info(`Event: ${event.title} on ${new Date(event.start_time).toLocaleDateString('en-AU')}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(event.type)}
                        <h4 className="font-semibold">{event.title}</h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={14} />
                          <span>{new Date(event.start_time).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Calendar Widget */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
            />
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Event Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Workshops</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-600">Assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-sm text-gray-600">Lessons</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddEvent(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Event</h3>
              <button onClick={() => setShowAddEvent(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="e.g., Dementia Care Workshop"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <select
                  id="eventType"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="lesson">Lesson</option>
                  <option value="workshop">Workshop</option>
                  <option value="assessment">Assessment</option>
                  <option value="meeting">Meeting</option>
                  <option value="training">Training</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Time *</Label>
                  <Input
                    id="eventTime"
                    placeholder="e.g., 10:00 AM - 12:00 PM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventLocation">Location</Label>
                <Input
                  id="eventLocation"
                  placeholder="e.g., Virtual, Room 101"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}