import { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building, Sparkles, Award, BookOpen } from 'lucide-react';
import { authAPI } from '../../lib/api';
import { toast } from 'sonner';

export function Signup() {
  const [userType, setUserType] = useState<'learner' | 'admin'>('learner');
  const [adminExists, setAdminExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organisation: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await authAPI.checkAdminExists();
        setAdminExists(response.exists);
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await authAPI.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: userType
      });

      toast.success('Registration successful! Please login.');
      
      // Automatic login or redirect to login
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 left-20 animate-float">
          <Award className="text-white/20" size={48} />
        </div>
        <div className="absolute top-20 right-32 animate-float animation-delay-2000">
          <BookOpen className="text-white/20" size={36} />
        </div>
        <div className="absolute bottom-40 right-20 animate-float animation-delay-4000">
          <Sparkles className="text-white/20" size={40} />
        </div>
        <div className="absolute bottom-24 left-1/4 animate-float animation-delay-1000">
          <Award className="text-white/20" size={32} />
        </div>
        <div className="absolute top-1/2 left-10 animate-float animation-delay-3000">
          <BookOpen className="text-white/20" size={30} />
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
            Start Your Professional Development Journey
          </h1>
          
          <p className="text-xl text-purple-100 leading-relaxed">
            Join thousands of Australian aged care professionals advancing their careers through quality education.
          </p>

          {/* Benefits List */}
          <div className="space-y-4 pt-4">
            {[
              'Access 200+ certified courses anytime',
              'Earn nationally recognised certificates',
              'Learn at your own pace, 24/7',
              'Connect with a thriving community',
              'Track your progress with analytics'
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:translate-x-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-purple-50">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold mb-1">10,000+</div>
              <div className="text-sm text-purple-100">Trusted Learners</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold mb-1">NDIS</div>
              <div className="text-sm text-purple-100">Compliant</div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/2.svg" alt="Medsphere Logo" className="h-12 w-auto" />
            </a>
          </div>

          {/* Signup Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join thousands of aged care professionals</p>
            </div>

            {/* User Type Toggle - Only show for first-time admin setup */}
            {!adminExists && (
              <div className="mb-6">
                <div className="relative bg-gray-100 rounded-xl p-1 flex">
                  <div
                    className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg transition-all duration-300 ease-in-out shadow-lg ${
                      userType === 'admin' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setUserType('learner')}
                    className={`relative z-10 flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      userType === 'learner' ? 'text-white scale-105' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Learner Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('admin')}
                    className={`relative z-10 flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      userType === 'admin' ? 'text-white scale-105' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Admin Portal
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <User className="text-gray-400 group-focus-within:text-purple-600" size={20} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Mail className="text-gray-400 group-focus-within:text-purple-600" size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Organisation Input (only for admin) */}
              {userType === 'admin' && (
                <div className="group animate-slide-in">
                  <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                      <Building className="text-gray-400 group-focus-within:text-purple-600" size={20} />
                    </div>
                    <input
                      id="organisation"
                      type="text"
                      required
                      value={formData.organisation}
                      onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                      placeholder="Your Care Facility"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Lock className="text-gray-400 group-focus-within:text-purple-600" size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Create a strong password"
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

              {/* Confirm Password Input */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Lock className="text-gray-400 group-focus-within:text-purple-600" size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold hover:scale-105 active:scale-95"
              >
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-4">
              <button className="group py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Google</span>
              </button>
              <button className="group py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Facebook</span>
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <a href="#login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline">
                Sign in
              </a>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a href="#" className="text-white hover:text-purple-100 text-sm font-medium transition-colors inline-flex items-center gap-2 hover:gap-3">
              ← Back to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
