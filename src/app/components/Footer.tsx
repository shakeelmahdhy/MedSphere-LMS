import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const handleFooterLink = (label: string) => {
    toast.info(`${label} page coming soon!`);
  };

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AC</span>
              </div>
              <span className="font-semibold text-xl text-white">Medsphere Learning</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Australia's trusted e-learning platform for aged care professionals. 
              Empowering careers through quality education.
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => toast.info('Opening Facebook page...')} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={20} />
              </button>
              <button onClick={() => toast.info('Opening Twitter page...')} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter size={20} />
              </button>
              <button onClick={() => toast.info('Opening LinkedIn page...')} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin size={20} />
              </button>
              <button onClick={() => toast.info('Opening Instagram page...')} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={20} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><button onClick={() => window.location.hash = 'signup'} className="hover:text-blue-400 transition-colors">Browse Courses</button></li>
              <li><button onClick={() => handleFooterLink('About Us')} className="hover:text-blue-400 transition-colors">About Us</button></li>
              <li><button onClick={() => handleFooterLink('How It Works')} className="hover:text-blue-400 transition-colors">How It Works</button></li>
              <li><button onClick={() => handleFooterLink('Pricing')} className="hover:text-blue-400 transition-colors">Pricing</button></li>
              <li><button onClick={() => handleFooterLink('Success Stories')} className="hover:text-blue-400 transition-colors">Success Stories</button></li>
              <li><button onClick={() => handleFooterLink('FAQ')} className="hover:text-blue-400 transition-colors">FAQ</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><button onClick={() => handleFooterLink('Help Center')} className="hover:text-blue-400 transition-colors">Help Center</button></li>
              <li><button onClick={() => handleFooterLink('Compliance Guide')} className="hover:text-blue-400 transition-colors">Compliance Guide</button></li>
              <li><button onClick={() => handleFooterLink('Blog')} className="hover:text-blue-400 transition-colors">Blog</button></li>
              <li><button onClick={() => handleFooterLink('CPD Information')} className="hover:text-blue-400 transition-colors">CPD Information</button></li>
              <li><button onClick={() => handleFooterLink('Partner With Us')} className="hover:text-blue-400 transition-colors">Partner With Us</button></li>
              <li><button onClick={() => handleFooterLink('Careers')} className="hover:text-blue-400 transition-colors">Careers</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="flex-shrink-0 mt-1 text-blue-400" size={20} />
                <div>
                  <div className="text-white">Email</div>
                  <a href="mailto:support@medspherelearning.com.au" className="hover:text-blue-400 transition-colors">
                    support@Medspherelearning.com.au
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="flex-shrink-0 mt-1 text-blue-400" size={20} />
                <div>
                  <div className="text-white">Phone</div>
                  <a href="tel:1300123456" className="hover:text-blue-400 transition-colors">
                    1300 123 456
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="flex-shrink-0 mt-1 text-blue-400" size={20} />
                <div>
                  <div className="text-white">Location</div>
                  <div>Melbourne, Victoria<br />Australia</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Medsphere Learning. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <button onClick={() => handleFooterLink('Privacy Policy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
              <button onClick={() => handleFooterLink('Terms of Service')} className="hover:text-blue-400 transition-colors">Terms of Service</button>
              <button onClick={() => handleFooterLink('Cookie Policy')} className="hover:text-blue-400 transition-colors">Cookie Policy</button>
              <button onClick={() => handleFooterLink('Accessibility')} className="hover:text-blue-400 transition-colors">Accessibility</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}