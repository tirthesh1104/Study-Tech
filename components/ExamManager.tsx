import React, { useState, useMemo } from 'react';
import { User, Exam, ExamSubmission, Question } from '../types';
import Modal from './Modal';
import AnimatedElement from './AnimatedElement';

interface ExamManagerProps {
  user: User;
  exams: Exam[];
  examSubmissions: ExamSubmission[];
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onDeleteSubmission: (submissionId: string) => void;
}

const ExamForm: React.FC<{ exam?: Exam | null; onSave: (exam: Exam) => void; onClose: () => void; userId: string }> = ({ exam, onSave, onClose, userId }) => {
  const [title, setTitle] = useState(exam?.title || '');
  const [subject, setSubject] = useState(exam?.subject || '');
  const [duration, setDuration] = useState(exam?.durationMinutes || 30);
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (index: number, field: 'text' | 'correctAnswer', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };
  
  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title || !subject || duration <= 0 || questions.length === 0) {
        setError('Please fill out the title, subject, duration, and add at least one question.');
        return;
    }
    for (const q of questions) {
        if (!q.text.trim() || q.options.some(opt => !opt.trim()) || !q.correctAnswer.trim()) {
            setError('All question fields, options, and correct answers must be filled out.');
            return;
        }
        if (!q.options.includes(q.correctAnswer)) {
            setError(`For question "${q.text.substring(0,20)}...", the correct answer must be one of the options.`);
            return;
        }
    }
    
    onSave({
        id: exam?.id || `exam-${Date.now()}`,
        title,
        subject,
        durationMinutes: duration,
        questions,
        createdBy: userId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-4 max-h-[80vh] overflow-y-auto">
      {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Exam Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Duration (Minutes)</label>
          <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" min="1" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" required />
      </div>
      <div className="space-y-4 pt-4 border-t border-gray-600">
        <h3 className="text-lg font-semibold text-white">Exam Questions ({questions.length})</h3>
        {questions.map((q, qIndex) => (
            <div key={q.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-300">Question {qIndex + 1}</label>
                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Remove</button>
              </div>
              <textarea value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="Enter question text here..." className="w-full bg-gray-700/50 rounded-lg p-2 text-sm text-white" rows={2} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                        <input type="radio" name={`correctAnswer-${q.id}`} value={opt} checked={q.correctAnswer === opt && opt.trim() !== ''} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} required />
                        <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="w-full bg-gray-700/50 rounded-lg p-2 text-sm text-white" required />
                    </div>
                ))}
              </div>
            </div>
        ))}
        <button type="button" onClick={handleAddQuestion} className="w-full py-2.5 border-2 border-dashed border-indigo-500/50 text-indigo-300 font-semibold rounded-lg hover:bg-indigo-500/10 transition-colors">
            + Add Question
        </button>
      </div>
      <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-gray-800 py-3 border-t border-gray-700">
        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Save Exam</button>
      </div>
    </form>
  )
};

