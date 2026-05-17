import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { userAPI } from '../../lib/api';
import { Search, Filter, BookOpen, Clock, Award, TrendingUp, Play, CheckCircle, AlertCircle, X, SortAsc, SortDesc } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from 'react-router';

export function MyCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'dueDate'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await userAPI.getMyCourses();
        setCourses(data);
      } catch (error) {
        toast.error('Failed to load courses');
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.course?.category || 'General')))];

  const filteredCourses = courses.map(enrollment => ({
    ...enrollment,
    title: enrollment.course?.title || 'Untitled Course',
    category: enrollment.course?.category || 'General',
    thumbnail: enrollment.course?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
    duration: enrollment.course?.duration || '0 hours',
    instructor: 'Expert Instructor', // Placeholder as not in schema yet
    totalLessons: 10,
    completedLessons: Math.floor((enrollment.progress / 100) * 10),
  })).filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (course.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'in-progress' && course.status === 'in-progress') ||
                      (activeTab === 'completed' && course.status === 'completed') ||
                      (activeTab === 'not-started' && course.status === 'not-started');
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesTab && matchesCategory;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') comparison = (a.title || '').localeCompare(b.title || '');
    else if (sortBy === 'progress') comparison = a.progress - b.progress;
    else if (sortBy === 'dueDate') comparison = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    notStarted: courses.filter(c => c.status === 'not-started').length,
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">Manage and track your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('all'); toast.info('Showing all courses'); }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('in-progress'); toast.info('Showing in-progress courses'); }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('completed'); toast.info('Showing completed courses'); }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('not-started'); toast.info('Showing not started courses'); }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Not Started</p>
              <p className="text-3xl font-bold text-gray-900">{stats.notStarted}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Button variant="outline" className="md:w-auto" onClick={() => setShowFilterMenu(!showFilterMenu)}>
              <Filter size={20} className="mr-2" />
              Filter
              {selectedCategory !== 'all' && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
              )}
            </Button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Filter & Sort</h4>
                  <button onClick={() => setShowFilterMenu(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => { setSelectedCategory(e.target.value); toast.success(`Filtered by ${e.target.value === 'all' ? 'all categories' : e.target.value}`); }}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value as any); toast.success(`Sorting by ${e.target.value}`); }}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="title">Title</option>
                      <option value="progress">Progress</option>
                      <option value="dueDate">Due Date</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === 'asc' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => { setSortOrder('asc'); toast.success('Sorted ascending'); }}
                    >
                      <SortAsc size={14} className="mr-1" /> Asc
                    </Button>
                    <Button
                      variant={sortOrder === 'desc' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => { setSortOrder('desc'); toast.success('Sorted descending'); }}
                    >
                      <SortDesc size={14} className="mr-1" /> Desc
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => { setSelectedCategory('all'); setSortBy('title'); setSortOrder('asc'); toast.success('Filters cleared'); setShowFilterMenu(false); }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <Card 
                key={course.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/dashboard/courses/${course.course_id}`)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    {course.status === 'completed' && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle size={14} className="mr-1" />
                        Completed
                      </Badge>
                    )}
                    {course.status === 'in-progress' && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        <Play size={14} className="mr-1" />
                        In Progress
                      </Badge>
                    )}
                    {course.status === 'not-started' && (
                      <Badge className="bg-gray-500 hover:bg-gray-600">
                        Not Started
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    By {course.instructor}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-1" />
                      {course.duration}
                    </div>
                    <Button
                      size="sm"
                      variant={course.status === 'completed' ? 'outline' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/courses/${course.course_id}`);
                      }}
                    >
                      {course.status === 'completed' ? 'Review' : course.status === 'not-started' ? 'Start' : 'Continue'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}