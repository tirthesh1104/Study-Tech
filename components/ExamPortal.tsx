import React, { useState } from 'react';
import { Exam, ExamSubmission } from '../types';
import ExamTaker from './ExamTaker';
import AnimatedElement from './AnimatedElement';
import Modal from './Modal';
import { MOCK_EXAMS } from '../data/mockData';

interface ExamPortalProps {
  studentId: string;
  exams?: Exam[];
  submissions?: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
}

const ExamPortal: React.FC<ExamPortalProps> = ({ studentId, exams = [], submissions = [], onSubmitExam }) => {
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [viewingExamDetails, setViewingExamDetails] = useState<Exam | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Defensive array fallback to prevent white screen crashes
  const safeExams = Array.isArray(exams) && exams.length > 0 ? exams : MOCK_EXAMS;
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  const topics = ['All', ...new Set(safeExams.map(e => e?.subject).filter(Boolean))];
  const filteredExams = selectedTopic === 'All' ? safeExams : safeExams.filter(e => e?.subject === selectedTopic);

  const studentSubmissionsMap = new Map<string, ExamSubmission>(safeSubmissions.map(s => [s.examId, s]));

  const handleSubmit = (
    answers: { [questionId: string]: string },
    status: 'Completed' | 'Blocked' | 'Cancelled',
    tabSwitchCount?: number,
    copyCount?: number
  ) => {
    if (!takingExam) return;
    onSubmitExam({
      examId: takingExam.id,
      studentId,
      answers,
      submittedAt: Date.now(),
      status,
      tabSwitchCount,
      copyCount,
    });
    setTakingExam(null);
  };

  if (takingExam) {
    const existingSubmission = studentSubmissionsMap.get(takingExam.id);
    if (existingSubmission?.status === 'Blocked') {
      return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-red-500/50 text-center text-white">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Exam Blocked</h2>
          <p className="text-gray-300">Your access to this exam has been blocked due to a violation of exam rules.</p>
          <p className="text-gray-400 mt-2">Please contact your teacher for assistance.</p>
          <button onClick={() => setTakingExam(null)} className="mt-6 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 font-bold">Go Back</button>
        </div>
      );
    }
    return <ExamTaker exam={takingExam} onClose={() => setTakingExam(null)} onSubmit={handleSubmit} />;
  }

  return (
    <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700/80 shadow-2xl text-white">
      {viewingExamDetails && (
        <Modal title={`Exam Details & Questions: ${viewingExamDetails.title}`} onClose={() => setViewingExamDetails(null)}>
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="bg-gray-900/80 p-4 rounded-xl border border-indigo-500/30 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Subject</p>
                <p className="text-white font-bold">{viewingExamDetails.subject}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Duration</p>
                <p className="text-white font-bold">{viewingExamDetails.durationMinutes} Minutes</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Questions</p>
                <p className="text-white font-bold">{viewingExamDetails.questions?.length || 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-3">Full Questions Form & Section Properties</h3>
              <div className="space-y-3">
                {viewingExamDetails.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 bg-gray-900/60 rounded-xl border border-gray-700 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-indigo-300 font-bold text-xs">Question {idx + 1}</p>
                      <p className="text-xs text-green-400 font-medium">Correct: {q.correctAnswer}</p>
                    </div>
                    <p className="text-white font-semibold mb-2">{q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-300">
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-2 rounded border flex items-center gap-1.5 ${opt === q.correctAnswer ? 'bg-green-950/40 border-green-500/50 text-green-200 font-bold' : 'bg-gray-800 border-gray-700'}`}>
                          <span className="text-gray-400 font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                          {opt === q.correctAnswer && <span className="ml-auto text-green-400">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                onClick={() => setViewingExamDetails(null)}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const examToTake = viewingExamDetails;
                  setViewingExamDetails(null);
                  setTakingExam(examToTake);
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
              >
                Start This Exam
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Exam <span className="text-indigo-400">Portal</span></h2>
          <p className="text-gray-400 mt-1">Select an examination section or subject topic below.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-700">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${selectedTopic === topic ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-gray-200'}`}
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
            const isCancelled = submission?.status === 'Cancelled';

            return (
              <AnimatedElement key={exam.id} delay={index * 100}>
                <div className={`bg-gray-950/70 p-6 rounded-2xl border-2 flex flex-col justify-between h-full hover:border-indigo-500/50 transition-all ${isBlocked ? 'border-red-500/40' : isCancelled ? 'border-yellow-500/40' : 'border-gray-800'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isBlocked ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        isCancelled ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        submission ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {isBlocked ? 'Blocked' : isCancelled ? 'Cancelled' : submission ? 'Completed' : 'Available'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{exam.title}</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{exam.subject}</p>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Questions</p>
                        <p className="text-white font-bold">{exam.questions?.length || 0}</p>
                      </div>
                      <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Duration</p>
                        <p className="text-white font-bold">{exam.durationMinutes} mins</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => setViewingExamDetails(exam)}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-indigo-300 font-semibold rounded-xl text-xs border border-gray-700 transition-colors"
                    >
                      View Section Properties & Questions
                    </button>
                    {submission ? (
                      <div className={`p-3 rounded-2xl border text-center ${isBlocked ? 'bg-red-500/10 border-red-500/30' : isCancelled ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                        <div className="text-2xl font-black text-white">{submission.score}%</div>
                        <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${isBlocked ? 'text-red-400' : isCancelled ? 'text-yellow-400' : 'text-green-400'}`}>
                          {isBlocked ? 'Access Restricted' : isCancelled ? 'Session Cancelled' : 'Final Score'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTakingExam(exam)}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                          Start Exam
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel taking the "${exam.title}" exam?`)) {
                              handleSubmit({}, 'Cancelled', 0, 0);
                            }
                          }}
                          className="px-3 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-300 font-semibold rounded-xl border border-red-500/30 text-xs transition-colors"
                          title="Cancel taking this exam"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-950/50 rounded-3xl border-2 border-dashed border-gray-800">
          <p className="text-xl font-bold text-gray-400">No exams available for this topic</p>
          <p className="text-gray-500 text-sm mt-2">Please select another subject or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
