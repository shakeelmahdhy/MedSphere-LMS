import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Medsphere Logo" className="h-20 w-auto object-cover" style={{ objectPosition: 'center', transform: 'scale(1.5)' }} />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            <a href="#login" className="px-5 py-2.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Sign In
            </a>
            <a href="#signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg">
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Benefits</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors py-2">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Contact</a>
              <a href="#login" className="px-5 py-2.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors w-full text-center">
                Sign In
              </a>
              <a href="#signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg w-full text-center">
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Trusted by 10,000+ Australian Care Workers
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Elevate Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Aged Care Career
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Australia's leading e-learning platform for aged care professionals. 
              Access certified courses, stay compliant, and advance your career—all at your own pace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.hash = 'signup'}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Start Learning Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.location.hash = 'login'}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="font-bold text-3xl text-gray-900">200+</div>
                <div className="text-gray-600">Certified Courses</div>
              </div>
              <div>
                <div className="font-bold text-3xl text-gray-900">98%</div>
                <div className="text-gray-600">Completion Rate</div>
              </div>
              <div>
                <div className="font-bold text-3xl text-gray-900">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1765896387387-0538bc9f997e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ2VkJTIwY2FyZSUyMG51cnNlJTIwZWxkZXJseSUyMHBhdGllbnR8ZW58MXx8fHwxNzcwMDMxNzkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Aged care nurse with elderly patient"
                className="w-full h-[500px] object-cover"
              />
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">NDIS Compliant</div>
                    <div className="text-sm text-gray-600">All courses meet Australian standards</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
}