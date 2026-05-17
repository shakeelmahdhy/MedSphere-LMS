import { BookOpen, Award, Clock, Users, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with decades of aged care experience across Australia.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Award,
    title: 'Nationally Recognised',
    description: 'Earn certificates recognised by the Aged Care Quality and Safety Commission.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Clock,
    title: 'Learn at Your Pace',
    description: 'Access courses 24/7 and study whenever suits your schedule—no deadlines.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join a thriving community of care workers sharing knowledge and experiences.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'Compliance Made Easy',
    description: 'Stay up-to-date with mandatory training and regulatory requirements effortlessly.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: Smartphone,
    title: 'Mobile Learning',
    description: 'Download courses and learn offline on any device, anywhere in Australia.',
    color: 'from-indigo-500 to-purple-600'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Why Choose Us
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel in Aged Care
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive training designed specifically for Australian aged care workers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
