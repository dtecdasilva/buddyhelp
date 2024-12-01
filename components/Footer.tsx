import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-900 py-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg font-bold text-white">
          Buddy<span className="text-yellow-300">Help</span>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-8">
            <li><a href="#" className="text-gray-400 hover:text-yellow-400">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-yellow-400">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-yellow-400">How It Works</a></li>
          </ul>
        </nav>

        {/* Social Media Links */}
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <FaInstagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaTwitter className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>&copy; 2024 BuddyHelp. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
