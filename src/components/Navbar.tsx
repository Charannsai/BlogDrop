import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Edit3, 
  Bell, 
  User, 
  Search, 
  LogOut, 
  Menu, 
  X,
  Settings,
  Bookmark,
  TrendingUp,
  Hash,
  AtSign
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../lib/store';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'general' | 'user' | 'tag'>('general');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Track scroll position to join/separate navbars
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const channel = supabase
        .channel('navbar-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!actor_id(username, full_name, avatar_url),
          blogs(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let results: any[] = [];

      // Determine search type based on prefix
      if (searchQuery.startsWith('@')) {
        // User search
        const username = searchQuery.slice(1);
        if (username.length > 0) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .ilike('username', `%${username}%`)
            .limit(5);

          if (!error && data) {
            results = data.map(profile => ({ ...profile, type: 'user' }));
          }
        }
      } else if (searchQuery.startsWith('#')) {
        // Tag search
        const tag = searchQuery.slice(1);
        if (tag.length > 0) {
          const { data, error } = await supabase
            .from('blogs')
            .select('id, title, excerpt, tags, created_at, profiles(username, full_name, avatar_url)')
            .eq('published', true)
            .contains('tags', [tag])
            .order('created_at', { ascending: false })
            .limit(5);

          if (!error && data) {
            results = data.map(blog => ({ ...blog, type: 'blog' }));
          }
        }
      } else {
        // General search (blogs and users)
        const [blogsData, usersData] = await Promise.all([
          supabase
            .from('blogs')
            .select('id, title, excerpt, tags, created_at, profiles(username, full_name, avatar_url)')
            .eq('published', true)
            .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
            .limit(3)
        ]);

        if (blogsData.data) {
          results.push(...blogsData.data.map(blog => ({ ...blog, type: 'blog' })));
        }
        if (usersData.data) {
          results.push(...usersData.data.map(user => ({ ...user, type: 'user' })));
        }
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSearchResultClick = (result: any) => {
    if (result.type === 'user') {
      navigate(`/profile/${result.username}`);
    } else if (result.type === 'blog') {
      navigate(`/blog/${result.id}`);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    setIsSearchOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getSearchPlaceholder = () => {
    if (searchQuery.startsWith('@')) return 'Search users...';
    if (searchQuery.startsWith('#')) return 'Search tags...';
    return 'Search blogs, @users, or #tags...';
  };

  // Main navigation items
  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Edit3, label: 'My Blogs', path: '/my-blogs' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // Mobile navigation items (simplified)
  const mobileNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Edit3, label: 'Blogs', path: '/my-blogs' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Main Top Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isScrolled ? 'transition-all duration-300' : ''}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-primary-600 rounded-xl shadow-glow flex items-center justify-center shadow-lg"
              >
                <Edit3 className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-bold text-2xl bg-primary-600 bg-clip-text text-transparent">
                BlogDrop
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <motion.div 
              className={`hidden md:flex transition-all duration-300 ease-in-out relative ${
                isScrolled 
                  ? "flex-grow-0 max-w-xs mr-2" 
                  : "flex-1 max-w-sm mx-8"
              }`}
              layout
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {searchQuery.startsWith('@') && (
                  <AtSign className="absolute left-10 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
                )}
                {searchQuery.startsWith('#') && (
                  <Hash className="absolute left-10 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
                )}
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(searchResults.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className={`w-full ${searchQuery.startsWith('@') || searchQuery.startsWith('#') ? 'pl-16' : 'pl-12'} pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200`}
                />

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-large border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto"
                    >
                      {searchResults.map((result, index) => (
                        <motion.div
                          key={`${result.type}-${result.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSearchResultClick(result)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {result.type === 'user' ? (
                            <div className="flex items-center space-x-3">
                              {result.avatar_url ? (
                                <img src={result.avatar_url} alt={result.full_name} className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {result.full_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{result.full_name}</div>
                                <div className="text-sm text-gray-500">@{result.username}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-3">
                              {result.profiles?.avatar_url ? (
                                <img src={result.profiles.avatar_url} alt={result.profiles.full_name} className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {result.profiles?.full_name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{result.title}</div>
                                <div className="text-sm text-gray-500">by @{result.profiles?.username}</div>
                                {result.tags && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {result.tags.slice(0, 2).map((tag: string) => (
                                      <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Conditionally render the navigation items in the top bar when scrolled */}
            {isScrolled && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center space-x-1"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative"
                  >
                    <motion.div
                      className={`relative flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-xs">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            )}

            {/* Profile Avatar - Desktop Only */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/profile">
                <motion.div
                  className="w-10 h-10 bg-primary-600 shadow-glow rounded-xl flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-sm z-50 p-4 pt-20"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {searchQuery.startsWith('@') && (
                <AtSign className="absolute left-10 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
              )}
              {searchQuery.startsWith('#') && (
                <Hash className="absolute left-10 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
              )}
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${searchQuery.startsWith('@') || searchQuery.startsWith('#') ? 'pl-16' : 'pl-12'} pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer"
                  >
                    {result.type === 'user' ? (
                      <div className="flex items-center space-x-3">
                        {result.avatar_url ? (
                          <img src={result.avatar_url} alt={result.full_name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {result.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{result.full_name}</div>
                          <div className="text-sm text-gray-500">@{result.username}</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{result.title}</div>
                        <div className="text-sm text-gray-500">by @{result.profiles?.username}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigation Bar Below Main Navbar - Desktop - Hide when scrolled */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="hidden md:block sticky top-16 z-40"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-3">
                <div className="flex items-center space-x-1 font-sans bg-white shadow-lg border border-gray-100 rounded-xl p-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative"
                    >
                      <motion.div
                        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                          location.pathname === item.path
                            ? 'bg-primary-600 text-white shadow-glow'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                  
                  {/* Sign Out Button */}
                  <motion.button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      >
        <div className="grid grid-cols-4 h-16">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 relative ${
                location.pathname === item.path
                  ? 'text-primary-600'
                  : 'text-gray-500'
              }`}
            >
              <div className={`p-1 rounded-lg ${location.pathname === item.path ? 'bg-primary-100' : ''}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;