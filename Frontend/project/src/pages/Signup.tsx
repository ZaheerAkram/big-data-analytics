import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UserPlus } from 'lucide-react';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ form: 'Failed to create an account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.75V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.2501 8.74994L5.75 15.2501" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.2501 15.25L5.75 8.74997" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="mt-3 text-3xl font-heading font-bold text-gray-900">AI Interview Platform</h2>
          <p className="mt-2 text-gray-600">Create your account to begin your interview journey.</p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {errors.form && (
            <div className="mb-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
              {errors.form}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              error={errors.fullName}
              placeholder="Enter your full name"
            />
            
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              placeholder="Enter your email"
            />
            
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              error={errors.phoneNumber}
              placeholder="Enter your phone number"
            />
            
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              placeholder="Create a password"
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
              placeholder="Confirm your password"
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                variant="primary" 
                isFullWidth 
                isLoading={isLoading}
                size="lg"
              >
                <UserPlus className="h-5 w-5" />
                Create Account
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;