import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { coursesAPI, adminAPI } from '../../../lib/api';
import {
  Plus,
  FileText,
  Wand2,
  Users,
  Download,

  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileVideo,
  File,
  MessageSquare,
  ClipboardList,
  X,
  UserPlus,
  Save,
  Copy,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Info,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export function CourseManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: 0,
    type: 'Video',
    category: 'General',
    duration: '',
    contents: [] as any[],
    quizzes: [] as any[]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'pdf') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(0);
        
        // Show which file is being uploaded in the toast if there are multiple
        const loadingToast = files.length > 1 
          ? toast.loading(`Uploading ${i + 1}/${files.length}: ${file.name}`)
          : null;

        try {
          const res = await adminAPI.uploadFile(file, (percent) => {
            setUploadProgress(percent);
          });
          
          setCourseForm(prev => ({
            ...prev,
            contents: [...prev.contents, { 
              title: file.name, 
              content_type: type, 
              url: res.url, 
              order: prev.contents.length 
            }]
          }));
          
          if (loadingToast) toast.dismiss(loadingToast);
        } catch (error) {
          if (loadingToast) toast.dismiss(loadingToast);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      toast.success(`${files.length > 1 ? 'All files' : (type === 'video' ? 'Video' : 'PDF')} uploaded successfully!`);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addContentItem = (type: 'video' | 'pdf') => {
    setCourseForm({
      ...courseForm,
      contents: [...courseForm.contents, { title: '', content_type: type, url: '', order: courseForm.contents.length }]
    });
  };

  const removeContentItem = (index: number) => {
    const newContents = [...courseForm.contents];
    newContents.splice(index, 1);
    setCourseForm({ ...courseForm, contents: newContents });
  };

  const updateContentItem = (index: number, field: string, value: any) => {
    const newContents = [...courseForm.contents];
    newContents[index] = { ...newContents[index], [field]: value };
    setCourseForm({ ...courseForm, contents: newContents });
  };

  const addQuiz = () => {
    setCourseForm({
      ...courseForm,
      quizzes: [...courseForm.quizzes, { title: 'New Quiz', questions: [] }]
    });
  };

  const addQuestion = (quizIndex: number) => {
    const newQuizzes = [...courseForm.quizzes];
    newQuizzes[quizIndex].questions.push({ question_text: '', options: [{ option_text: '', is_correct: false }] });
    setCourseForm({ ...courseForm, quizzes: newQuizzes });
  };

  const addOption = (quizIndex: number, qIndex: number) => {
    const newQuizzes = [...courseForm.quizzes];
    newQuizzes[quizIndex].questions[qIndex].options.push({ option_text: '', is_correct: false });
    setCourseForm({ ...courseForm, quizzes: newQuizzes });
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  useEffect(() => {
    if (searchParams.get('create') !== 'true') return;
    setCourseForm({
      title: '',
      description: '',
      price: 0,
      type: 'Video',
      category: 'General',
      duration: '',
      contents: [],
      quizzes: [],
    });
    setSelectedCourse(null);
    setCurrentStep(1);
    setShowCourseModal(true);
    const next = new URLSearchParams(searchParams);
    next.delete('create');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await coursesAPI.getAll(status);
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOptions = [
    {
      title: 'Start from Blank',
      description: 'Build a course from scratch with our editor',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Use Template',
      description: 'Choose from pre-built course templates',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'AI Course Creator',
      description: 'Let AI help you create course content',
      icon: Wand2,
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Create Quiz',
      description: 'Build assessments and quizzes',
      icon: ClipboardList,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Survey/Feedback',
      description: 'Create surveys and feedback forms',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleCreateCourse = (type: string) => {
    setShowCourseModal(true);
    setShowCreateMenu(false);
    toast.success(`Opening ${type} creator`);
  };

  const handleSaveCourse = async () => {
    try {
      if (selectedCourse) {
        await coursesAPI.update(selectedCourse.id, courseForm);
        toast.success('Course updated successfully!');
      } else {
        await coursesAPI.create(courseForm);
        toast.success('Course created successfully!');
      }
      setShowSuccess(true);
      setCourseForm({
        title: '',
        description: '',
        price: 0,
        type: 'Video',
        category: 'General',
        duration: '',
        contents: [],
        quizzes: []
      });
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to save course';
      toast.error(message);
      console.error('Error saving course:', error);
    }
  };



  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price || 0,
      type: course.type,
      category: course.category || 'General',
      duration: course.duration || '',
      contents: course.contents || [],
      quizzes: course.quizzes || []
    });
    setCurrentStep(1);
    setShowCourseModal(true);
    setOpenMenuId(null);
    toast.info('Editing course');
  };



  const handleExport = (course: any, format: string) => {
    setSelectedCourse(course);
    setShowExportModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = (course: any) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    try {
      await coursesAPI.delete(selectedCourse.id);
      toast.success(`Course "${selectedCourse?.title}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create, publish, and manage all your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCourseForm({
                title: '',
                description: '',
                price: 0,
                type: 'Video',
                category: 'General',
                duration: '',
                contents: [],
                quizzes: []
              });
              setSelectedCourse(null);
              setCurrentStep(1);
              setShowCourseModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold hover:scale-105"
          >
            <Plus size={20} />
            Create Course
          </button>
        </div>
      </div>

      {/* Create Course Menu */}
      {showCreateMenu && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Choose Creation Method</h3>
            <button onClick={() => setShowCreateMenu(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {createOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleCreateCourse(option.title)}
                  className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Search courses by title, type, or status..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2 font-medium">
            <Filter size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {['all', 'draft', 'published', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Courses
            </button>
          ))}
        </div>

        {/* Courses Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Course Title</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Enrolled</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Completed</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Last Updated</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{course.title}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {course.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {course.status === 'published' ? (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-green-600 font-medium">Published</span>
                          </>
                        ) : course.status === 'draft' ? (
                          <>
                            <Clock size={16} className="text-orange-600" />
                            <span className="text-orange-600 font-medium">Draft</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-gray-600" />
                            <span className="text-gray-600 font-medium">Archived</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{course.enrolled}</td>
                    <td className="py-4 px-4 text-gray-700">{course.completed}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{course.lastUpdated}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit size={18} className="text-gray-600 group-hover:text-purple-600" />
                        </button>

                        <button 
                            onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-gray-400 group-hover:text-red-600" />
                          </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} className="text-gray-600" />
                          </button>
                          {openMenuId === course.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-10 animate-scale-in">

                              <button
                                onClick={async () => {
                                  try {
                                    const copy = { ...course, title: `${course.title} (Copy)`, id: undefined };
                                    await coursesAPI.create(copy);
                                    toast.success('Course duplicated!');
                                    fetchCourses();
                                    setOpenMenuId(null);
                                  } catch (error) {
                                    toast.error('Duplication failed');
                                  }
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                              >
                                <Copy size={16} /> Duplicate Course
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    if (course.status === 'archived') {
                                      await coursesAPI.publish(course.id);
                                      toast.success('Course published!');
                                    } else {
                                      await coursesAPI.archive(course.id);
                                      toast.success('Course archived!');
                                    }
                                    fetchCourses();
                                    setOpenMenuId(null);
                                  } catch (error) {
                                    toast.error('Status update failed');
                                  }
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                              >
                                {course.status === 'archived' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {course.status === 'archived' ? 'Publish' : 'Archive'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowDeleteModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Delete Course
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showSuccess ? 'Success!' : selectedCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button 
                onClick={() => {
                  setShowCourseModal(false);
                  setShowSuccess(false);
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {showSuccess ? (
                <div className="py-12 text-center space-y-4 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Submitted!</h3>
                  <p className="text-gray-600 text-lg max-w-sm mx-auto">
                    Your course has been successfully created and added to the platform.
                  </p>
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setShowCourseModal(false);
                        setShowSuccess(false);
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step Indicators */}
              <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-100'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: General Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Step 1: General Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter course title"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter course description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                      <input
                        type="number"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Videos */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-gray-900">Step 2: Course Videos</h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <button className={`px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-white ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={isUploading}>
                        {isUploading ? <Clock className="animate-spin" size={18} /> : <FileVideo size={18} />}
                        {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
                      </button>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {courseForm.contents.filter(c => c.content_type === 'video').map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileVideo className="text-blue-600" size={20} />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newContents = courseForm.contents.filter(c => c !== item);
                            setCourseForm({ ...courseForm, contents: newContents });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {courseForm.contents.filter(c => c.content_type === 'video').length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
                        <p className="text-gray-500">No videos uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: PDFs */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-gray-900">Step 3: Document Resources (PDF)</h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'pdf')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <button className={`px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-white ${isUploading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`} disabled={isUploading}>
                        {isUploading ? <Clock className="animate-spin" size={18} /> : <FileText size={18} />}
                        {isUploading ? `Uploading ${uploadProgress}%` : 'Upload PDF'}
                      </button>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {courseForm.contents.filter(c => c.content_type === 'pdf').map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="text-purple-600" size={20} />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newContents = courseForm.contents.filter(c => c !== item);
                            setCourseForm({ ...courseForm, contents: newContents });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {courseForm.contents.filter(c => c.content_type === 'pdf').length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
                        <p className="text-gray-500">No PDFs uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Quizzes */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-gray-900">Step 4: Course Quizzes</h3>
                    <button onClick={addQuiz} className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 flex items-center gap-1">
                      <Plus size={14} /> Add Quiz
                    </button>
                  </div>

                  {courseForm.quizzes.map((quiz, qIdx) => (
                    <div key={qIdx} className="p-4 border-2 border-dashed border-green-200 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <input
                          value={quiz.title}
                          onChange={(e) => {
                            const newQuizzes = [...courseForm.quizzes];
                            newQuizzes[qIdx].title = e.target.value;
                            setCourseForm({ ...courseForm, quizzes: newQuizzes });
                          }}
                          className="font-semibold text-gray-900 bg-transparent border-b border-gray-300 w-full mr-4 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const newQuizzes = [...courseForm.quizzes];
                            newQuizzes.splice(qIdx, 1);
                            setCourseForm({ ...courseForm, quizzes: newQuizzes });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4 pl-4">
                        {quiz.questions.map((q: any, qIndex: number) => (
                          <div key={qIndex} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative">
                            <button 
                              onClick={() => {
                                const newQuizzes = [...courseForm.quizzes];
                                newQuizzes[qIdx].questions.splice(qIndex, 1);
                                setCourseForm({ ...courseForm, quizzes: newQuizzes });
                              }}
                              className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                            <input
                              placeholder={`Question ${qIndex + 1}`}
                              value={q.question_text}
                              onChange={(e) => {
                                const newQuizzes = [...courseForm.quizzes];
                                newQuizzes[qIdx].questions[qIndex].question_text = e.target.value;
                                setCourseForm({ ...courseForm, quizzes: newQuizzes });
                              }}
                              className="w-full text-sm font-medium mb-2 border-b"
                            />
                            <div className="space-y-1">
                              {q.options.map((opt: any, oIdx: number) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={opt.is_correct}
                                    onChange={() => {
                                      const newQuizzes = [...courseForm.quizzes];
                                      newQuizzes[qIdx].questions[qIndex].options.forEach((o: any, i: number) => o.is_correct = i === oIdx);
                                      setCourseForm({ ...courseForm, quizzes: newQuizzes });
                                    }}
                                  />
                                  <input
                                    placeholder={`Option ${oIdx + 1}`}
                                    value={opt.option_text}
                                    onChange={(e) => {
                                      const newQuizzes = [...courseForm.quizzes];
                                      newQuizzes[qIdx].questions[qIndex].options[oIdx].option_text = e.target.value;
                                      setCourseForm({ ...courseForm, quizzes: newQuizzes });
                                    }}
                                    className="text-xs flex-1"
                                  />
                                </div>
                              ))}
                              <button onClick={() => addOption(qIdx, qIndex)} className="text-[10px] text-blue-500 hover:underline">+ Add Option</button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addQuestion(qIdx)} className="text-xs text-green-600 font-medium">+ Add Question</button>
                      </div>
                    </div>
                  ))}
                  {courseForm.quizzes.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
                      <p className="text-gray-500">No quizzes added yet</p>
                    </div>
                  )}
                </div>
              )}
                </>
              )}
            </div>

            {!showSuccess && (
              <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowCourseModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-gray-600"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="flex gap-2">
                  {currentStep < 4 ? (
                    <button
                      onClick={() => {
                        if (currentStep === 1 && !courseForm.title) {
                          toast.error('Please enter course title');
                          return;
                        }
                        setCurrentStep(currentStep + 1);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-md"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveCourse}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg flex items-center gap-2 font-semibold"
                    >
                      <Save size={18} />
                      {selectedCourse ? 'Update Course' : 'Finish & Create'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}




      {/* Export Modal */}
      {showExportModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Export: {selectedCourse.title}</h2>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Choose export format:</p>
              <div className="grid grid-cols-2 gap-3">
                {['SCORM', 'xAPI', 'HTML', 'PDF', 'Slides', 'Word', 'Stitch Index'].map((format) => (
                  <button
                    key={format}
                    onClick={() => {
                      toast.success(`Exporting as ${format}...`);
                      setShowExportModal(false);
                    }}
                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105"
                  >
                    <Download size={24} className="text-blue-600 mb-2 mx-auto" />
                    <p className="text-sm font-semibold text-gray-900">{format}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Course?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "{selectedCourse.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
