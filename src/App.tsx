import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';

// Load fonts
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap');
`;

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    // Add font styles to head
    const style = document.createElement('style');
    style.textContent = fontStyles;
    document.head.appendChild(style);
    
    // Check if user is authenticated
    checkAuth();
    
    return () => {
      document.head.removeChild(style);
    };
  }, [checkAuth]);
  
  return (
    <div className="font-inter text-gray-900 min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;