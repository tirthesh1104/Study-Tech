import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const TimetableManager: React.FC<{ user: User; isAdmin?: boolean }> = ({ user, isAdmin }) => {
  const [timetable, setTimetable] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState({
    subjects: 'Data Structures, Algorithms, OS, DBMS',
    teachers: 'Prof. A, Prof. B, Prof. C',
    rooms: 'Room 101, Lab 202'
  });

  const generateTimetable = async () => {
    setLoading(true);
    const prompt = `Generate a weekly college timetable based on: Subjects: ${constraints.subjects}, Teachers: ${constraints.teachers}, Rooms: ${constraints.rooms}. 
    Return JSON format: { "Monday": { "09:00 AM": { "subject": "DS", "teacher": "Prof A", "room": "101" }, ... }, ... }`;
    
    try {
        const result = await geminiService.generateResponse(prompt, "You are a university scheduling expert.");
        const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] || '{}');
        setTimetable(parsed);
        
        await supabase.from('timetable_constraints').insert([{
            admin_id: user.id,
            constraints: { ...constraints, generated_timetable: parsed }
        }]);
    } catch (err) {
        console.error('Timetable error:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <AnimatedElement>
        <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Timetable Optimizer</h2>
            <p className="text-gray-400">Generate conflict-free schedules using AI</p>
          </div>
          {isAdmin && (
            <button
              onClick={generateTimetable}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Regenerate Timetable'}
            </button>
          )}
        </div>
      </AnimatedElement>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Subjects</label>
                <input 
                    className="w-full bg-transparent text-white text-sm outline-none" 
                    value={constraints.subjects} 
                    onChange={e => setConstraints({...constraints, subjects: e.target.value})}
                />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Teachers</label>
                <input 
                    className="w-full bg-transparent text-white text-sm outline-none" 
                    value={constraints.teachers} 
                    onChange={e => setConstraints({...constraints, teachers: e.target.value})}
                />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Rooms</label>
                <input 
                    className="w-full bg-transparent text-white text-sm outline-none" 
                    value={constraints.rooms} 
                    onChange={e => setConstraints({...constraints, rooms: e.target.value})}
                />
            </div>
        </div>
      )}

      <div className="overflow-x-auto bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b border-gray-700 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
              {DAYS.map(day => (
                <th key={day} className="p-3 border-b border-gray-700 text-left text-xs font-bold text-gray-500 uppercase">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => (
              <tr key={slot} className="group">
                <td className="p-3 border-b border-gray-800 text-xs font-bold text-indigo-400 bg-gray-900/30">{slot}</td>
                {DAYS.map(day => {
                  const entry = timetable[day]?.[slot];
                  return (
                    <td key={`${day}-${slot}`} className="p-2 border-b border-gray-800 min-w-[150px]">
                      {entry ? (
                        <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-600/20 transition-all cursor-move">
                          <p className="text-white font-bold text-sm">{entry.subject}</p>
                          <p className="text-[10px] text-gray-400">{entry.teacher} • {entry.room}</p>
                        </div>
                      ) : (
                        <div className="h-16 border border-dashed border-gray-800 rounded-xl group-hover:border-gray-700 transition-colors"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableManager;
