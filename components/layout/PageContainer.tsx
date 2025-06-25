
import React, { ReactNode } from 'react';

interface PageContainerProps {
  title?: string;
  children: ReactNode;
  titleIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, children, titleIcon, headerActions }) => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {(title || headerActions) && (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-semibold text-green-800 flex items-center">
              {titleIcon && <span className="mr-3 text-green-600">{titleIcon}</span>}
              {title}
            </h1>
          )}
          {headerActions && <div className="mt-3 sm:mt-0">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
