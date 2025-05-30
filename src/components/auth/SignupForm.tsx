import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardFooter, CardHeader } from '../ui/Card';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
    subdomain?: string;
  }>({});
  
  const { signUp, isLoading, error, clearError, checkSubdomain } = useAuthStore();
  const navigate = useNavigate();
  
  const validateSubdomain = (value: string) => {
    return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value);
  };
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (subdomain && validateSubdomain(subdomain)) {
      timeout = setTimeout(async () => {
        const isAvailable = await checkSubdomain(subdomain);
        if (!isAvailable) {
          setErrors(prev => ({
            ...prev,
            subdomain: 'This subdomain is already taken'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            subdomain: undefined
          }));
        }
      }, 500);
    }
    
    return () => clearTimeout(timeout);
  }, [subdomain, checkSubdomain]);
  
  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
      displayName?: string;
      subdomain?: string;
    } = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!displayName) newErrors.displayName = 'Display name is required';
    
    if (!subdomain) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!validateSubdomain(subdomain)) {
      newErrors.subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) return;
    
    try {
      await signUp(email, password, displayName, subdomain);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(value);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-jakarta font-bold text-gray-800">Create an account</h2>
        <p className="text-gray-600 mt-1">Get started with your new blog</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail size={18} />}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock size={18} />}
          />
          
          <Input
            label="Display Name"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            icon={<User size={18} />}
          />
          
          <div className="relative">
            <Input
              label="Subdomain"
              type="text"
              placeholder="yourname"
              value={subdomain}
              onChange={handleSubdomainChange}
              error={errors.subdomain}
              icon={<Globe size={18} />}
            />
            <div className="absolute text-gray-500 text-sm mt-[-40px] right-3">
              .crafta.blog
            </div>
          </div>
          
          <Button
            type="submit"
            isLoading={isLoading}
            isFullWidth
            className="mt-2"
          >
            Sign Up
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Sign in
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;