import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI, reviewAPI } from '../services/apiService';

const LandingPage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseCount, setCourseCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const scrollRef = React.useRef(null);
  const courseScrollRef = React.useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Courses
      try {
        const coursesRes = await courseAPI.getAllCourses();
        if (coursesRes.data.success) {
          const courses = coursesRes.data.data;
          setPopularCourses(courses.slice(0, 3));
          setCourseCount(courses.length);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }

      // Fetch Reviews
      try {
        const reviewsRes = await reviewAPI.getAllReviews();
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || reviews.length === 0) return;

    const scrollWidth = scrollContainer.scrollWidth;
    let currentScroll = 0;

    const intervalId = setInterval(() => {
      if (currentScroll >= scrollWidth - scrollContainer.clientWidth) {
        currentScroll = 0;
        scrollContainer.scrollTo({ left: 0, behavior: 'instant' }); // Reset instantly
      } else {
        currentScroll += 350; // Approxi card width + gap
        scrollContainer.scrollTo({ left: currentScroll, behavior: 'smooth' });
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(intervalId);
  }, [reviews]);

  // Auto-scroll effect for courses
  useEffect(() => {
    const scrollContainer = courseScrollRef.current;
    if (!scrollContainer || popularCourses.length === 0) return;

    const scrollWidth = scrollContainer.scrollWidth;
    let currentScroll = 0;

    const intervalId = setInterval(() => {
      if (currentScroll >= scrollWidth - scrollContainer.clientWidth) {
        currentScroll = 0;
        scrollContainer.scrollTo({ left: 0, behavior: 'instant' });
      } else {
        currentScroll += 380;
        scrollContainer.scrollTo({ left: currentScroll, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [popularCourses]);

  const features = [
    {
      icon: '🎓',
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience',
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: '📱',
      title: 'Learn Anywhere',
      description: 'Access courses on any device, anytime, anywhere you want',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: '🏆',
      title: 'Certificates',
      description: 'Earn recognized certificates upon successful course completion',
      color: 'from-pink-500 to-red-600',
    },
    {
      icon: '💬',
      title: 'Community Support',
      description: 'Join discussion forums and interact with thousands of peers',
      color: 'from-green-500 to-teal-600',
    },
  ];

  const stats = [
    { number: '6,894+', label: 'Active Students', icon: '👥' },
    { number: '50+', label: 'Expert Instructors', icon: '🎓' },
    { number: `${courseCount}+`, label: 'Quality Courses', icon: '📚' },
    { number: '68%', label: 'Completion Rate', icon: '⭐' },
  ];

  const getTagStyle = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gradient-to-r from-green-500 to-teal-500';
      case 'intermediate': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'advanced': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    }
  };

  const getTagLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Popular';
      case 'advanced': return 'Advanced';
      default: return 'New';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 dark:bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-400 dark:bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 dark:bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-yellow-300 mr-2">⭐</span>
                <span className="text-sm font-medium">Rated 4.8/5 by 6,894+ students</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
                Transform Your Future with
                <span className="block bg-gradient-to-r from-yellow-300 to-lime-300 bg-clip-text text-transparent mt-2">
                  Quality Education
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-emerald-100 dark:text-emerald-200 leading-relaxed">
                Master all the courses you need to learn to complete your HSC level as a business background student. Our platform is designed to help you succeed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="group relative px-8 py-4 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">Explore Courses</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                </Link>

                <Link
                  to="/register"
                  className="px-8 py-4 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 dark:hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Stats - 2x2 on mobile, 4 columns on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">{stat.icon}</div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-emerald-200 dark:text-emerald-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image - hidden on very small screens for better content focus */}
            <div className="relative hidden sm:block lg:block">
              <div className="relative z-10">
                <img
                  src="/hero-image.jpg"
                  alt="Students learning"
                  className="rounded-2xl lg:rounded-3xl shadow-2xl transform hover:rotate-1 lg:hover:rotate-2 transition-transform duration-300 w-full max-h-80 sm:max-h-96 lg:max-h-none object-cover"
                />

                {/* Floating Cards - hidden on mobile to prevent overflow */}
                <div className="hidden lg:block absolute -top-8 -right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 animate-float">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">📚</span>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{courseCount}+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block absolute -bottom-8 -left-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-2xl p-4 animate-float animation-delay-2000">
                  <div className="flex items-center space-x-3 text-white">
                    <span className="text-4xl">⭐</span>
                    <div>
                      <div className="text-2xl font-bold">4.8</div>
                      <div className="text-sm">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24 fill-current text-white dark:text-gray-900">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Ed-Tech Bangladesh</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 rounded-xl sm:rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-3">{feature.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 sm:line-clamp-none">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start learning with our most loved courses
            </p>
          </div>

          {loadingCourses ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : popularCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div
              ref={courseScrollRef}
              className="flex gap-6 overflow-x-auto pb-8 snap-mandatory snap-x hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {popularCourses.map((course) => (
                <div
                  key={course.course_id}
                  className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] flex-shrink-0 group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer snap-center"
                  onClick={() => navigate(`/course/${course.course_id}`)}
                >
                  <div className="relative overflow-hidden">
                    {course.thumbnail || course.thumbnail_url ? (
                      <img
                        src={course.thumbnail || course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/600x400?text=Course+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-6xl opacity-50">📘</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-2 rounded-full text-white font-bold text-sm ${getTagStyle(course.difficulty_level)}`}>
                        {getTagLabel(course.difficulty_level)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {parseFloat(course.price) === 0 ? 'FREE' : `৳${parseFloat(course.price).toLocaleString('en-BD')}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      by {course.mentor_name || course.instructor_name || 'Admin'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <span>⭐</span>
                        <span className="font-bold text-gray-900 dark:text-white">4.8</span>
                      </div>
                      {course.duration_hours > 0 && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <span>⏱️</span>
                          <span className="ml-1">{course.duration_hours}h</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.course_id}`);
                      }}
                      className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white text-center py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              View All Courses
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section - Modern Carousel */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">Trusted by Students</h2>

          {loadingReviews ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet.</p>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 snap-mandatory snap-x hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reviews.map((review) => (
                <div key={review.review_id} className="min-w-[260px] sm:min-w-[300px] md:min-w-[380px] bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 snap-center">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <img src={review.profile_picture_url || `https://ui-avatars.com/api/?name=${review.full_name}&background=random`} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 object-cover" />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{review.full_name}</div>
                      <div className="text-xs text-gray-500">{review.course_title}</div>
                    </div>
                  </div>
                  <div className="flex text-amber-500 mb-3 text-sm">
                    {[...Array(5)].map((_, i) => <span key={i}>{i < review.rating ? '★' : '☆'}</span>)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">"{review.review_text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900"></div>
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 dark:bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 dark:bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-emerald-100 dark:text-emerald-200">
            Join thousands of students already learning on our platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-5 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
            >
              Create Free Account
            </Link>
            <Link
              to="/courses"
              className="px-10 py-5 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 dark:hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 pt-16 pb-8 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Grid - Single column on mobile, 2x2 on tablet, 4 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">

            {/* Brand & About */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📚</span>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  EdTech BD
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering Bangladesh through quality online education. Learn from the best, anytime, anywhere.
              </p>
              <div className="flex items-center gap-4">
                {/* Social Media Links */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-sky-500 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/courses" className="text-gray-400 hover:text-purple-400 transition-colors">Browse Courses</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-purple-400 transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-purple-400 transition-colors">Login</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Become an Instructor</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-xl mt-0.5">📧</span>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <a href="mailto:info@edtechbd.com" className="hover:text-purple-400 transition-colors">info@edtechbd.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-xl mt-0.5">📞</span>
                  <div>
                    <p className="font-medium text-white">Phone</p>
                    <a href="tel:+8801700000000" className="hover:text-purple-400 transition-colors">+880 1700-000000</a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Our Address</h4>
              <div className="flex items-start gap-3 text-gray-400 mb-6">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="font-medium text-white mb-2">Head Office</p>
                  <p className="leading-relaxed">
                    House #42, Road #5<br />
                    Dhanmondi, Dhaka-1205<br />
                    Bangladesh
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <span className="text-xl mt-0.5">🕐</span>
                <div>
                  <p className="font-medium text-white mb-2">Working Hours</p>
                  <p className="leading-relaxed">
                    Sat - Thu: 9:00 AM - 6:00 PM<br />
                    Friday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">
                © {new Date().getFullYear()} All rights reserved to EdTech BD. Developed by <span className="text-purple-400 font-medium">Ak Azad</span>.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
