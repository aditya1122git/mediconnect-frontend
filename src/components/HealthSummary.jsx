// src/components/HealthSummary.js
import React from 'react';

// Icons for health metrics
const icons = {
  heart: "❤️",
  bloodPressure: "🩸",
  weight: "⚖️",
  glucose: "🔬"
};

const HealthSummary = ({ summary, selectedEntry }) => {
  // Use selected entry if available, otherwise use summary data
  const displayData = selectedEntry || summary;
  
  if (!displayData || Object.keys(displayData).length === 0) {
    return (
      <div className="health-summary empty-summary animate-fade-in">
        <h2 className="med-card-title">Health Summary</h2>
        <p>No health data recorded yet. Start by recording your health information.</p>
      </div>
    );
  }

  // Check if we're displaying a selected entry or summary data
  const isSelectedEntry = !!selectedEntry;
  
  return (
    <div className="health-summary animate-slide-in">
      <h2 className="med-card-title">
        {isSelectedEntry ? 'Selected Health Record' : 'Health Summary'}
        {isSelectedEntry && (
          <span className="summary-date">
            {new Date(selectedEntry.date).toLocaleDateString()}
          </span>
        )}
      </h2>
      
      <div className="summary-grid animate-stagger">
        {(displayData.bloodPressure?.systolic !== null && displayData.bloodPressure?.diastolic !== null) && (
          <div className="summary-card">
            <div className="summary-header">
              <span className="health-icon blood-pressure">{icons.bloodPressure}</span>
              <h3>Blood Pressure</h3>
            </div>
            <div className="summary-value">{displayData.bloodPressure.systolic}/{displayData.bloodPressure.diastolic}</div>
            <div className="summary-detail">
              <span>{isSelectedEntry ? 'Exact value' : 'Latest reading'}</span>
            </div>
          </div>
        )}
        
        {displayData.heartRate !== null && (
          <div className="summary-card">
            <div className="summary-header">
              <span className="health-icon heart">{icons.heart}</span>
              <h3>Heart Rate</h3>
            </div>
            <div className="summary-value">{displayData.heartRate} <span>bpm</span></div>
            <div className="summary-detail">
              <span>{isSelectedEntry ? 'Exact value' : 'Latest reading'}</span>
            </div>
          </div>
        )}
        
        {displayData.weight !== null && (
          <div className="summary-card">
            <div className="summary-header">
              <span className="health-icon weight">{icons.weight}</span>
              <h3>Weight</h3>
            </div>
            <div className="summary-value">{displayData.weight} <span>kg</span></div>
            <div className="summary-detail">
              <span>{isSelectedEntry ? 'Exact value' : 'Latest reading'}</span>
            </div>
          </div>
        )}
        
        {displayData.glucoseLevel !== null && (
          <div className="summary-card">
            <div className="summary-header">
              <span className="health-icon glucose">{icons.glucose}</span>
              <h3>Glucose Level</h3>
            </div>
            <div className="summary-value">{displayData.glucoseLevel} <span>mg/dL</span></div>
            <div className="summary-detail">
              <span>{isSelectedEntry ? 'Exact value' : 'Latest reading'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthSummary;