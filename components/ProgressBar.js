
import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-8 sticky top-0 z-50">
      <div 
        className="bg-emerald-500 h-full transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