const ExamDetailsModal: React.FC<{ exam: Exam; onClose: () => void }> = ({ exam, onClose }) => {
  return (
    <Modal title={`Exam Details & Questions: ${exam.title}`} onClose={onClose}>
      <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Section Properties */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-indigo-500/30">
          <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
            <span>📌</span> Exam Section Properties
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Subject</p>
              <p className="text-white font-bold">{exam.subject}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Duration</p>
              <p className="text-white font-bold">{exam.durationMinutes} Minutes</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Questions</p>
              <p className="text-white font-bold">{exam.questions?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Exam ID</p>
              <p className="text-gray-300 font-mono text-xs truncate">{exam.id}</p>
            </div>
          </div>
        </div>

        {/* Full Questions View */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Exam Questions Form & Details</h3>
          <div className="space-y-4">
            {exam.questions && exam.questions.length > 0 ? (
              exam.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-md">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-green-400 font-medium">Correct: {q.correctAnswer}</span>
                  </div>
                  <p className="text-white font-semibold text-base mb-3">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          opt === q.correctAnswer
                            ? 'bg-green-950/40 border-green-500/50 text-green-200 font-bold'
                            : 'bg-gray-800/60 border-gray-700 text-gray-300'
                        }`}
                      >
                        <span className="font-mono text-gray-400">{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt}</span>
                        {opt === q.correctAnswer && <span className="ml-auto text-green-400">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No questions found in this exam.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ExamManager: React.FC<ExamManagerProps> = ({ user, exams, examSubmissions, onSaveExam, onDeleteExam, onDeleteSubmission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [viewingSubmissionsOf, setViewingSubmissionsOf] = useState<Exam | null>(null);
  const [viewingDetailsOf, setViewingDetailsOf] = useState<Exam | null>(null);

  const submissionsForViewing = useMemo(() => {
    if (!viewingSubmissionsOf) return [];
    return examSubmissions.filter(s => s.examId === viewingSubmissionsOf.id)
      .sort((a, b) => b.score - a.score);
  }, [examSubmissions, viewingSubmissionsOf]);

  const handleCreate = () => {
    setCurrentExam(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (exam: Exam) => {
    setCurrentExam(exam);
    setIsModalOpen(true);
  };

  const handleAllowRetake = (submissionId: string) => {
    if (window.confirm("Are you sure you want to allow this student to retake the exam? Their current submission will be permanently deleted.")) {
      onDeleteSubmission(submissionId);
    }
  };

  const handleCancelExam = (examId: string) => {
    if (window.confirm("Are you sure you want to cancel / delete this exam?")) {
      onDeleteExam(examId);
    }
  };

  if (viewingSubmissionsOf) {
    return (
        <AnimatedElement className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-indigo-400">Submissions for: <span className="text-white">{viewingSubmissionsOf.title}</span></h2>
                    <p className="text-sm text-gray-400">{submissionsForViewing.length} student(s) have taken this exam.</p>
                </div>
                <button onClick={() => setViewingSubmissionsOf(null)} className="px-4 py-2 bg-gray-600 text-white font-bold rounded-lg text-sm hover:bg-gray-700">&larr; Back to Exams</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="border-b border-gray-600 bg-gray-900/40 text-gray-300 text-sm">
                        <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Tab Switches</th>
                            <th className="p-3">Copied Content</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissionsForViewing.map(sub => (
                            <tr key={sub.id} className={`border-b border-gray-700 transition-colors ${sub.status === 'Blocked' ? 'bg-red-900/20' : sub.status === 'Cancelled' ? 'bg-yellow-900/20' : 'hover:bg-gray-700/50'}`}>
                                <td className="p-3">
                                    <span className="font-semibold text-white">{sub.studentName}</span>
                                    <div className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</div>
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full w-fit ${
                                          sub.status === 'Blocked' ? 'bg-red-500/50 text-red-200' :
                                          sub.status === 'Cancelled' ? 'bg-yellow-500/50 text-yellow-200' :
                                          'bg-green-600/50 text-green-200'
                                        }`}>
                                            {sub.status}
                                        </span>
                                        {sub.status === 'Blocked' && <span className="text-xs text-red-300 mt-1">Blocked: Exceeded warning limits</span>}
                                        {sub.status === 'Cancelled' && <span className="text-xs text-yellow-300 mt-1">Exam session cancelled</span>}
                                    </div>
                                </td>
                                <td className={`p-3 font-bold ${sub.score > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{sub.score}%</td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    (sub.tabSwitchCount || 0) > 0 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-gray-700/40 text-gray-400'
                                  }`}>
                                    ⚠️ {sub.tabSwitchCount || 0} switch(es)
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    (sub.copyCount || 0) > 0 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-gray-700/40 text-gray-400'
                                  }`}>
                                    📋 {sub.copyCount || 0} copy attempt(s)
                                  </span>
                                </td>
                                <td className="p-3">
                                    {(sub.status === 'Blocked' || sub.status === 'Cancelled') && (
                                        <button onClick={() => handleAllowRetake(sub.id)} className="text-sm px-3 py-1 bg-yellow-600/50 text-yellow-200 font-semibold rounded-md hover:bg-yellow-600">
                                            Allow Retake
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                         {submissionsForViewing.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-gray-400">No submissions for this exam yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AnimatedElement>
    )
  }

  return (
    <>
      {isModalOpen && (
        <Modal title={currentExam ? 'Edit Exam' : 'Create New Exam'} onClose={() => setIsModalOpen(false)}>
            <ExamForm exam={currentExam} onSave={(exam) => { onSaveExam(exam); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} userId={user.id} />
        </Modal>
      )}
      {viewingDetailsOf && (
        <ExamDetailsModal exam={viewingDetailsOf} onClose={() => setViewingDetailsOf(null)} />
      )}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-indigo-400">Exam Management</h2>
          <button onClick={handleCreate} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            + Create New Exam
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-600 text-gray-300">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Questions</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? exams.map(exam => (
                <tr key={exam.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3 font-medium text-white">{exam.title}</td>
                  <td className="p-3">{exam.subject}</td>
                  <td className="p-3">{exam.durationMinutes} mins</td>
                  <td className="p-3 font-bold text-indigo-300">{exam.questions?.length || 0}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setViewingDetailsOf(exam)} className="text-sm px-3 py-1 bg-indigo-600/50 text-indigo-200 font-semibold rounded-md hover:bg-indigo-600">
                          View Properties & Questions
                        </button>
                        <button onClick={() => setViewingSubmissionsOf(exam)} className="text-sm px-3 py-1 bg-blue-600/50 text-blue-200 font-semibold rounded-md hover:bg-blue-600">
                          Submissions
                        </button>
                        <button onClick={() => handleEdit(exam)} className="text-sm px-3 py-1 bg-yellow-600/50 text-yellow-200 font-semibold rounded-md hover:bg-yellow-600">
                          Edit
                        </button>
                        <button onClick={() => handleCancelExam(exam.id)} className="text-sm px-3 py-1 bg-red-600/50 text-red-200 font-semibold rounded-md hover:bg-red-600">
                          Cancel / Delete Exam
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400">
                    No exams created yet. Click "Create New Exam" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExamManager;
