import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';

const AIStudyTwin: React.FC<{ user: User }> = ({ user }) => {
  const [subject, setSubject] = useState('Data Structures');
  const [examType, setExamType] = useState('Semester');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateQuestion = async () => {
    setLoading(true);
    setEvaluation(null);
    setAnswer('');
    
    const prompt = `Generate a challenging practice question for a student studying ${subject} for their ${examType} exam. Focus on common Previous Year Question (PYQ) patterns.`;
    try {
        const q = await geminiService.generateResponse(prompt, "You are an expert academic coach.");
        setQuestion(q);
    } catch (err) {
        setQuestion("Error generating question. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    setLoading(true);
    const prompt = `Evaluate this student's answer to the question: "${question}". Answer: "${answer}". 
    Return JSON: {score: number, correct: string, missing: string, concept_to_revise: string}`;
    
    try {
        const result = await geminiService.generateResponse(prompt, "You are a fair and detailed examiner.");
        const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] || '{}');
        setEvaluation(parsed);
        
        // Save session
        await supabase.from('study_twin_sessions').insert([{
            student_id: user.id,
            subject,
            question,
            answer,
            score: parsed.score,
            feedback: parsed
        }]);
    } catch (err) {
        console.error('Evaluation error:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">AI Study Twin (PYQ Coach)</h2>
          <p className="text-gray-400">Personalized practice sessions based on exam patterns</p>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Session Settings</h3>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Subject</label>
                    <select 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm"
                    >
                        <option>Data Structures</option>
                        <option>Algorithms</option>
                        <option>Operating Systems</option>
                        <option>Database Management</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Exam Target</label>
                    <select 
                        value={examType} 
                        onChange={e => setExamType(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm"
                    >
                        <option>Semester</option>
                        <option>MPSC</option>
                        <option>UPSC</option>
                        <option>Placement</option>
                    </select>
                </div>
                <button 
                    onClick={generateQuestion}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Start New Session'}
                </button>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Weakness Radar</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Recursion</span>
                        <span className="text-red-400">Needs Work</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-1/3"></div>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Linked Lists</span>
                        <span className="text-green-400">Strong</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-4/5"></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="md:col-span-2 space-y-6">
            {question ? (
                <AnimatedElement delay={100}>
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-6">
                        <div className="space-y-2">
                            <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded uppercase">Practice Question</span>
                            <h3 className="text-xl font-bold text-white leading-relaxed">{question}</h3>
                        </div>

                        <textarea
                            placeholder="Type your answer here..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-6 text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px]"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                        />

                        <button 
                            onClick={evaluateAnswer}
                            disabled={loading || !answer}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Evaluating...' : 'Submit for AI Evaluation'}
                        </button>

                        {evaluation && (
                            <div className="mt-8 pt-8 border-t border-gray-700 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-black text-white">
                                        {evaluation.score}/10
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">AI Feedback</h4>
                                        <p className="text-sm text-gray-400">Based on your conceptual clarity</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-600/10 rounded-xl border border-green-500/20">
                                        <p className="text-xs text-green-400 font-bold uppercase mb-2">What was correct</p>
                                        <p className="text-xs text-gray-300">{evaluation.correct}</p>
                                    </div>
                                    <div className="p-4 bg-red-600/10 rounded-xl border border-red-500/20">
                                        <p className="text-xs text-red-400 font-bold uppercase mb-2">What was missing</p>
                                        <p className="text-xs text-gray-300">{evaluation.missing}</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <p className="text-xs text-indigo-400 font-bold uppercase">Concept to Revise</p>
                                        <p className="text-sm text-white font-medium">{evaluation.concept_to_revise}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </AnimatedElement>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                    <span className="text-6xl mb-6">🤖</span>
                    <h3 className="text-xl font-bold text-white mb-2">Your AI Study Twin is Ready</h3>
                    <p className="text-gray-500 max-w-sm">Select a subject and target exam to generate your first personalized practice question.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIStudyTwin;
