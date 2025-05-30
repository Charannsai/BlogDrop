import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, PenSquare, Settings, Globe, Edit, Image, FileText } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-jakarta text-gray-900 mb-6">
                Craft beautiful blogs with <span className="text-primary-500">zero code</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl lg:max-w-none mb-8">
                Create stunning, fully customizable blogs with our drag-and-drop builder. Get your own custom subdomain and share your content with the world.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started — It's Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
                <img 
                  src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Blog editor preview" 
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-jakarta text-gray-900 mb-4">
              Everything you need to create amazing blogs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools you need to create, customize, and share your content with the world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <Layout size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Bento-style Editor
              </h3>
              <p className="text-gray-600">
                Create beautifully designed blogs with our intuitive drag-and-drop editor. Mix and match components to create your perfect layout.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <Edit size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Markdown Support
              </h3>
              <p className="text-gray-600">
                Write content using Markdown for easy formatting. See your changes in real-time with our live preview editor.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Custom Subdomains
              </h3>
              <p className="text-gray-600">
                Get your own custom subdomain (yourname.blogdrop.blog) to share your content with the world. Make your blog truly yours.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <Image size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Media Integration
              </h3>
              <p className="text-gray-600">
                Easily upload images and embed videos from YouTube and Vimeo. Make your content more engaging with rich media.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <Settings size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Full Customization
              </h3>
              <p className="text-gray-600">
                Customize the look and feel of your blog with different themes, fonts, and colors. Make it match your personal brand.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold font-jakarta text-gray-900 mb-2">
                Draft & Publish
              </h3>
              <p className="text-gray-600">
                Work on drafts and publish when ready. Share private preview links with friends before making your content public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-jakarta text-gray-900 mb-4">
            Ready to start your blogging journey?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of content creators who are already using our platform to share their stories with the world.
          </p>
          <Link to="/signup">
            <Button size="lg" className="px-8">
              Create Your Blog Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <PenSquare size={24} className="text-primary-500 mr-2" />
              <span className="font-bold text-xl font-jakarta text-gray-800">BlogDrop</span>
            </div>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} BlogDrop. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;