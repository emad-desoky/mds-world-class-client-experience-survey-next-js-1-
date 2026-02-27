
import React from 'react';

const RatingInput = ({ 
  value, 
  onChange, 
  allowNotDelivered, 
  allowNotApplicable,
  isNps = false 
}) => {
  const max = isNps ? 10 : 5;
  const ratings = Array.from({ length: max + 1 }, (_, i) => isNps ? i : i + 1).filter(r => isNps || r <= 5);

  const labels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap gap-1.5 ${isNps ? 'justify-between' : ''}`}>
        {ratings.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`flex-1 min-w-[48px] py-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center group relative ${
              value === num 
                ? 'bg-slate-900 border-slate-900 text-white font-black scale-[1.05] shadow-xl z-10' 
                : 'border-slate-100 hover:border-slate-300 bg-white text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg leading-none">{num}</span>
            {isNps && (num === 0 || num === 10) && (
              <span className="absolute -bottom-6 text-[8px] font-black uppercase text-slate-400 tracking-tighter whitespace-nowrap">
                {num === 0 ? 'Not Likely' : 'Highly Likely'}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {!isNps && value && typeof value === 'number' && (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-fade-in">
          Selected: {labels[value]}
        </p>
      )}

      {(allowNotDelivered || allowNotApplicable) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {allowNotDelivered && (
            <button
              type="button"
              onClick={() => onChange('Not Delivered')}
              className={`px-5 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                value === 'Not Delivered'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              Not Delivered Yet / In Progress
            </button>
          )}
          {allowNotApplicable && (
            <button
              type="button"
              onClick={() => onChange('Not Applicable')}
              className={`px-5 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                value === 'Not Applicable'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              Not Applicable
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingInput;
