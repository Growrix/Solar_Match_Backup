import React from 'react'
import Link from 'next/link'
import { Sun, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Building } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-black-500 to-night-500 border-t border-onyx-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-lg shadow-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">SolarMatch</span>
            </div>
            <p className="text-battleship_gray-700 mb-6 leading-relaxed">
              Australia's trusted platform for connecting homeowners with verified solar installers. 
              Get quotes, calculate rebates, and go solar with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/#how-it-works"
                  className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/#rebate-calculator"
                  className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors"
                >
                  Rebate Calculator
                </Link>
              </li>
              <li>
                <Link 
                  href="/request-quote"
                  className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors"
                >
                  Get Your Instant Quote
                </Link>
              </li>
              <li>
                <Link 
                  href="/news"
                  className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors"
                >
                  Energy News
                </Link>
              </li>
            </ul>
          </div>

          {/* For Installers */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">For Installers</h3>
            <ul className="space-y-3">
              <li>
                <button
                  className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors text-left flex items-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Become a Partner</span>
                </button>
              </li>
              <li><a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">Partner Benefits</a></li>
              <li><a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">Lead Quality</a></li>
              <li><a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">Support Center</a></li>
              <li><a href="#" className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors">Partner Login</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-giants_orange-500" />
                <span className="text-battleship_gray-700">1300 SOLAR (76527)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-giants_orange-500" />
                <span className="text-battleship_gray-700">hello@solarmatch.com.au</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-giants_orange-500 mt-1" />
                <span className="text-battleship_gray-700">
                  Level 10, 123 Collins Street<br />
                  Melbourne VIC 3000
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-onyx-500/30 backdrop-blur-sm rounded-xl border border-onyx-600/20">
              <p className="text-sm text-battleship_gray-700 mb-2">
                <strong className="text-white">Operating Hours:</strong>
              </p>
              <p className="text-sm text-battleship_gray-700">
                Mon - Fri: 8:00 AM - 6:00 PM AEST<br />
                Sat: 9:00 AM - 4:00 PM AEST
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-onyx-600/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-battleship_gray-600">
              <a href="#" className="hover:text-giants_orange-500 transition-colors">About Us</a>
              <a href="#" className="hover:text-giants_orange-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-giants_orange-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-giants_orange-500 transition-colors">Installer Terms</a>
              <a href="#" className="hover:text-giants_orange-500 transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-giants_orange-500 transition-colors">Sitemap</a>
            </div>
            <div className="text-sm text-battleship_gray-600 text-center md:text-right">
              <p>&copy; 2024 SolarMatch Australia. All rights reserved.</p>
              <p className="mt-1">ABN: 12 345 678 901</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer