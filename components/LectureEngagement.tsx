import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

interface LectureEngagementProps {
  user: User;
  sessionId: string;
  isTeacher?: boolean;
}

const LectureEngagement: React.FC<LectureEngagementProps> = ({ user, sessionId, isTeacher }) => {
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
  const [doubts, setDoubts] = useState<any[]>([]);
  const [newDoubt, setNewDoubt] = useState({ question: '', tag: 'Concept Unclear', anonymous: false });
  const [lastFeedbackAt, setLastFeedbackAt] = useState(0);

  useEffect(() => {
    fetchFeedback();
    fetchDoubts();

    const feedbackSub = supabase
      .channel(`feedback-${sessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'lecture_feedback',
        filter: `session_id=eq.${sessionId}` 
      }, () => fetchFeedback())
      .subscribe();

    const doubtSub = supabase
      .channel(`doubts-${sessionId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'doubt_tickets',
        filter: `session_id=eq.${sessionId}` 
      }, () => fetchDoubts())
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackSub);
      supabase.removeChannel(doubtSub);
    };
  }, [sessionId]);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from('lecture_feedback')
      .select('signal')
      .eq('session_id', sessionId);
    
    if (data) {
      const counts = data.reduce((acc: any, curr: any) => {
        acc[curr.signal] = (acc[curr.signal] || 0) + 1;
        return acc;
      }, {});
      setFeedbackCounts(counts);
    }
  };

  const fetchDoubts = async () => {
    const { data, error } = await supabase
      .from('doubt_tickets')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (data) setDoubts(data);
  };

  const sendFeedback = async (signal: string) => {
    const now = Date.now();
    if (now - lastFeedbackAt < 60000) {
      alert('You can only send feedback once per minute.');
      return;
    }

    const { error } = await supabase.from('lecture_feedback').insert([{ session_id: sessionId, signal }]);
    if (!error) setLastFeedbackAt(now);
  };

  const raiseDoubt = async () => {
    const { error } = await supabase.from('doubt_tickets').insert([{
      session_id: sessionId,
      student_id: newDoubt.anonymous ? null : user.id,
      question: newDoubt.question,
      tag: newDoubt.tag,
      is_anonymous: newDoubt.anonymous
    }]);

    if (!error) {
      setNewDoubt({ question: '', tag: 'Concept Unclear', anonymous: false });
      fetchDoubts();
    }
  };

  const resolveDoubt = async (id: string) => {
    await supabase.from('doubt_tickets').update({ status: 'Closed' }).eq('id', id);
    fetchDoubts();
  };

  if (isTeacher) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedElement>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Live Feedback Heatmap</h3>
            <div className="space-y-4">
              {['Confused', 'Too Fast', 'Too Slow', 'Clear'].map(signal => (
                <div key={signal} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{signal}</span>
                    <span className="text-white font-bold">{feedbackCounts[signal] || 0}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${
                            signal === 'Clear' ? 'bg-green-500' : signal === 'Confused' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} 
                        style={{ width: `${Math.min(100, ((feedbackCounts[signal] || 0) / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold text-white mb-4">Live Doubt Queue</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {doubts.filter(d => d.status === 'Open').map(doubt => (
                <div key={doubt.id} className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded uppercase">
                      {doubt.tag}
                    </span>
                    <button 
                        onClick={() => resolveDoubt(doubt.id)}
                        className="text-xs text-green-400 hover:text-green-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Resolve ✓
                    </button>
                  </div>
                  <p className="text-sm text-white">{doubt.question}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{doubt.is_anonymous ? 'Anonymous' : 'Student Name'}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Live Feedback</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Confused', 'Too Fast', 'Too Slow', 'Clear'].map(signal => (
            <button
              key={signal}
              onClick={() => sendFeedback(signal)}
              className="p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-indigo-500 transition-all group"
            >
              <span className="text-2xl block mb-2">
                {signal === 'Confused' ? '🤔' : signal === 'Too Fast' ? '🏃' : signal === 'Too Slow' ? '🐢' : '✨'}
              </span>
              <span className="text-xs font-bold text-gray-400 group-hover:text-white">{signal}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Raise a Doubt</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            {['Concept Unclear', 'Example Needed', 'Step Missed', 'Formula Doubt'].map(tag => (
              <button
                key={tag}
                onClick={() => setNewDoubt({ ...newDoubt, tag })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newDoubt.tag === tag ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-500 hover:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Type your question here..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            value={newDoubt.question}
            onChange={e => setNewDoubt({ ...newDoubt, question: e.target.value })}
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={newDoubt.anonymous}
                    onChange={e => setNewDoubt({ ...newDoubt, anonymous: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900" 
                />
                Submit anonymously
            </label>
            <button
              onClick={raiseDoubt}
              disabled={!newDoubt.question}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold"
            >
              Post Doubt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureEngagement;
