import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Floating Label Input Component - Defined outside to prevent recreation
const FloatingInput = ({ id, type, value, onChange, label, autoComplete }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
        autoComplete={autoComplete}
        className={`
          peer w-full px-4 pt-6 pb-3 
          border-2 rounded-xl
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white
          transition-all duration-300 ease-out
          outline-none
          ${isFocused || hasValue
            ? 'border-emerald-500 dark:border-emerald-400'
            : 'border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500'
          }
          ${isFocused ? 'ring-4 ring-emerald-100 dark:ring-emerald-900/50' : ''}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 
          transition-all duration-300 ease-out
          pointer-events-none
          ${isFocused || hasValue
            ? 'top-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {label}
      </label>
    </div>
  );
};

// Floating Password Input with Eye Toggle - Defined outside to prevent recreation
const FloatingPasswordInput = ({ id, value, onChange, label, autoComplete }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
        autoComplete={autoComplete}
        className={`
          peer w-full px-4 pt-6 pb-3 pr-12
          border-2 rounded-xl
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white
          transition-all duration-300 ease-out
          outline-none
          ${isFocused || hasValue
            ? 'border-emerald-500 dark:border-emerald-400'
            : 'border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500'
          }
          ${isFocused ? 'ring-4 ring-emerald-100 dark:ring-emerald-900/50' : ''}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 
          transition-all duration-300 ease-out
          pointer-events-none
          ${isFocused || hasValue
            ? 'top-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {label}
      </label>
      {/* Eye Toggle Button */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors duration-200"
        tabIndex={-1}
      >
        {showPassword ? (
          // Eye Off Icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          // Eye Icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on user role
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.svg" alt="EdTech BD" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <FloatingInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              autoComplete="email"
            />

            {/* Password */}
            <FloatingPasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              autoComplete="current-password"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>



          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-white hover:text-emerald-200 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
