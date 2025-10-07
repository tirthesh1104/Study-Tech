import React, { useState } from 'react';
import { User, LiveClass } from '../types';

interface ScheduleClassFormProps {
  user: User;
  onSchedule: (newClass: LiveClass) => void;
  onClose: () => void;
}

const ScheduleClassForm: React.FC<ScheduleClassFormProps> = ({ user, onSchedule, onClose }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(45);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !subject || !date || !time || duration <= 0) {
        setError('All fields are required.');
        return;
    }

    const scheduledTime = new Date(`${date}T${time}`).getTime();
    if (isNaN(scheduledTime)) {
        setError('Invalid date or time provided.');
        return;
    }
    
    if (scheduledTime < Date.now()) {
        setError('Cannot schedule a class in the past.');
        return;
    }

    const newClass: LiveClass = {
      id: `live-${Date.now()}`,
      topic,
      subject,
      scheduledTime,
      durationMinutes: duration,
      meetLink: 'https://meet.google.com/new', // Demo link
      teacherId: user.id,
      teacherName: user.name,
      status: 'Scheduled',
    };
    
    onSchedule(newClass);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-4">
      {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">{error}</div>}
      
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Class Topic</label>
        <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2" required autoFocus />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2" required />
        </div>
         <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Time</label>
          <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2" required />
        </div>
      </div>
      
       <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (Minutes)</label>
          <input type="number" id="duration" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-gray-700/50 rounded-lg p-2" min="1" required />
        </div>
      
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700 mt-2">
        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">Schedule Class</button>
      </div>
    </form>
  )
};

export default ScheduleClassForm;
