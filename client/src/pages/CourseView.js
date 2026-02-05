import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, lessonAPI } from '../services/apiService';
import { mockCourseDetail } from '../services/mockData';
import { trackLesson } from '../services/xapiService';
import VideoPlayer from '../components/VideoPlayer';
import QuizInterface from '../components/QuizInterface';
import DiscussionBoard from '../components/DiscussionBoard';
import CourseReviews from '../components/CourseReviews';

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, quiz, discussion
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await courseAPI.getCourseById(courseId);
      if (response.data.success) {
        const courseData = response.data.data;
        setCourse(courseData);
        setModules(courseData.modules || []);

        // Auto-expand first module and load first lesson
        if (courseData.modules?.length > 0) {
          setExpandedModules([courseData.modules[0].module_id]);
          if (courseData.modules[0].lessons?.length > 0) {
            loadLesson(courseData.modules[0].lessons[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      // Mock data handling omitted for cleaner production code, can be restored if needed
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lesson) => {
    try {
      setCurrentLesson(lesson);
      setActiveTab('content');
      trackLesson.viewed(lesson.lesson_id, lesson.content_type);

      // We now fetch full content in getCourseById, but check if we need more details
      // (Leaving this check for robustness if API changes back)
      if (lesson.content_type !== 'video' && !lesson.content_text) {
        const response = await lessonAPI.getLessonContent(lesson.lesson_id);
        if (response.data.success) {
          setCurrentLesson(prev => ({ ...prev, ...response.data.data }));
        }
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonComplete = async () => {
    if (currentLesson) {
      try {
        await lessonAPI.updateProgress({
          lesson_id: currentLesson.lesson_id,
          is_completed: true,
          progress_percentage: 100,
        });
        trackLesson.completed(currentLesson.lesson_id);
        fetchCourseData();
      } catch (error) {
        console.error('Failed to mark lesson complete:', error);
      }
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson || !modules.length) return;

    let currentModuleIndex = -1;
    let currentLessonIndex = -1;

    // Find current position
    for (let m = 0; m < modules.length; m++) {
      const lessonIdx = modules[m].lessons?.findIndex(l => l.lesson_id === currentLesson.lesson_id);
      if (lessonIdx !== -1 && lessonIdx !== undefined) {
        currentModuleIndex = m;
        currentLessonIndex = lessonIdx;
        break;
      }
    }

    if (currentModuleIndex === -1) return;

    // Check same module
    if (currentLessonIndex < modules[currentModuleIndex].lessons.length - 1) {
      loadLesson(modules[currentModuleIndex].lessons[currentLessonIndex + 1]);
      return;
    }

    // Check next module
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        // Auto-expand next module
        if (!expandedModules.includes(nextModule.module_id)) {
          setExpandedModules(prev => [...prev, nextModule.module_id]);
        }
        loadLesson(nextModule.lessons[0]);
      }
    }
  };

  const handlePrevLesson = () => {
    if (!currentLesson || !modules.length) return;

    let currentModuleIndex = -1;
    let currentLessonIndex = -1;

    // Find current position
    for (let m = 0; m < modules.length; m++) {
      const lessonIdx = modules[m].lessons?.findIndex(l => l.lesson_id === currentLesson.lesson_id);
      if (lessonIdx !== -1 && lessonIdx !== undefined) {
        currentModuleIndex = m;
        currentLessonIndex = lessonIdx;
        break;
      }
    }

    if (currentModuleIndex === -1) return;

    // Check same module previous lesson
    if (currentLessonIndex > 0) {
      loadLesson(modules[currentModuleIndex].lessons[currentLessonIndex - 1]);
      return;
    }

    // Check previous module
    if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        // Auto-expand prev module
        if (!expandedModules.includes(prevModule.module_id)) {
          setExpandedModules(prev => [...prev, prevModule.module_id]);
        }
        // Load last lesson of previous module
        loadLesson(prevModule.lessons[prevModule.lessons.length - 1]);
      }
    }
  };

  const loadQuiz = (quiz, module) => {
    setSelectedQuiz(quiz);
    setSelectedModule(module);
    setActiveTab('quiz');
  };

  const loadDiscussion = (module) => {
    setSelectedModule(module);
    setActiveTab('discussion');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Course not found</h2>
          <button onClick={() => navigate('/courses')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Go to Courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{course.title}</h1>
          <div className="mt-2 flex items-center text-emerald-200 text-sm">
            <span className="mr-4">by {course.instructor_name}</span>
            <span>• {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-180px)]">

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 h-auto lg:h-full">
            {activeTab === 'content' && (
              <>
                {currentLesson ? (
                  <div className="flex flex-col h-auto lg:h-full">
                    {/* Video Player Section */}
                    {currentLesson.content_type === 'video' && (
                      <div className="w-full">
                        <VideoPlayer
                          lessonId={currentLesson.lesson_id}
                          videoUrl={currentLesson.content_url || currentLesson.video_url}
                          onComplete={handleLessonComplete}
                          onNext={handleNextLesson}
                          onPrev={() => handlePrevLesson()}
                        />
                      </div>
                    )}

                    {/* Content Header & Description */}
                    <div className="p-3 lg:p-6 flex-1 lg:overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between mb-2 lg:mb-4">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{currentLesson.title}</h2>
                        {currentLesson.content_type !== 'video' && (
                          <button
                            onClick={handleLessonComplete}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentLesson.is_completed
                              ? 'bg-green-100 text-green-800 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                              }`}
                          >
                            {currentLesson.is_completed ? '✓ Completed' : 'Mark Complete'}
                          </button>
                        )}
                      </div>

                      {/* Text Content */}
                      {(currentLesson.content_type === 'reading' || currentLesson.content_type === 'case_study') && (
                        <div
                          className="prose prose-indigo dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: currentLesson.content_text || currentLesson.content }}
                        />
                      )}

                      {/* Document Content */}
                      {currentLesson.content_type === 'document' && (currentLesson.content_url) && (
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                          <span className="text-4xl mr-4">📄</span>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Attached Document</h3>
                            <a
                              href={currentLesson.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                            >
                              Download / View
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 lg:h-full text-gray-500">
                    <span className="text-6xl mb-4">👈</span>
                    <p className="text-xl font-medium">Select a lesson to begin learning</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'quiz' && selectedQuiz && (
              <div className="h-auto lg:h-full lg:overflow-y-auto p-6 custom-scrollbar">
                <QuizInterface
                  quizId={selectedQuiz.quiz_id}
                  onComplete={() => setActiveTab('content')}
                />
              </div>
            )}

            {activeTab === 'discussion' && selectedModule && (
              <div className="h-auto lg:h-full lg:overflow-y-auto p-6 custom-scrollbar">
                <DiscussionBoard moduleId={selectedModule.module_id} />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="h-auto lg:h-full lg:overflow-y-auto p-6 custom-scrollbar">
                <CourseReviews courseId={courseId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-800/30 overflow-hidden h-auto lg:h-full">
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-500">
              <h3 className="font-bold text-white">Course Content</h3>
            </div>

            <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-2 space-y-2 max-h-[500px] lg:max-h-none">
              {modules.map((module) => (
                <div key={module.module_id} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div
                    className="p-3 bg-gray-50 dark:bg-gray-900/50 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleModule(module.module_id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm font-semibold">{expandedModules.includes(module.module_id) ? '📂' : '📁'}</span>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{module.title}</h4>
                    </div>
                    <span className="text-gray-400 text-xs">{expandedModules.includes(module.module_id) ? '▼' : '▶'}</span>
                  </div>

                  {expandedModules.includes(module.module_id) && (
                    <div className="bg-white dark:bg-gray-800">
                      {module.lessons?.map((lesson) => (
                        <div
                          key={lesson.lesson_id}
                          onClick={() => loadLesson(lesson)}
                          className={`
                            px-4 py-3 cursor-pointer flex items-center gap-3 border-l-4 transition-all
                            ${currentLesson?.lesson_id === lesson.lesson_id
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}
                          `}
                        >
                          <div className={`p-1.5 rounded-full ${lesson.content_type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {lesson.content_type === 'video' && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>}
                            {lesson.content_type !== 'video' && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${currentLesson?.lesson_id === lesson.lesson_id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              {lesson.duration_minutes > 0 && <span>{lesson.duration_minutes}m</span>}
                              {lesson.is_completed && <span className="text-green-600 font-bold">✓ Done</span>}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Quizzes & Discussions */}
                      {module.quizzes?.map((quiz) => (
                        <div key={quiz.quiz_id} onClick={() => loadQuiz(quiz, module)} className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-purple-500">📝</span> {quiz.title}
                        </div>
                      ))}
                      <div onClick={() => loadDiscussion(module)} className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-blue-500">💬</span> Discussion Board
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Course Reviews Button */}
              <div
                onClick={() => setActiveTab('reviews')}
                className={`mx-2 mt-4 p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
              >
                <span className="text-lg">⭐</span>
                <span className="font-semibold">Course Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
