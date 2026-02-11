import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/apiService';
import { mockCourses } from '../services/mockData';
import { useAuth } from '../context/AuthContext';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, difficultyFilter, priceFilter, sortBy, courses]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.data.success) {
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses, using mock data:', error);
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((course) => course.difficulty_level === difficultyFilter);
    }

    // Apply sorting and price filtering via sortBy
    switch (sortBy) {
      case 'free':
        filtered = filtered.filter((course) => parseFloat(course.price) === 0);
        break;
      case 'paid':
        filtered = filtered.filter((course) => parseFloat(course.price) > 0);
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = (courseId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses` } });
      return;
    }
    navigate(`/course/${courseId}`);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const activeFiltersCount = (difficultyFilter !== 'all' ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/80 to-emerald-900/60">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-300 text-lg font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Filter Panel Content (reused for both desktop sidebar and mobile drawer)
  const FilterPanelContent = () => (
    <>
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-emerald-200 mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-emerald-200 mb-3">Difficulty Level</label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Levels', emoji: '✨' },
            { value: 'beginner', label: 'Beginner', emoji: '🌱' },
            { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
            { value: 'advanced', label: 'Advanced', emoji: '⚡' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${difficultyFilter === option.value
                ? 'bg-emerald-500/30 border border-emerald-500/50'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={option.value}
                checked={difficultyFilter === option.value}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="sr-only"
              />
              <span className="text-lg">{option.emoji}</span>
              <span className="text-sm text-white">{option.label}</span>
              {difficultyFilter === option.value && (
                <svg className="w-4 h-4 text-emerald-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSearchQuery('');
          setDifficultyFilter('all');
        }}
        className="w-full py-3 px-4 rounded-xl border border-white/20 text-emerald-200 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear All Filters
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-emerald-900/60">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            কোর্সের তালিকা
          </h1>
          <p className="text-lg text-emerald-200/80 max-w-2xl mx-auto">
            তোমার প্রয়োজন অনুযায়ী কোর্সটি বেঁছে নাও
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* Mobile Filter Bar */}
        <div className="lg:hidden mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-4">
            {/* Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-white/30 rounded-full text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-emerald-200/70 text-sm whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="default" className="bg-slate-800 text-white">Default</option>
                <option value="free" className="bg-slate-800 text-white">Free Courses</option>
                <option value="paid" className="bg-slate-800 text-white">Paid Courses</option>
                <option value="price-low" className="bg-slate-800 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-slate-800 text-white">Price: High to Low</option>
                <option value="newest" className="bg-slate-800 text-white">Newest First</option>
                <option value="title" className="bg-slate-800 text-white">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="mt-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterPanelContent />
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h2>
              <FilterPanelContent />
            </div>
          </aside>

          {/* Course Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-purple-200">
                <span className="font-bold text-white">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </p>
              {/* Desktop Sort */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-purple-200/70 text-sm">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                >
                  <option value="default" className="bg-slate-800 text-white">Default</option>
                  <option value="free" className="bg-slate-800 text-white">Free Courses</option>
                  <option value="paid" className="bg-slate-800 text-white">Paid Courses</option>
                  <option value="price-low" className="bg-slate-800 text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-slate-800 text-white">Price: High to Low</option>
                  <option value="newest" className="bg-slate-800 text-white">Newest First</option>
                  <option value="title" className="bg-slate-800 text-white">Title A-Z</option>
                </select>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-white mb-2">No courses found</h2>
                <p className="text-purple-200/70">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-indigo-900/50 to-purple-900/50 overflow-hidden">
                      {course.thumbnail || course.thumbnail_url ? (
                        <img
                          src={course.thumbnail || course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-50">📘</span>
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3">
                        {parseFloat(course.price) === 0 ? (
                          <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                            FREE
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-white/90 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                            ৳{parseFloat(course.price).toLocaleString('en-BD')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${getDifficultyColor(course.difficulty_level)}`}>
                          {course.difficulty_level}
                        </span>
                        {course.duration_hours > 0 && (
                          <span className="text-xs text-purple-300/70 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration_hours}h
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-purple-200/60 line-clamp-2 mb-4">
                        {course.description}
                      </p>

                      {/* Instructor */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                        {course.mentor_image ? (
                          <img src={course.mentor_image} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-sm">👤</div>
                        )}
                        <span className="text-sm text-purple-200/80">
                          {course.mentor_name || course.instructor_name || 'Admin'}
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleEnroll(course.course_id)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                      >
                        {isAuthenticated ? 'View Course' : 'Enroll Now'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
