import { toast } from 'sonner';
import { PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function CourseProgress({ courses = [] }: { courses?: any[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Courses
        </button>
      </div>
      
      <div className="space-y-4">
        {courses.length > 0 ? courses.map((course, index) => (
          <div
            key={index}
            className="group p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate(`/dashboard/courses/${course.id}`)}
          >
            <div className="flex gap-4">
              {/* Course Thumbnail */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <div className={`w-full h-full bg-gradient-to-br ${
                  course.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                  course.color === 'green' ? 'from-green-500 to-emerald-500' :
                  'from-purple-500 to-pink-500'
                } flex items-center justify-center`}>
                  <PlayCircle className="text-white" size={32} />
                </div>
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(course.progress)}% Complete
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {course.progress === 100 ? (
                        <>
                          <CheckCircle size={12} className="text-green-600" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          {course.timeLeft}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        course.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        course.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/courses/${course.id}`);
                  }}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  course.progress === 100
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}>
                  {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No courses in progress. Explore our catalog!</p>
          </div>
        )}
      </div>
    </div>
  );
}