import React from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 sm:text-base">{subtitle}</p>}
      </div>
      
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
};

export default PageHeader;