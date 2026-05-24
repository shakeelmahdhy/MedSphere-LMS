import { useState, useEffect } from 'react';
import { coursesAPI, userAPI } from '../../lib/api';
import { Search, Filter, BookOpen, Clock, Award, ShoppingCart, CheckCircle, Info, Star } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function BrowseCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [allCourses, enrollments] = await Promise.all([
        coursesAPI.getAll('published'),
        userAPI.getMyCourses()
      ]);
      setCourses(allCourses);
      setMyCourses(enrollments);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (courseId: number, title: string) => {
    try {
      await coursesAPI.buy(courseId.toString());
      const enrollments = await userAPI.getMyCourses();
      setMyCourses(enrollments);
      toast.success(`Successfully enrolled in "${title}"!`);
      navigate(`/dashboard/courses/${courseId}`);
    } catch (error) {
      toast.error('Failed to complete purchase');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600">Explore and purchase new learning materials</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search for courses..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border-gray-200">
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-blue-600 backdrop-blur-sm border-none shadow-sm">
                  {course.category}
                </Badge>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {course.duration || 'Self-paced'}
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star size={16} fill="currentColor" />
                  4.8
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                  <p className="text-2xl font-black text-gray-900">${course.price || 0}</p>
                </div>
                {myCourses.some(mc => mc.course_id === course.id) ? (
                  <Button 
                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                    className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all gap-2"
                  >
                    <CheckCircle size={18} />
                    Go to Course
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleBuy(course.id, course.title)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all gap-2"
                  >
                    <ShoppingCart size={18} />
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No courses match your search</h3>
          <p className="text-gray-600">Try using different keywords or explore other categories</p>
        </div>
      )}
    </div>
  );
}
