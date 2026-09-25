import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  max_marks: number;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  originality_score: number;
  ai_likelihood: number;
  marks?: number;
  feedback?: string;
  submitted_at: string;
}

const AssignmentDualCheck: React.FC<{ user: User; isTeacher?: boolean }> = ({ user, isTeacher }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    if (isTeacher) fetchAllSubmissions();
    else fetchMySubmissions();
  }, [user.id, isTeacher]);

  const fetchAssignments = async () => {
    const { data } = await supabase.from('assignments').select('*');
    if (data) setAssignments(data);
  };

  const fetchAllSubmissions = async () => {
    const { data } = await supabase.from('assignment_submissions').select('*');
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const fetchMySubmissions = async () => {
    const { data } = await supabase.from('assignment_submissions').select('*').eq('student_id', user.id);
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const handleAIScan = async (content: string) => {
    // In a real app, this would call a backend service for plagiarism/AI detection.
    // For demo, we'll simulate AI analysis using Gemini.
    const prompt = `Analyze this assignment submission for originality and AI likelihood (0-100 scale). Return only JSON: {originality: number, ai_likelihood: number, reason: string}. Content: ${content.slice(0, 1000)}`;
    try {
        const result = await geminiService.generateResponse(prompt, "You are an academic integrity expert.");
        const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] || '{"originality": 85, "ai_likelihood": 10}');
        return parsed;
    } catch {
        return { originality: 90, ai_likelihood: 5 };
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">Assignment Integrity Monitor</h2>
          <p className="text-gray-400">AI-powered originality and integrity checks</p>
        </div>
      </AnimatedElement>

      {isTeacher ? (
        <div className="space-y-4">
          {submissions.map(sub => (
            <AnimatedElement key={sub.id}>
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">Submission #{sub.id.slice(0, 8)}</h3>
                    <span className="text-xs text-gray-500">{new Date(sub.submitted_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{sub.content}</p>
                  <div className="flex gap-4">
                    <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Originality</p>
                        <p className={`text-lg font-black ${sub.originality_score > 70 ? 'text-green-400' : 'text-red-400'}`}>{sub.originality_score}%</p>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">AI Likelihood</p>
                        <p className={`text-lg font-black ${sub.ai_likelihood < 30 ? 'text-green-400' : 'text-red-400'}`}>{sub.ai_likelihood}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                   <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm">Grade Now</button>
                   <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm">Flag Issue</button>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map(a => (
                <div key={a.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{a.subject}</span>
                        <span className="text-xs text-red-400 font-bold">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{a.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">Max Marks: {a.max_marks}</p>
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
                        Submit Answer
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentDualCheck;
