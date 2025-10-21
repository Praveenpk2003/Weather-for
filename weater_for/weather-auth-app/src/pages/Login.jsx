import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const { login, isLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or Email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setApiError(null);

      await login(formData.identifier.trim(), formData.password.trim());

      const from = (location.state)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const serverMessage = err?.message || 'Login failed';
      setApiError(typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-sm text-gray-600 mb-8">
            Enter your credentials to access your dashboard
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormInput
              label="Username or Email"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              error={errors.identifier}
              placeholder="Enter username or email"
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            {apiError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{apiError}</div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
