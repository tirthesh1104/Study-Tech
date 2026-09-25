import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { StudyPlanTopic, User } from '../types';
import AnimatedElement from './AnimatedElement';

interface AbsentStudentViewProps {
  user: User;
}

const AbsentStudentView: React.FC<AbsentStudentViewProps> = ({ user }) => {
  const [topics, setTopics] = useLocalStorage<StudyPlanTopic[]>('study-plan-topics', []);

  const missedTopics = topics.filter(t => new Date(t.dueDate) < new Date() && t.status === 'Pending');
  const upcomingTopics = topics.filter(t => new Date(t.dueDate) >= new Date());

  const handleMarkAsComplete = (topic: string) => {
    setTopics(topics.map(t => t.topic === topic ? { ...t, status: 'Completed' } : t));
  };

  return (
    <div className="space-y-8">
      <AnimatedElement>
        <div className="bg-red-600/10 p-6 rounded-2xl border border-red-500/30 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-red-500">Absent <span className="text-white">Student View</span></h2>
            <p className="text-gray-400 text-sm">Review topics and study materials you missed while you were away</p>
          </div>
          <div className="bg-red-600/20 px-4 py-2 rounded-xl border border-red-500/30 flex items-center gap-2">
              <span className="text-red-400 font-bold uppercase text-xs tracking-widest">Catch-up Plan</span>
          </div>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">⚠️</span> Missed Topics
          </h3>
          <div className="space-y-4">
            {missedTopics.length > 0 ? missedTopics.map((t, i) => (
              <AnimatedElement key={i} delay={i * 50}>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-red-500/30 transition-all flex justify-between items-center group">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{t.topic}</h4>
                    <p className="text-xs text-gray-500">Scheduled: {new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleMarkAsComplete(t.topic)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Mark as Read
                  </button>
                </div>
              </AnimatedElement>
            )) : (
              <div className="p-12 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 text-center">
                <span className="text-4xl mb-4 block">✨</span>
                <p className="text-gray-500 italic text-sm">No missed topics detected. You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-indigo-500">📅</span> Upcoming Schedule
          </h3>
          <div className="space-y-4">
            {upcomingTopics.length > 0 ? upcomingTopics.map((t, i) => (
              <AnimatedElement key={i} delay={i * 50}>
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex justify-between items-center group">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{t.topic}</h4>
                    <p className="text-xs text-gray-500">Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase rounded-full">
                    Upcoming
                  </span>
                </div>
              </AnimatedElement>
            )) : (
              <div className="p-12 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700 text-center">
                <p className="text-gray-500 italic text-sm">No upcoming topics scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl">🤖</div>
          <div>
              <h4 className="text-indigo-400 font-bold text-sm uppercase">Smart Assistant Tip</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  I've analyzed the study plan uploaded by your teacher. Based on your progress, I recommend starting with **{missedTopics[0]?.topic || 'the upcoming topics'}** to maintain your academic momentum. Need help with a specific concept? Just ask me in the chat!
              </p>
          </div>
      </div>
    </div>
  );
};

export default AbsentStudentView;
