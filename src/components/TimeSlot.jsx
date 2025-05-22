import React from 'react';

const TimeSlot = ({ slot, selected, onChange }) => {
  const id = `slot-${slot.replace(/\s+/g, '')}`;
  
  return (
    <div className="time-slot-wrapper">
      <input
        type="radio"
        id={id}
        name="timeSlot"
        value={slot}
        checked={selected}
        onChange={() => onChange(slot)}
        className="time-slot-input"
      />
      <label htmlFor={id} className="time-slot-label">
        {slot}
      </label>
    </div>
  );
};

export default TimeSlot; 