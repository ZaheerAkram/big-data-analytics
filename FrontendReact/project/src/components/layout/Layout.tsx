import React from 'react';
import Navbar from './Navbar';

type LayoutProps = {
  children: React.ReactNode;
  padding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
};

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  padding = true,
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': 'max-w-full',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${padding ? 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8' : ''}`}>
          {children}
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AI Interview Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;