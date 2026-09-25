import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { StudyPlanTopic, User } from '../types';
import AnimatedElement from './AnimatedElement';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';

interface StudyPlanManagerProps {
  user: User;
}

const StudyPlanManager: React.FC<StudyPlanManagerProps> = ({ user }) => {
  const [topics, setTopics] = useLocalStorage<StudyPlanTopic[]>('study-plan-topics', []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{ topics: string[], count: number } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      alert('Only .pdf, .docx, or .csv formats are allowed.');
      return;
    }

    setIsUploading(true);
    // Simulation of parsing the file and extracting topics using Gemini
    const prompt = `Extract a list of topics and their scheduled dates from this study plan file: "${file.name}". 
    The current date is ${new Date().toLocaleDateString()}.
    Return JSON: { topics: [{ topic: string, dueDate: "YYYY-MM-DD" }] }`;

    try {
      const aiResponse = await geminiService.generateResponse(prompt, "You are an academic coordinator.");
      const extracted = JSON.parse(aiResponse.match(/\{.*\}/s)?.[0] || '{"topics":[]}');
      
      const newTopics: StudyPlanTopic[] = extracted.topics.map((t: any) => ({
        topic: t.topic,
        dueDate: t.dueDate,
        status: 'Pending'
      }));

      setTopics([...topics, ...newTopics]);
      setUploadSummary({
        topics: newTopics.map(t => t.topic),
        count: newTopics.length
      });
    } catch (err) {
      console.error("Failed to parse study plan:", err);
      alert("Failed to extract topics from study plan.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Study Plan <span className="text-indigo-400">Uploader</span></h3>
          <p className="text-gray-400 text-sm">Upload missing study plans to help absent students catch up</p>
        </div>
        <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
          {isUploading ? <Spinner size="sm" /> : <span>Upload Plan</span>}
          <input type="file" className="hidden" accept=".pdf,.docx,.csv" onChange={handleFileUpload} />
        </label>
      </div>

      {uploadSummary && (
        <AnimatedElement className="bg-green-600/10 border border-green-500/20 p-4 rounded-xl">
          <h4 className="text-green-400 font-bold text-sm mb-2">Upload Successful!</h4>
          <p className="text-gray-300 text-xs mb-3">Extracted {uploadSummary.count} topics from the plan:</p>
          <ul className="grid grid-cols-2 gap-2">
            {uploadSummary.topics.map((t, i) => (
              <li key={i} className="text-[10px] text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {t}
              </li>
            ))}
          </ul>
          <button onClick={() => setUploadSummary(null)} className="mt-4 text-[10px] text-indigo-400 font-bold hover:underline">Dismiss</button>
        </AnimatedElement>
      )}

      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Study Plan Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topics.length > 0 ? topics.map((t, i) => (
            <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-sm">{t.topic}</p>
                <p className="text-xs text-gray-500">Scheduled for: {t.dueDate}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                new Date(t.dueDate) < new Date() ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
              }`}>
                {new Date(t.dueDate) < new Date() ? 'Past Due' : 'Upcoming'}
              </span>
            </div>
          )) : (
            <p className="text-gray-500 italic text-sm py-4">No topics extracted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanManager;
