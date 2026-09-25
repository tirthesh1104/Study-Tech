import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

interface StudyRoom {
  id: string;
  title: string;
  subject: string;
  is_open: boolean;
  created_by: string;
  created_at: string;
}

const StudyRooms: React.FC<{ user: User }> = ({ user }) => {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', subject: '', is_open: true });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase.from('study_rooms').select('*').order('created_at', { ascending: false });
    if (data) setRooms(data);
  };

  const createRoom = async () => {
    const { data, error } = await supabase
      .from('study_rooms')
      .insert([{ ...newRoom, created_by: user.id }])
      .select()
      .single();

    if (data) {
      setIsCreating(false);
      fetchRooms();
      setActiveRoom(data);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Collaborative Study Rooms</h2>
            <p className="text-gray-400">Solve Previous Year Questions (PYQ) together</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            {isCreating ? 'Cancel' : 'Create Room'}
          </button>
        </div>
      </AnimatedElement>

      {isCreating && (
        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-white">New Study Room</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Room Title (e.g. 2023 DS PYQ Solving)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newRoom.title}
                onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
              />
              <input
                placeholder="Subject"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newRoom.subject}
                onChange={e => setNewRoom({ ...newRoom, subject: e.target.value })}
              />
            </div>
            <button
              onClick={createRoom}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
            >
              Start Room
            </button>
          </div>
        </AnimatedElement>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, idx) => (
          <AnimatedElement key={room.id} delay={idx * 50}>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded uppercase">
                  {room.subject}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{room.title}</h3>
              <p className="text-xs text-gray-500 mb-6">Created by: {room.created_by.slice(0, 8)}...</p>
              <button 
                onClick={() => setActiveRoom(room)}
                className="mt-auto w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold border border-gray-700"
              >
                Join Discussion
              </button>
            </div>
          </AnimatedElement>
        ))}
      </div>

      {activeRoom && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl z-[60] p-4 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-3xl border border-gray-800 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">{activeRoom.title}</h3>
                        <p className="text-sm text-gray-400">{activeRoom.subject} Discussion</p>
                    </div>
                    <button onClick={() => setActiveRoom(null)} className="p-2 hover:bg-gray-800 rounded-full">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        <div className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700">
                            <p className="text-indigo-400 text-xs font-bold mb-2 uppercase">Question Posted</p>
                            <p className="text-white">Explain the difference between a stack and a queue with a real-world example.</p>
                            <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex-shrink-0"></div>
                                    <div className="bg-gray-900/50 p-3 rounded-xl flex-1">
                                        <p className="text-sm text-gray-300">Stack is LIFO (Last In First Out), like a stack of plates. Queue is FIFO (First In First Out), like a line at a ticket counter.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <aside className="w-72 border-l border-gray-800 p-6 bg-gray-950/50">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">AI Hint System</h4>
                        <div className="bg-indigo-600/10 p-4 rounded-xl border border-indigo-500/20">
                            <p className="text-xs text-indigo-400 font-bold mb-2 italic">Thinking...</p>
                            <p className="text-xs text-gray-300 leading-relaxed">Consider mentioning time complexities (O(1)) for push/pop and enqueue/dequeue operations to earn more credits!</p>
                        </div>
                    </aside>
                </div>
                
                <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex gap-4">
                    <input 
                        placeholder="Type your attempt or question..." 
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Post</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudyRooms;
