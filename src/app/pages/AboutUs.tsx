import { useState } from 'react';
import { ArrowLeft, BookOpenCheck, HeartHandshake, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Footer } from '../components/Footer';

const values = [
  {
    icon: HeartHandshake,
    title: 'Care-first learning',
    description: 'Every course is designed around the real responsibilities, pressures, and goals of aged care workers.',
  },
  {
    icon: ShieldCheck,
    title: 'Australian compliance',
    description: 'Training content is shaped to support local care standards, quality expectations, and workplace readiness.',
  },
  {
    icon: Users,
    title: 'Practical support',
    description: 'Learners get clear pathways, useful resources, and a community that helps professional growth feel manageable.',
  },
  {
    icon: BookOpenCheck,
    title: 'Career progression',
    description: 'Certificates, progress tracking, and flexible learning help workers keep moving forward without leaving care behind.',
  },
];

export function AboutUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="relative z-20 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Medsphere Logo" className="h-10 sm:h-12 w-auto max-w-[190px] sm:max-w-none" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="/#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">Benefits</a>
            <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            <a href="/login" className="px-5 py-2.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Sign In
            </a>
            <a href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </a>
          </div>

          <button
            className="md:hidden p-2 text-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="/#features" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Features</a>
              <a href="/#benefits" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Benefits</a>
              <a href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Contact</a>
              <a href="/login" className="px-5 py-2.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors w-full text-center">
                Sign In
              </a>
              <a href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg w-full text-center">
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
            <a href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium mb-8">
              <ArrowLeft size={18} />
              Back to home
            </a>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  About Medsphere Learning
                </div>

                <div className="space-y-5">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Building confident aged care teams through better learning
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Medsphere Learning helps Australian aged care professionals keep their skills current, complete essential training, and grow their careers with courses built for the realities of care work.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">10k+</div>
                    <div className="text-gray-600">Learners supported</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">200+</div>
                    <div className="text-gray-600">Course pathways</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">24/7</div>
                    <div className="text-gray-600">Flexible access</div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Healthcare team planning professional training"
                  className="w-full h-[320px] sm:h-[440px] lg:h-[520px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
              <div>
                <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                  Our purpose
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
                  Education that respects the work, the learner, and the person receiving care
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Aged care is hands-on, human, and constantly evolving. Our platform makes professional development easier to access, easier to track, and easier to apply in day-to-day care environments.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {values.map((value) => {
                  const Icon = value.icon;
                  return (
                    <div key={value.title} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mb-5">
                        <Icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Care worker supporting an older person"
                  className="w-full h-[300px] sm:h-[380px] lg:h-[440px] object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  How we help
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Built for learners, providers, and care outcomes
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Medsphere Learning brings courses, certificates, schedules, messages, and progress into one place. That gives workers a clearer learning experience and gives organisations a better way to support compliance and development.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a href="/signup" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                    Get Started
                  </a>
                  <a href="/#contact" className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-colors">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
