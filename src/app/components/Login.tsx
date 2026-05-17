import { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, GraduationCap } from 'lucide-react';
import { authAPI } from '../../lib/api';
import { toast } from 'sonner';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Store JWT token
      localStorage.setItem('token', response.access_token);
      
      // Store user role and name for UI persistence if needed, but not full object
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('userName', response.user.name);

      toast.success('Successful Login');

      // Route to appropriate dashboard based on role
      if (response.user.role === 'admin') {
        window.history.pushState({}, '', '/admin/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-10 animate-float">
          <GraduationCap className="text-white/20" size={40} />
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-2000">
          <Sparkles className="text-white/20" size={32} />
        </div>
        <div className="absolute bottom-32 right-40 animate-float animation-delay-4000">
          <GraduationCap className="text-white/20" size={36} />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float animation-delay-1000">
          <Sparkles className="text-white/20" size={28} />
        </div>
      </div>


      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-8 animate-slide-in-left">
          <div className="flex items-center gap-3 mb-8">
            <img src="/2.svg" alt="Medsphere Logo" className="h-16 w-auto" />
          </div>
          
          <h1 className="text-5xl font-bold leading-tight">
            Welcome Back to Your Learning Journey
          </h1>
          
          <p className="text-xl text-blue-100 leading-relaxed">
            Continue advancing your career in aged care with Australia's most trusted e-learning platform.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm text-blue-100">Active Learners</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-sm text-blue-100">Courses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sm text-blue-100">Satisfaction</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-blue-50 italic mb-3">
              "This platform transformed my career. The flexibility and quality of courses are outstanding!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <div className="font-semibold">Jessica Davis</div>
                <div className="text-sm text-blue-200">Care Coordinator, Sydney</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/2.svg" alt="Medsphere Logo" className="h-12 w-auto" />
            </a>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue your learning journey</p>
            </div>


            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Mail className="text-gray-400 group-focus-within:text-blue-600" size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Lock className="text-gray-400 group-focus-within:text-blue-600" size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold hover:scale-105 active:scale-95"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button className="group py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Google</span>
              </button>
              <button className="group py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-gray-600">
              Don't have an account?{' '}
              <a href="#signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline">
                Sign up now
              </a>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a href="#" className="text-white hover:text-blue-100 text-sm font-medium transition-colors inline-flex items-center gap-2 hover:gap-3">
              ← Back to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
