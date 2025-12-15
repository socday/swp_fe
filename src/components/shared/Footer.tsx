import { Building2, Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white text-lg">FPTU HCM</h3>
            </div>
            <p className="text-sm text-gray-400">
              Multi-campus Facility Booking System for FPT University Ho Chi Minh City. 
              Streamlining room reservations across FU FPT and NVH campuses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Dashboard</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">My Bookings</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Room Search</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Help & Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Campus Locations */}
          <div className="space-y-4">
            <h3 className="text-white">Our Campuses</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white">FU FPT Campus</div>
                  <div className="text-gray-400">Lô E2a-7, Đường D1, Khu Công nghệ cao, P.Long Thạnh Mỹ, Q.9, TP.HCM</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white">NVH Campus</div>
                  <div className="text-gray-400">778 Đường Nguyễn Văn Linh, P.Tân Phú, Q.7, TP.HCM</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <a href="tel:+842873005588" className="hover:text-orange-500 transition-colors">
                  028 7300 5588
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <a href="mailto:daihocfpt@fpt.edu.vn" className="hover:text-orange-500 transition-colors">
                  daihocfpt@fpt.edu.vn
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="pt-2">
              <h4 className="text-white text-sm mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <motion.a
                  href="https://www.facebook.com/FPTU.HCM"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 p-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://www.youtube.com/@fptuniversityhcm"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 p-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/school/fpt-university"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 p-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {currentYear} FPT University Ho Chi Minh City. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
