import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface SkillEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  evidence_link: string;
  is_verified: boolean;
}

const SkillPassport: React.FC<{ user: User }> = ({ user }) => {
  const [entries, setEntries] = useState<SkillEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Skill',
    evidence_link: ''
  });

  useEffect(() => {
    fetchEntries();
  }, [user.id]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('skill_passport_entries')
      .select('*')
      .eq('student_id', user.id)
      .order('date', { ascending: false });

    if (data) setEntries(data);
    setLoading(false);
  };

  const handleAddEntry = async () => {
    const { error } = await supabase
      .from('skill_passport_entries')
      .insert([{ student_id: user.id, ...newEntry }]);

    if (!error) {
      setIsAdding(false);
      fetchEntries();
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">My Skill Passport</h2>
            <p className="text-gray-400">Your verified portfolio of skills and achievements</p>
          </div>
          <div className="flex gap-3">
             <button
                onClick={() => {
                    const url = `${window.location.origin}/passport/${user.id}`;
                    navigator.clipboard.writeText(url);
                    alert('Public link copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
                Share Profile
              </button>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {isAdding ? 'Cancel' : 'Add Entry'}
              </button>
          </div>
        </div>
      </AnimatedElement>

      {isAdding && (
        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-white">New Achievement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Title (e.g. AWS Certified Developer)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newEntry.title}
                onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              />
              <select
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newEntry.category}
                onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}
              >
                <option>Skill</option>
                <option>Project</option>
                <option>Internship</option>
                <option>Workshop</option>
                <option>Competition</option>
              </select>
              <input
                type="date"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newEntry.date}
                onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
              />
              <input
                placeholder="Evidence Link (URL)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newEntry.evidence_link}
                onChange={e => setNewEntry({ ...newEntry, evidence_link: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white md:col-span-2"
                rows={3}
                value={newEntry.description}
                onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
              />
            </div>
            <button
              onClick={handleAddEntry}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
            >
              Add to Passport
            </button>
          </div>
        </AnimatedElement>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Loading your passport...</div>
        ) : entries.length > 0 ? (
          entries.map((entry, idx) => (
            <AnimatedElement key={entry.id} delay={idx * 50}>
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex gap-4 relative overflow-hidden group">
                {entry.is_verified && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                        Verified
                    </div>
                )}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-2xl">
                    {entry.category === 'Project' ? '🚀' : entry.category === 'Internship' ? '💼' : '🏆'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{entry.description}</p>
                  <div className="flex items-center justify-between text-xs mt-4">
                    <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                    {entry.evidence_link && (
                        <a href={entry.evidence_link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold">
                            View Evidence →
                        </a>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
             <p className="text-gray-400 italic">No entries yet. Start building your passport!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillPassport;
