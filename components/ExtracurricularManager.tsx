import React, { useState } from 'react';
import { Student, ExtracurricularActivity } from '../types';

interface ExtracurricularManagerProps {
  student: Student;
  mode: 'teacher' | 'student';
  onAddActivity: (activity: Omit<ExtracurricularActivity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
}

const ExtracurricularManager: React.FC<ExtracurricularManagerProps> = ({
  student,
  mode,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newActivity, setNewActivity] = useState<Omit<ExtracurricularActivity, 'id'>>({
    title: '',
    category: 'Sports',
    description: '',
    date: new Date().toISOString().split('T')[0],
    achievements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity(newActivity);
    setIsAdding(false);
    setNewActivity({
      title: '',
      category: 'Sports',
      description: '',
      date: new Date().toISOString().split('T')[0],
      achievements: '',
    });
  };

  const activities = student.extracurriculars || [];

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Extracurricular Activities</h3>
          <p className="text-gray-400 text-sm">Track your achievements and hobbies.</p>
        </div>
        {mode === 'student' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all"
          >
            {isAdding ? 'Cancel' : 'Add Activity'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl border border-indigo-500/30 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                value={newActivity.title}
                onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                placeholder="e.g. Football Tournament"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select
                value={newActivity.category}
                onChange={e => setNewActivity({ ...newActivity, category: e.target.value as any })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
              >
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
                <option value="Tech">Tech</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea
              required
              value={newActivity.description}
              onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm h-20"
              placeholder="What did you do?"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={newActivity.date}
                onChange={e => setNewActivity({ ...newActivity, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Achievements (Optional)</label>
              <input
                type="text"
                value={newActivity.achievements}
                onChange={e => setNewActivity({ ...newActivity, achievements: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                placeholder="e.g. Winner, Top 10"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
            Save Activity
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 group relative">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                  activity.category === 'Sports' ? 'bg-green-600/20 text-green-400' :
                  activity.category === 'Arts' ? 'bg-pink-600/20 text-pink-400' :
                  activity.category === 'Tech' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {activity.category}
                </span>
                <span className="text-xs text-gray-500 font-medium">{activity.date}</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{activity.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{activity.description}</p>
              {activity.achievements && (
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Achievement: {activity.achievements}
                </div>
              )}
              {mode === 'student' && (
                <button
                  onClick={() => onDeleteActivity(activity.id)}
                  className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 py-10 text-center bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
            <p className="text-gray-500">No extracurricular activities recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtracurricularManager;
