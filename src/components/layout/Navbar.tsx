import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User,
  Layout, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button'; 

const Navbar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
  <img 
    src="/assets/BlogDrop_Logo.png" 
    alt="BlogDrop Logo"
    className="h-24 w-auto md:h-32 md:w-auto mt-1" 
  />
  {/* <span className="font-bold text-2xl mt-2 -ml-4 font-jakarta text-gray-800">BlogDrop</span> */}
</Link>

            
            {/* Desktop Navigation */}
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-500 border-b-2 border-transparent hover:border-primary-300 transition-colors"
                >
                  <Layout size={18} className="mr-1.5" />
                  Dashboard
                </Link>
                <Link 
                  to="/blogs" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-500 border-b-2 border-transparent hover:border-primary-300 transition-colors"
                >
                  <FileText size={18} className="mr-1.5" />
                  My Blogs
                </Link>
              </div>
            )}
          </div>
          
          {/* Desktop Authentication Buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-2">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.displayName}</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      <div>Signed in as</div>
                      <div className="font-medium text-gray-900 truncate">{user.email}</div>
                    </div>
                    <hr className="border-gray-100 my-1" />
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-2">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Layout size={18} className="mr-2" />
                    Dashboard
                  </div>
                </Link>
                <Link
                  to="/blogs"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FileText size={18} className="mr-2" />
                    My Blogs
                  </div>
                </Link>
                <button
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User size={18} className="mr-2" />
                    Sign in
                  </div>
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-500 text-white hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-center py-1">
                    Sign up
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;