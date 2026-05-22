import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft, Play, CheckCircle, Lock, Clock, Users, Award, BookOpen,
  FileText, Download, Video, Star, Share2, ShoppingCart, Info, BarChart3, X
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { resolveMediaUrl } from '../../lib/mediaUrl';
import { Separator } from '../components/ui/separator';
import { coursesAPI, userAPI } from '../../lib/api';

export function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const courseData = await coursesAPI.getById(courseId!);
      setCourse(courseData);
      
      const enrollData = await userAPI.getEnrollment(courseId!);
      setEnrollment(enrollData);
      
      if (enrollData && enrollData.payment_status === 'paid') {
        setActiveTab('content');
      }
    } catch (error) {
      console.error('Error fetching course detail:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      await coursesAPI.buy(courseId!);
      toast.success('Course purchased successfully!');
      fetchData();
    } catch (error) {
      toast.error('Purchase failed');
    }
  };

  const handleContentComplete = async (contentId: number) => {
    if (!enrollment) return;
    
    // Skip if already completed
    if (enrollment.completed_contents?.some((c: any) => c.content_id === contentId)) {
      return;
    }

    try {
      const res = await userAPI.completeContent(enrollment.id, contentId.toString());
      setEnrollment({ 
        ...enrollment, 
        progress: res.progress,
        completed_contents: [...(enrollment.completed_contents || []), { content_id: contentId }]
      });
      toast.success('Content marked as completed!');
    } catch (error) {
      console.error('Failed to complete content:', error);
    }
  };

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  const handleQuizAnswer = (questionId: number, optionId: number) => {
    const newAnswers = [...quizAnswers];
    const existingIdx = newAnswers.findIndex(a => a.question_id === questionId);
    if (existingIdx > -1) {
      newAnswers[existingIdx].selected_option_id = optionId;
    } else {
      newAnswers.push({ question_id: questionId, selected_option_id: optionId });
    }
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    if (!activeQuiz || !course) return;
    try {
      setIsSubmittingQuiz(true);
      const res = await userAPI.submitQuiz(activeQuiz.id, {
        course_id: course.id,
        answers: quizAnswers
      });
      setQuizResult(res);
      toast.success(`Quiz completed! Your score: ${res.score}%`);
      fetchData(); // Refresh enrollment data
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <Button onClick={() => navigate('/dashboard/courses')}>Back to Courses</Button>
      </div>
    );
  }

  const isPurchased = enrollment && enrollment.payment_status === 'paid';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <button
        onClick={() => navigate('/dashboard/courses')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Courses
      </button>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden h-[400px] shadow-2xl">
        <img
          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <Badge className="mb-4 bg-blue-600 border-none px-4 py-1 text-sm">{course.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-gray-200">
            <span className="flex items-center gap-2 font-medium"><Users size={18} /> {course.enrolled_count || 0} Students</span>
            <span className="flex items-center gap-2 font-medium"><Clock size={18} /> {course.duration || 'Self-paced'}</span>
            <span className="flex items-center gap-2 font-medium"><Star size={18} className="text-amber-400 fill-amber-400" /> 4.8 Rating</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100/50 p-1 rounded-2xl">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold">Overview</TabsTrigger>
              <TabsTrigger value="content" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold" disabled={!isPurchased}>Course Content</TabsTrigger>
              <TabsTrigger value="instructor" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in duration-500">
              <Card className="p-8 border-gray-100 shadow-sm rounded-3xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About this course</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{course.description}</p>
              </Card>
              
              <Card className="p-8 border-gray-100 shadow-sm rounded-3xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What you will learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Foundational concepts', 'Best Diagnostic Skills', 'Industry best practices', 'Certification exam prep'].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-6 space-y-6 animate-in fade-in duration-500">
              {selectedContent && (
                <Card className="p-4 bg-black rounded-3xl overflow-hidden shadow-2xl border-none">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h4 className="text-white font-bold">{selectedContent.title}</h4>
                    <Button variant="ghost" className="text-white hover:bg-white/20" size="sm" onClick={() => setSelectedContent(null)}>
                      <X size={20} />
                    </Button>
                  </div>
                  {selectedContent.content_type === 'video' ? (
                    <video 
                      src={resolveMediaUrl(selectedContent.url)} 
                      controls 
                      className="w-full aspect-video rounded-2xl"
                      controlsList="nodownload"
                      onEnded={() => handleContentComplete(selectedContent.id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="bg-white rounded-2xl h-[600px]">
                      <iframe 
                        src={resolveMediaUrl(selectedContent.url)} 
                        className="w-full h-full rounded-2xl"
                        title={selectedContent.title}
                      />
                    </div>
                  )}
                </Card>
              )}

              {course.contents?.length > 0 ? (
                <div className="space-y-4">
                  {course.contents.map((item: any, idx: number) => (
                    <Card 
                      key={idx} 
                      className={`p-4 hover:border-blue-300 transition-all cursor-pointer group rounded-2xl border-gray-100 shadow-sm ${selectedContent?.url === item.url ? 'border-blue-500 bg-blue-50/30' : ''}`}
                      onClick={() => {
                        setSelectedContent(item);
                        if (item.content_type === 'pdf') {
                          handleContentComplete(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.content_type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {enrollment?.completed_contents?.some((c: any) => c.content_id === item.id) ? (
                              <CheckCircle className="text-green-500" size={24} />
                            ) : (
                              item.content_type === 'video' ? <Video size={24} /> : <FileText size={24} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">{item.content_type}</p>
                          </div>
                        </div>
                        <Button 
                          variant={selectedContent?.url === item.url ? "default" : "outline"} 
                          size="sm" 
                          className="rounded-full px-6"
                        >
                          {enrollment?.completed_contents?.some((c: any) => c.content_id === item.id) ? 'Completed' : (selectedContent?.url === item.url ? 'Playing' : 'View')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed">
                  <Info size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No multimedia content added yet.</p>
                </div>
              )}

              {/* Quizzes Section */}
              {course.quizzes?.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 px-2">Assessments</h3>
                  {course.quizzes.map((quiz: any, idx: number) => (
                    <Card key={idx} className="p-6 border-green-100 bg-green-50/20 rounded-3xl hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <BarChart3 size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{quiz.title}</h4>
                            <p className="text-sm text-gray-600">{quiz.questions?.length || 0} Questions</p>
                          </div>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 rounded-full px-8" onClick={() => startQuiz(quiz)}>
                          Start Quiz
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructor" className="mt-6 animate-in fade-in duration-500">
              <Card className="p-8 border-gray-100 shadow-sm rounded-3xl">
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-50 ring-offset-2">
                    <AvatarImage src={resolveMediaUrl(course.instructor?.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=random`} />
                    <AvatarFallback>{course.instructor?.name?.charAt(0) || 'I'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{course.instructor?.name || 'Expert Instructor'}</h3>
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">Course Creator</p>
                    <p className="text-sm text-gray-500 mt-1">{course.instructor?.email}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {course.instructor?.bio || "With years of industry experience and a passion for teaching, our instructors bring real-world knowledge directly to your screen."}
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full px-8 font-bold">Follow</Button>
                  <Button className="bg-gray-900 hover:bg-black rounded-full px-8 font-bold">View Profile</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info/Purchase Card */}
        <div className="space-y-6">
          <Card className="p-8 sticky top-6 border-gray-100 shadow-xl rounded-3xl overflow-hidden">
            {!isPurchased ? (
              <div className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">${course.price || 0}</span>
                  <span className="text-gray-500 line-through text-lg font-medium">$199.99</span>
                </div>
                <p className="text-green-600 font-bold flex items-center gap-2">
                  <Clock size={16} /> Limited time offer: 80% off!
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleBuy}
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg hover:shadow-blue-200 transition-all gap-3"
                  >
                    <ShoppingCart size={22} />
                    Buy Now
                  </Button>
                  <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl border-2">
                    Add to Cart
                  </Button>
                </div>
                <p className="text-center text-xs text-gray-400 font-medium">30-Day Money-Back Guarantee</p>
                
                <Separator />
                
                <div className="space-y-4">
                  <p className="font-bold text-gray-900">This course includes:</p>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-3"><Play size={16} className="text-blue-500" /> Lifetime access</li>
                    <li className="flex items-center gap-3"><FileText size={16} className="text-blue-500" /> {course.contents?.length || 0} Downloadable resources</li>
                    <li className="flex items-center gap-3"><BarChart3 size={16} className="text-blue-500" /> {course.quizzes?.length || 0} Quizzes</li>
                    <li className="flex items-center gap-3"><Award size={16} className="text-blue-500" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">Enrolled</h3>
                  <p className="text-green-700 text-sm font-medium">You have full access</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Your Progress</span>
                    <span className="font-bold text-gray-900">{Math.round(enrollment.progress || 0)}%</span>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-3 rounded-full" />
                </div>
                
                <Button 
                  onClick={() => setActiveTab('content')}
                  className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-black rounded-2xl shadow-xl transition-all"
                >
                  Go to Content
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{activeQuiz.title}</h3>
                <p className="text-green-100 text-sm">Assessment in progress</p>
              </div>
              <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {!quizResult ? (
                <div className="space-y-8">
                  {/* Step Progress */}
                  <div className="flex gap-2">
                    {activeQuiz.questions.map((_: any, i: number) => (
                      <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${i <= quizStep ? 'bg-green-500' : 'bg-gray-100'}`} />
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-green-600 font-bold text-sm uppercase tracking-widest">Question {quizStep + 1} of {activeQuiz.questions.length}</span>
                      <h4 className="text-2xl font-bold text-gray-900">{activeQuiz.questions[quizStep].question_text}</h4>
                    </div>

                    <div className="grid gap-3">
                      {activeQuiz.questions[quizStep].options.map((opt: any) => {
                        const isSelected = quizAnswers.find(a => a.question_id === activeQuiz.questions[quizStep].id)?.selected_option_id === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleQuizAnswer(activeQuiz.questions[quizStep].id, opt.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between group ${
                              isSelected 
                                ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]' 
                                : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700 group-hover:text-gray-900'}`}>{opt.option_text}</span>
                            {isSelected && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"><CheckCircle size={14} /></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setQuizStep(Math.max(0, quizStep - 1))}
                      disabled={quizStep === 0}
                      className="rounded-xl px-6 h-12 font-bold"
                    >
                      Previous
                    </Button>
                    {quizStep < activeQuiz.questions.length - 1 ? (
                      <Button
                        onClick={() => setQuizStep(quizStep + 1)}
                        disabled={!quizAnswers.find(a => a.question_id === activeQuiz.questions[quizStep].id)}
                        className="rounded-xl px-10 h-12 font-bold bg-green-600 hover:bg-green-700"
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        onClick={submitQuiz}
                        disabled={isSubmittingQuiz || !quizAnswers.find(a => a.question_id === activeQuiz.questions[quizStep].id)}
                        className="rounded-xl px-10 h-12 font-bold bg-gray-900 hover:bg-black"
                      >
                        {isSubmittingQuiz ? 'Submitting...' : 'Submit Assessment'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-8 animate-in zoom-in duration-500">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl ${quizResult.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {quizResult.passed ? <Award size={48} /> : <X size={48} />}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-gray-900">{quizResult.passed ? 'Congratulations!' : 'Keep Practicing!'}</h3>
                    <p className="text-gray-600 text-lg">You scored <span className="font-bold text-gray-900">{quizResult.score}%</span> on this assessment.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-sm text-gray-500 mb-1">Correct</p>
                      <p className="text-xl font-bold text-green-600">{quizResult.correct_answers}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-sm text-gray-500 mb-1">Total</p>
                      <p className="text-xl font-bold text-gray-900">{quizResult.total_questions}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => setActiveQuiz(null)} className="w-full h-14 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700">
                      Back to Course
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
