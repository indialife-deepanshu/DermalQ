import React from 'react';
import './MedicalDisclaimer.css';

const MedicalDisclaimer = () => {
  return (
    <div className='disclaimer'>
    <div className="disclaimer-container">
      {/* Native SVG Icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="disclaimer-icon"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <div className="disclaimer-content">
        <h4 className="disclaimer-title">Medical Disclaimer</h4>
        <p className="disclaimer-text">
          This tool is for informational purposes only and should not be considered 
          medical advice. Always consult with a qualified healthcare professional 
          for proper diagnosis and treatment.
        </p>
      </div>
    </div>
    </div>
  );
};

export default MedicalDisclaimer;