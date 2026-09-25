
import React, { useState } from 'react';
import { Exam, ExamSubmission } from '../types';
import ExamTaker from './ExamTaker';
import AnimatedElement from './AnimatedElement';

interface ExamPortalProps {
  studentId: string;
  exams: Exam[];
  submissions: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
}

const ExamPortal: React.FC<ExamPortalProps> = ({ studentId, exams, submissions, onSubmitExam }) => {
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  const topics = ['All', ...new Set(exams.map(e => e.subject))];
  const filteredExams = selectedTopic === 'All' ? exams : exams.filter(e => e.subject === selectedTopic);

  // FIX: Explicitly type the Map to ensure correct type inference for `submission`.
  const studentSubmissionsMap = new Map<string, ExamSubmission>(submissions.map(s => [s.examId, s]));

  const handleSubmit = (answers: { [questionId: string]: string }, status: 'Completed' | 'Blocked') => {
    if (!takingExam) return;
    onSubmitExam({
      examId: takingExam.id,
      studentId,
      answers,
      submittedAt: Date.now(),
      status,
    });
    setTakingExam(null);
  };

  if (takingExam) {
    const existingSubmission = studentSubmissionsMap.get(takingExam.id);
    if (existingSubmission?.status === 'Blocked') {
        return (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-red-500/50 text-center">
                 <h2 className="text-2xl font-bold mb-4 text-red-400">Exam Blocked</h2>
                 <p className="text-gray-300">Your access to this exam has been blocked due to a violation of exam rules.</p>
                 <p className="text-gray-400 mt-2">Please contact your teacher for assistance.</p>
                 <button onClick={() => setTakingExam(null)} className="mt-6 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Go Back</button>
            </div>
        );
    }
    return <ExamTaker exam={takingExam} onClose={() => setTakingExam(null)} onSubmit={handleSubmit} />;
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Exam <span className="text-indigo-400">Portal</span></h2>
          <p className="text-gray-400 mt-1">Select a topic to view available examinations.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-700/50">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${selectedTopic === topic ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => {
            const submission = studentSubmissionsMap.get(exam.id);
            const isBlocked = submission?.status === 'Blocked';
            return (
              <AnimatedElement key={exam.id} delay={index * 100}>
                <div className={`bg-gray-900/50 p-6 rounded-2xl border-2 flex flex-col justify-between h-full hover:border-indigo-500/50 transition-all group ${isBlocked ? 'border-red-500/30' : 'border-gray-800'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : submission ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        {isBlocked ? 'Blocked' : submission ? 'Completed' : 'Available'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{exam.title}</h3>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{exam.subject}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Questions</p>
                        <p className="text-white font-bold">{exam.questions?.length || 0}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Duration</p>
                        <p className="text-white font-bold">{exam.durationMinutes}m</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    {submission ? (
                      <div className={`p-4 rounded-2xl border text-center ${isBlocked ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                        <div className="text-3xl font-black text-white">{submission.score}%</div>
                        <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                          {isBlocked ? 'Access Restricted' : 'Final Score'}
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setTakingExam(exam)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Start Examination
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-xl font-bold text-gray-600">No exams available for this topic</p>
          <p className="text-gray-700 mt-2">Please check back later or select another subject.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
