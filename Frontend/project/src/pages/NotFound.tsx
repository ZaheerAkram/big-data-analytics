import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-9xl font-heading font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-heading font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="mt-8">
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            size="lg"
          >
            <Home className="h-5 w-5 mr-1" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;