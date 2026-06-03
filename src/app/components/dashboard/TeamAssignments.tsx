import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, ChevronDown, ChevronRight, Loader2, MapPin, Users } from 'lucide-react';
import { userAPI } from '../../../lib/api';

export function TeamAssignments() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await userAPI.getMyTeams();
        setTeams(data);
        if (data.length > 0) {
          setExpandedTeamId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch learner teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center justify-center min-h-32">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="text-blue-600" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Teams</h2>
            <p className="text-sm text-gray-600">Team-based course guidance will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Users className="text-blue-600" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Teams</h2>
          <p className="text-sm text-gray-600">Open a team to view the courses you need to complete.</p>
        </div>
      </div>

      <div className="space-y-3">
        {teams.map((team) => {
          const isExpanded = expandedTeamId === team.id;
          const courses = team.courses || [];
          const completedCourses = courses.filter((course: any) => course.status === 'completed').length;

          return (
            <div key={team.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                    {team.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {team.location}
                      </span>
                    )}
                    <span>{completedCourses} of {courses.length} courses completed</span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500 flex-shrink-0" size={20} />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 bg-gray-50/60">
                  {courses.length === 0 ? (
                    <div className="p-4 rounded-lg bg-white border border-dashed border-gray-200 text-sm text-gray-500 text-center">
                      No courses have been assigned to this team yet.
                    </div>
                  ) : (
                    courses.map((course: any) => (
                      <button
                        key={course.id}
                        onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                        className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="text-blue-600" size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                                course.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : course.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {course.status === 'completed' ? 'Done' : course.status === 'in-progress' ? 'Doing' : 'Start'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {course.completed_items || 0} of {course.total_items || 0} items complete
                            </p>
                            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${Math.min(course.progress || 0, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
