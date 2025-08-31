import React from 'react';
import { Input } from './input';
import { Label } from './label';

interface TimeSelectorProps {
  value: number; // Total seconds
  onChange: (seconds: number) => void;
  className?: string;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  value, 
  onChange, 
  className = "" 
}) => {
  // Convert total seconds to hours, minutes, seconds
  const totalSeconds = Math.max(0, Number.isNaN(value) ? 0 : value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newHours = inputValue === '' ? 0 : Math.max(0, parseInt(inputValue, 10) || 0);
    const newTotalSeconds = newHours * 3600 + minutes * 60 + seconds;
    onChange(newTotalSeconds);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newMinutes = inputValue === '' ? 0 : Math.max(0, Math.min(59, parseInt(inputValue, 10) || 0));
    const newTotalSeconds = hours * 3600 + newMinutes * 60 + seconds;
    onChange(newTotalSeconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newSeconds = inputValue === '' ? 0 : Math.max(0, Math.min(59, parseInt(inputValue, 10) || 0));
    const newTotalSeconds = hours * 3600 + minutes * 60 + newSeconds;
    onChange(newTotalSeconds);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-sm font-medium text-gray-700">
            ساعت
          </Label>
          <Input
            id="hours"
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={handleHoursChange}
            className="text-center"
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minutes" className="text-sm font-medium text-gray-700">
            دقیقه
          </Label>
          <Input
            id="minutes"
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={handleMinutesChange}
            className="text-center"
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="seconds" className="text-sm font-medium text-gray-700">
            ثانیه
          </Label>
          <Input
            id="seconds"
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={handleSecondsChange}
            className="text-center"
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        مجموع: {totalSeconds} ثانیه
      </div>
    </div>
  );
};
