import React from 'react';
import ErrorList from '../components/ErrorList';

const ErrorsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <ErrorList />
    </div>
  );
};

export default ErrorsPage;