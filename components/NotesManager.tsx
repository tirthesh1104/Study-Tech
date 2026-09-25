import React, { useState, useMemo, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SubjectNote, User, UserRole, StudentNoteProgress } from '../types';
import AnimatedElement from './AnimatedElement';
import Modal from './Modal';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';

interface NotesManagerProps {
  user: User;
  mode: 'teacher' | 'student';
}

const NotesManager: React.FC<NotesManagerProps> = ({ user, mode }) => {
  const [notes, setNotes] = useLocalStorage<SubjectNote[]>('subject-notes', []);
  const [progress, setProgress] = useLocalStorage<StudentNoteProgress[]>('student-notes-progress', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SubjectNote | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      
      // AI Analysis Simulation
      // In a real app, we would send the file content to Gemini.
      // Since we can't parse PDF/DOCX here easily, we'll use the file name and a prompt.
      const prompt = `Analyze this lecture note titled "${file.name}". 
      Return JSON: { complexity: "Easy" | "Medium" | "Hard", summary: "3-line summary", keyConcepts: ["concept1", "concept2"] }`;
      
      try {
        const aiResponse = await geminiService.generateResponse(prompt, "You are an academic content analyzer.");
        const analysis = JSON.parse(aiResponse.match(/\{.*\}/s)?.[0] || '{"complexity":"Medium","summary":"Lecture notes on the topic.","keyConcepts":["General Overview"]}');

        const newNote: SubjectNote = {
          id: `note-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          department: 'Computer Science', // Mock department
          subject: 'General',
          fileName: file.name,
          fileType: file.type,
          dataUrl,
          complexity: analysis.complexity,
          summary: analysis.summary,
          keyConcepts: analysis.keyConcepts,
          uploadedBy: user.id,
          createdAt: new Date().toISOString(),
          readCount: 0,
        };

        setNotes([...notes, newNote]);
      } catch (err) {
        console.error("AI Analysis failed:", err);
        alert("Failed to analyze note content. Using default values.");
      } finally {
        setIsAnalyzing(false);
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAsRead = (noteId: string) => {
    if (mode !== 'student') return;
    
    const existing = progress.find(p => p.studentId === user.id && p.noteId === noteId);
    if (existing?.status === 'Completed') return;

    const newProgress: StudentNoteProgress = {
      studentId: user.id,
      noteId,
      status: 'Completed',
      lastAccessed: new Date().toISOString()
    };

    setProgress([...progress.filter(p => !(p.studentId === user.id && p.noteId === noteId)), newProgress]);
    
    // Update read count
    setNotes(notes.map(n => n.id === noteId ? { ...n, readCount: n.readCount + 1 } : n));
  };

  const getStatusBadge = (noteId: string) => {
    const p = progress.find(p => p.studentId === user.id && p.noteId === noteId);
    if (!p) return null;
    return (
      <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-[10px] font-bold rounded uppercase">
        {p.status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Subject <span className="text-indigo-400">Notes</span></h2>
          <p className="text-gray-400 text-sm">AI-powered study materials and summaries</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          {mode === 'teacher' && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {isAnalyzing ? <Spinner size="sm" /> : <span>Upload Note</span>}
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx,.pptx"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, idx) => (
          <AnimatedElement key={note.id} delay={idx * 50}>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    note.complexity === 'Easy' ? 'bg-green-600/20 text-green-400' :
                    note.complexity === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {note.complexity}
                  </span>
                  {mode === 'student' && getStatusBadge(note.id)}
                </div>
                <div className="text-gray-500 text-[10px] font-medium">
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{note.title}</h3>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{note.summary}</p>
              
              <div className="flex flex-wrap gap-1 mb-6">
                {note.keyConcepts.slice(0, 3).map((concept, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-900 border border-gray-700 rounded text-[9px] text-gray-500">
                    {concept}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex gap-2">
                <button 
                  onClick={() => setSelectedNote(note)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  View Summary
                </button>
                <a 
                  href={note.dataUrl} 
                  download={note.fileName}
                  onClick={() => handleMarkAsRead(note.id)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg text-center transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>

      {selectedNote && (
        <Modal title={selectedNote.title} onClose={() => setSelectedNote(null)}>
          <div className="p-6 space-y-6">
            <div className="bg-indigo-600/10 p-4 rounded-xl border border-indigo-500/20">
              <h4 className="text-indigo-400 text-xs font-bold uppercase mb-2 tracking-widest">AI Summary</h4>
              <p className="text-gray-200 text-sm leading-relaxed">{selectedNote.summary}</p>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-widest">Key Concepts</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedNote.keyConcepts.map((concept, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    {concept}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-between items-center text-[10px] text-gray-500">
              <span>Complexity: <span className="text-white font-bold">{selectedNote.complexity}</span></span>
              <span>Reads: <span className="text-white font-bold">{selectedNote.readCount}</span></span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotesManager;
