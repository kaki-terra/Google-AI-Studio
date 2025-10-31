import React from 'react';

const SectionPlaceholder: React.FC<{ className?: string }> = ({ className = 'min-h-[70vh]' }) => {
  return (
    <div className={`w-full ${className} bg-transparent`} aria-hidden="true" />
  );
};

export default SectionPlaceholder;
