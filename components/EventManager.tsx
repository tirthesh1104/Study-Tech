import React, { useState } from 'react';
import { User, CampusEvent, UserRole } from '../types';

interface EventManagerProps {
  user: User;
  events: CampusEvent[];
  onAddEvent: (event: Omit<CampusEvent, 'id' | 'createdAt'>) => void;
  onDeleteEvent: (id: string) => void;
  mode: 'teacher' | 'student' | 'admin';
}

const EventManager: React.FC<EventManagerProps> = ({
  user,
  events,
  onAddEvent,
  onDeleteEvent,
  mode,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CampusEvent, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    location: '',
    organizer: user.name,
    category: 'Cultural',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(newEvent);
    setIsAdding(false);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: '',
      organizer: user.name,
      category: 'Cultural',
    });
  };

  return (
    <div className="space-y-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Campus Events</h2>
          <p className="text-gray-400">Stay updated with the latest happenings on campus.</p>
        </div>
        {mode !== 'student' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-pink-500/25"
          >
            {isAdding ? 'Cancel' : 'Host Event'}
          </button>
        )}
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-pink-500/30 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                placeholder="Event name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select
                value={newEvent.category}
                onChange={e => setNewEvent({ ...newEvent, category: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
              >
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Technical">Technical</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea
              required
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm h-20"
              placeholder="What is the event about?"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
              <input
                type="text"
                required
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                placeholder="10:00 AM"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
              <input
                type="text"
                required
                value={newEvent.location}
                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                placeholder="Auditorium, Lab 1, etc."
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold">
            Create Event
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 group relative hover:border-pink-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-pink-600/20 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {event.category}
                </span>
                <span className="text-xs text-gray-500 font-bold">{event.date}</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{event.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 mb-6 border-t border-gray-700 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className="text-pink-500">📍</span> {event.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className="text-pink-500">⏰</span> {event.time}
                </div>
                 <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className="text-pink-500">👤</span> Organizer: {event.organizer}
                </div>
              </div>

              {mode !== 'student' && (
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-500 font-bold">No upcoming events scheduled.</p>
            <p className="text-gray-600 text-sm">Be the first to host one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManager;
