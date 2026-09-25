import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Student } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

interface EmotionalPulseProps {
  user: User;
  studentData?: Student;
}

const EmotionalPulse: React.FC<EmotionalPulseProps> = ({ user, studentData }) => {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCheckin, setLastCheckin] = useState<any>(null);

  useEffect(() => {
    const fetchLastCheckin = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('pulse_checkins')
        .select('*')
        .eq('student_id', user.id)
        .eq('checkin_date', today)
        .single();

      if (data) {
        setLastCheckin(data);
        setSubmitted(true);
        setTip(data.wellness_tip);
      }
    };
    fetchLastCheckin();
  }, [user.id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Generate AI wellness tip
      const prompt = `Student mood is ${mood}/5 and stress level is ${stress}/5. Give a short 3-line personalized wellness tip.`;
      const aiTip = await geminiService.generateContent(prompt);

      const { error } = await supabase.from('pulse_checkins').insert([
        {
          student_id: user.id,
          mood_score: mood,
          stress_level: stress,
          checkin_date: today,
          wellness_tip: aiTip
        }
      ]);

      if (error) throw error;
      setTip(aiTip);
      setSubmitted(true);
    } catch (err) {
      console.error('Pulse Checkin Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[score - 1];
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Emotional Pulse & Burnout Radar</h2>
          <p className="text-gray-400 mb-8">How are you feeling today? Your daily check-in helps us support your well-being.</p>

          {!submitted ? (
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Daily Mood Score: {mood}/5</label>
                  <span className="text-3xl">{getMoodEmoji(mood)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Stress Level: {stress}/5</label>
                  <span className="text-3xl">{stress > 3 ? '😫' : '😌'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>No Stress</span>
                  <span>Burnout Risk</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit Today\'s Check-in'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold text-indigo-300">AI Wellness Tip</h3>
                </div>
                <p className="text-gray-200 italic leading-relaxed whitespace-pre-line">
                  {tip || 'Take a deep breath and stay positive! You\'re doing great.'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500">You've completed your pulse check-in for today. Come back tomorrow!</p>
              </div>
            </div>
          )}
        </div>
      </AnimatedElement>
    </div>
  );
};

export default EmotionalPulse;
