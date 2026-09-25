
import React, { useState, useMemo } from 'react';
import { User, Student, LearningPath, AttendanceRecord, LeaveApplication, Exam, ExamSubmission, UserRole, LiveClass, CampusEvent, AdminTask, AdminMeeting, QuestionPaper, FacultyLeaveRequest, AppNotification, LeaveApprovalStatus, AdminRole } from '../types';
import Header from './Header';
import StudentDetailsView from './StudentDetailsView';
import AttendanceCamera from './AttendanceCamera';
import QRCodeScanner from './QRCodeScanner';
import Chatbot from './Chatbot';
import FileManager from './FileManager';
import LinkManager from './LinkManager';
import AnimatedElement from './AnimatedElement';
import StudentAccessManager from './StudentAccessManager';
import AccountSettings from './AccountSettings';
import LeaveRequestManager from './LeaveRequestManager';
import ExamManager from './ExamManager';
import LiveClassroom from './LiveClassroom';
import ExtracurricularManager from './ExtracurricularManager';
import EventManager from './EventManager';
import Modal from './Modal';
import LectureEngagement from './LectureEngagement';
import WorkloadBalancer from './WorkloadBalancer';
import ResourceBooking from './ResourceBooking';
import AssignmentDualCheck from './AssignmentDualCheck';
import TimetableManager from './TimetableManager';
import NotesManager from './NotesManager';
import StudyPlanManager from './StudyPlanManager';
import ChatAnalytics from './ChatAnalytics';

const ALL_SUBJECTS = [
    'Data Structures', 
    'Algorithms', 
    'Computer Graphics (CG)',
    'District Mathematics Structure (DMS)',
    'Open Elective-IQM',
    'Circuit Theory',
    'Civil GIS',
    'Surveying'
];

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  students: Student[];
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  onUpdateUser: (user: User) => void;
  leaveApplications: LeaveApplication[];
  onUpdateLeaveStatus: (applicationId: string, status: 'Approved' | 'Rejected', teacherComment?: string) => void;
  exams: Exam[];
  examSubmissions: ExamSubmission[];
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onDeleteSubmission: (submissionId: string) => void;
  liveClasses: LiveClass[];
  onScheduleClass: (newClass: LiveClass) => void;
  onDeleteClass: (classId: string) => void;
  onUpdateClassStatus: (classId: string, status: 'Live' | 'Completed') => void;
  events: CampusEvent[];
  onAddEvent: (event: Omit<CampusEvent, 'id' | 'createdAt'>) => void;
  onDeleteEvent: (id: string) => void;
  tasks: AdminTask[];
  meetings: AdminMeeting[];
  questionPapers: QuestionPaper[];
  onUploadQuestionPaper: (paper: Omit<QuestionPaper, 'id' | 'uploadedBy' | 'uploadedByName' | 'createdAt'>) => void;
  onDeleteQuestionPaper: (id: string) => void;
  facultyLeaveRequests: FacultyLeaveRequest[];
  onApplyFacultyLeave: (leaveData: Omit<FacultyLeaveRequest, 'id' | 'facultyId' | 'facultyName' | 'status' | 'approvalHistory' | 'createdAt' | 'currentLevel'>) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  hostelComplaints: any[];
  onResolveHostelComplaint: (id: string, status: 'Resolved' | 'In Progress') => void;
  complaints: any[];
  onResolveComplaint: (id: string, comment: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout, students, setStudents, onUpdateUser, leaveApplications, onUpdateLeaveStatus, exams, examSubmissions, onSaveExam, onDeleteExam, onDeleteSubmission, liveClasses, onScheduleClass, onDeleteClass, onUpdateClassStatus, events, onAddEvent, onDeleteEvent, tasks, meetings, questionPapers, onUploadQuestionPaper, onDeleteQuestionPaper, facultyLeaveRequests, onApplyFacultyLeave, notifications, onMarkNotificationAsRead, hostelComplaints, onResolveHostelComplaint, complaints, onResolveComplaint }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(ALL_SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState<'daily' | 'live' | 'records' | 'files' | 'links' | 'overview' | 'leave' | 'exams' | 'activities' | 'events' | 'tasks' | 'papers' | 'facultyLeave' | 'hostel' | 'complaints' | 'doubt_queue' | 'feedback' | 'workload' | 'resources' | 'assignments' | 'timetable' | 'notes' | 'chatanalytics'>('daily');
  const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    const studentToUpdate = students.find(s => s.id === studentId);
    if (!studentToUpdate) return;
    
    const existingRecordIndex = studentToUpdate.attendance.findIndex(
        record => record.date === today && record.subject === selectedSubject
    );

    let updatedAttendance = [...studentToUpdate.attendance];

    const newRecord: AttendanceRecord = {
        date: today,
        subject: selectedSubject,
        teacherName: user.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: status,
    };

    if (existingRecordIndex > -1) {
        updatedAttendance[existingRecordIndex] = newRecord;
    } else {
        updatedAttendance.push(newRecord);
    }

    const updatedStudent = { ...studentToUpdate, attendance: updatedAttendance };
    setStudents(students.map(s => s.id === studentId ? updatedStudent : s));
  };
  
  const handleBulkAttendanceUpdate = (updatedAttendanceStatus: { [studentId: string]: 'Present' | 'Absent' }) => {
    const studentIdsToUpdate = Object.keys(updatedAttendanceStatus);

    const newStudents = students.map(student => {
      if (studentIdsToUpdate.includes(student.id)) {
        const status = updatedAttendanceStatus[student.id];
        const existingRecordIndex = student.attendance.findIndex(
          a => a.date === today && a.subject === selectedSubject
        );

        let updatedAttendanceList = [...student.attendance];
        const newRecord: AttendanceRecord = {
          date: today,
          subject: selectedSubject,
          teacherName: user.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: status,
        };

        if (existingRecordIndex > -1) {
          updatedAttendanceList[existingRecordIndex] = newRecord;
        } else {
          updatedAttendanceList.push(newRecord);
        }
        return { ...student, attendance: updatedAttendanceList };
      }
      return student;
    });
    setStudents(newStudents);
    setIsCameraOpen(false);
  };
  
  const handleQRScanSuccess = (studentId: string) => {
    setIsQRScannerOpen(false); // Close modal on success
    const student = students.find(s => s.id === studentId);
    if (student) {
        handleAttendanceChange(studentId, 'Present');
        setScanStatus({ type: 'success', message: `✅ Attendance for ${student.name} marked successfully!` });
    } else {
        setScanStatus({ type: 'error', message: `❌ Student with ID ${studentId} not found.` });
    }
    window.setTimeout(() => setScanStatus(null), 5000);
  };

  const handlePlanGenerated = (learningPath: LearningPath) => {
    if (!selectedStudent) return;
    const updatedStudents = students.map(s =>
      s.id === selectedStudent.id ? { ...s, learningPath } : s
    );
    setStudents(updatedStudents);
    setSelectedStudent(prev => prev ? { ...prev, learningPath } : null);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student from the list? This action cannot be undone.')) {
      setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
    }
  };

  const getAttendanceStatusForToday = (student: Student): 'Present' | 'Absent' | 'Late' | 'N/A' => {
    const attendanceToday = student.attendance.find(a => a.date === today && a.subject === selectedSubject);
    return attendanceToday ? attendanceToday.status : 'N/A';
  };

  const filteredRecords = useMemo(() => {
    if (activeTab !== 'records') return [];
    
    const allRecords = students.flatMap(student =>
        student.attendance.map(record => ({
            ...record,
            studentName: student.name,
            rollNumber: student.rollNumber,
            studentId: student.id,
        }))
    );
    
    return allRecords
        .filter(record => {
            const recordDate = record.date;
            return recordDate >= startDate && recordDate <= endDate && record.subject === selectedSubject;
        })
        .sort((a, b) => {
            const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;
            return a.studentName.localeCompare(b.studentName);
        });
  }, [students, selectedSubject, startDate, endDate, activeTab]);

  const attendanceSummary = useMemo(() => {
    if (activeTab !== 'records' || filteredRecords.length === 0) {
      return {
        percentage: '0.0',
        present: 0,
        total: 0,
      };
    }

    const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
    const totalRecords = filteredRecords.length;
    const percentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    return {
        percentage: percentage.toFixed(1),
        present: presentCount,
        total: totalRecords,
    };
  }, [filteredRecords, activeTab]);

  const chatbotContext = useMemo(() => {
    let context = `User is a teacher named ${user.name}. They are viewing the ${activeTab} tab.`;
    if(activeTab === 'daily' || activeTab === 'records') {
        context += ` for the subject: ${selectedSubject}.`
    }
    if (selectedStudent) {
      context += ` They are currently viewing the details for student: ${selectedStudent.name} (Roll No: ${selectedStudent.rollNumber}).`;
    }
    return context;
  }, [user.name, activeTab, selectedSubject, selectedStudent]);

  const chatbotActions = useMemo(() => ({
    navigate_to_tab: async (tab: string) => {
        const validTabs = ['daily', 'live', 'leave', 'exams', 'records', 'overview', 'files', 'links'];
        const lowerTab = tab.toLowerCase().replace(/\s+/g, '');

        if (validTabs.includes(lowerTab as any)) {
            setActiveTab(lowerTab as any);
            return `OK. Navigated to the ${tab} tab.`;
        }
        return `Sorry, I can't find a tab called "${tab}". Please choose from: ${validTabs.join(', ')}.`;
    },
    find_student: async (studentName: string) => {
        const student = students.find(s => s.name.toLowerCase().includes(studentName.toLowerCase()));
        if (student) {
            setSelectedStudent(student);
            return `OK. Here are the details for ${student.name}.`;
        }
        return `Sorry, I could not find a student named "${studentName}".`;
    }
  }), [students]);

  const AddStudentForm: React.FC<{ onAdd: (studentData: { name: string, rollNumber: string, department: string }) => void, onClose: () => void }> = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [department, setDepartment] = useState('Computer Science');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !rollNumber.trim() || !department.trim()) {
            setError('All fields are required.');
            return;
        }
        if (students.some(s => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase())) {
            setError('A student with this roll number already exists.');
            return;
        }
        onAdd({ name: name.trim(), rollNumber: rollNumber.trim(), department });
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-4">
            {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">{error}</div>}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" required autoFocus/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Roll Number</label>
                <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-gray-700/50 rounded-lg p-2 text-white">
                    <option>Computer Science</option>
                    <option>Civil Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Electronics</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">Add Student</button>
            </div>
        </form>
    );
  };


  return (
    <>
      <Header 
        user={user} 
        onLogout={onLogout} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        notifications={notifications}
        onMarkNotificationAsRead={onMarkNotificationAsRead}
      />
       {isSettingsOpen && (
        <AccountSettings
            user={user}
            onUpdateUser={onUpdateUser}
            onClose={() => setIsSettingsOpen(false)}
        />
      )}
      {isAddStudentModalOpen && (
        <Modal title="Add New Student" onClose={() => setIsAddStudentModalOpen(false)}>
            <AddStudentForm
                onClose={() => setIsAddStudentModalOpen(false)}
                onAdd={(studentData) => {
                    const newStudent: Student = {
                        id: `user-${Date.now()}`,
                        name: studentData.name,
                        rollNumber: studentData.rollNumber,
                        department: studentData.department,
                        attendance: [],
                        learningPath: null,
                        isAccessBlocked: false,
                        behaviourStatus: 'Good',
                        blockReason: null,
                        progress: [],
                    };
                    setStudents(prev => [...prev, newStudent]);
                    setIsAddStudentModalOpen(false);
                }}
            />
        </Modal>
      )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatedElement className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          
          <div className="flex items-center gap-4">
             <label htmlFor="subject-select" className="text-sm font-medium text-gray-300">Class Subject:</label>
             <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                ))}
             </select>
          </div>

          <div className="flex space-x-2">
            <button
                onClick={() => setIsQRScannerOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
            >
                Scan Attendance QR
            </button>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105"
            >
              Class Face Scan
            </button>
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
            >
              Add New Student
            </button>
          </div>
        </AnimatedElement>

        {scanStatus && (
          <div className={`fixed top-20 right-8 p-4 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300 ${scanStatus ? 'opacity-100' : 'opacity-0'}`} role="alert">
            {scanStatus.message}
          </div>
        )}
        
        <AnimatedElement className="border-b border-gray-700 mb-6 sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md" delay={100}>
          <nav className="flex flex-wrap gap-2 p-1">
            {[
              { id: 'daily', label: 'Attendance' },
              { id: 'live', label: 'Live' },
              { id: 'doubt_queue', label: 'Doubt Queue' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'workload', label: 'Workload' },
              { id: 'resources', label: 'Resources' },
              { id: 'assignments', label: 'Assignments' },
              { id: 'timetable', label: 'Timetable' },
              { id: 'notes', label: 'Study Notes' },
              { id: 'chatanalytics', label: 'Chat AI' },
              { id: 'records', label: 'Records' },
              { id: 'leave', label: 'Leave' },
              { id: 'facultyLeave', label: 'My Leave' },
              { id: 'exams', label: 'Exams' },
              { id: 'events', label: 'Events' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'activities', label: 'Activities' },
              { id: 'papers', label: 'Papers' },
              { id: 'overview', label: 'Students' },
              { id: 'files', label: 'Files' },
              { id: 'links', label: 'Links' },
              { id: 'hostel', label: 'Hostel' },
              { id: 'complaints', label: 'Complaints' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-button px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'active bg-indigo-600/10 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </AnimatedElement>
        
        <AnimatedElement>
          {activeTab === 'daily' && (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-indigo-400">Student List for <span className="text-white">{selectedSubject}</span></h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-600">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Attendance Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const status = getAttendanceStatusForToday(student);
                      return (
                      <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3">{student.name}</td>
                        <td className="p-3">{student.rollNumber}</td>
                        <td className="p-3">{student.department}</td>
                        <td className="p-3">
                          <select
                            value={status}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value as 'Present' | 'Absent' | 'Late')}
                            className={`w-28 appearance-none text-center text-xs font-semibold rounded-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors ${
                            {
                                'Present': 'bg-green-600/50 text-green-200 border border-green-500/50',
                                'Absent': 'bg-red-600/50 text-red-200 border border-red-500/50',
                                'Late': 'bg-yellow-600/50 text-yellow-200 border border-yellow-500/50',
                                'N/A': 'bg-gray-600/50 text-gray-200 border border-gray-500/50'
                            }[status]
                            }`}
                          >
                            <option className="bg-gray-700 text-white" value="N/A" disabled>Not Marked</option>
                            <option className="bg-gray-700 text-white" value="Present">Present</option>
                            <option className="bg-gray-700 text-white" value="Absent">Absent</option>
                            <option className="bg-gray-700 text-white" value="Late">Late</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedStudent(student)}
                                    className="text-indigo-400 hover:underline text-sm"
                                >
                                    Details
                                </button>
                                <button 
                                    onClick={() => handleDeleteStudent(student.id)} 
                                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                    aria-label={`Delete ${student.name}`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                </button>
                            </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <LiveClassroom 
              students={students} 
              liveClasses={liveClasses}
              onScheduleClass={onScheduleClass}
              onDeleteClass={onDeleteClass}
              user={user}
              onUpdateClassStatus={onUpdateClassStatus}
            />
          )}

          {activeTab === 'leave' && (
            <LeaveRequestManager 
              leaveApplications={leaveApplications}
              onUpdateLeaveStatus={onUpdateLeaveStatus}
            />
          )}

           {activeTab === 'exams' && (
            <ExamManager 
                user={user}
                exams={exams}
                examSubmissions={examSubmissions}
                onSaveExam={onSaveExam}
                onDeleteExam={onDeleteExam}
                onDeleteSubmission={onDeleteSubmission}
            />
          )}
          
          {activeTab === 'records' && (
             <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-indigo-400">Records for <span className="text-white">{selectedSubject}</span></h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <label htmlFor="start-date" className="text-sm font-medium text-gray-400 mr-2">From:</label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="Start date for attendance records"
                            />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="text-sm font-medium text-gray-400 mr-2">To:</label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="End date for attendance records"
                            />
                        </div>
                    </div>
                </div>

                <AnimatedElement delay={100} className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="text-center">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Overall Attendance</p>
                        <p className={`text-5xl font-bold ${parseFloat(attendanceSummary.percentage) >= 75 ? 'text-green-400' : parseFloat(attendanceSummary.percentage) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {attendanceSummary.percentage}%
                        </p>
                        </div>
                        <div className="sm:border-l border-gray-600 sm:pl-6 text-center sm:text-left">
                        <p className="text-lg">
                            <span className="font-semibold text-white">{attendanceSummary.present}</span> out of <span className="font-semibold text-white">{attendanceSummary.total}</span> records marked as "Present".
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            In the selected date range for {selectedSubject}.
                        </p>
                        </div>
                    </div>
                </AnimatedElement>
            
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-600">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Roll Number</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map((record, index) => (
                                <tr key={`${record.date}-${record.studentId}-${index}`} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-3">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-3">{record.studentName}</td>
                                    <td className="p-3">{record.rollNumber}</td>
                                    <td className="p-3">
                                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            record.status === 'Present' ? 'bg-green-600/50 text-green-200' :
                                            record.status === 'Absent' ? 'bg-red-600/50 text-red-200' :
                                            'bg-yellow-600/50 text-yellow-200'
                                          }`}>
                                            {record.status}
                                          </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-400">
                                        No attendance records found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <StudentAccessManager students={students} setStudents={setStudents} />
          )}

          {activeTab === 'files' && (
            <FileManager mode="teacher" />
          )}

          {activeTab === 'links' && (
            <LinkManager user={user} />
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Student Extracurricular Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors group"
                    >
                      <div className="text-left">
                        <p className="font-medium text-white group-hover:text-indigo-400">{student.name}</p>
                        <p className="text-xs text-gray-500">{(student.extracurriculars || []).length} activities</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {selectedStudent && (
                <ExtracurricularManager 
                  student={selectedStudent} 
                  mode="teacher"
                  onAddActivity={() => {}} // Teacher doesn't add for student here
                  onDeleteActivity={() => {}} // Teacher doesn't delete here
                />
              )}
            </div>
          )}

          {activeTab === 'hostel' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Hostel Complaints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostelComplaints.length > 0 ? hostelComplaints.map(complaint => (
                  <div key={complaint.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{complaint.title}</h4>
                        <p className="text-sm text-gray-400">By: {complaint.studentName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 
                        complaint.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3">{complaint.description}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onResolveHostelComplaint(complaint.id, 'In Progress')}
                        className="flex-1 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-xs font-bold hover:bg-yellow-500/20 transition-all"
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => onResolveHostelComplaint(complaint.id, 'Resolved')}
                        className="flex-1 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-all"
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-gray-500 italic">No hostel complaints reported.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">General Student Complaints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.length > 0 ? complaints.map(complaint => (
                  <div key={complaint.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{complaint.subject}</h4>
                        <p className="text-sm text-gray-400">By: {complaint.userName} ({complaint.userRole})</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 
                        complaint.status === 'Investigating' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3">{complaint.description}</p>
                    {complaint.status !== 'Resolved' && (
                      <button 
                        onClick={() => onResolveComplaint(complaint.id, "Resolved by Teacher")}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20 text-gray-500 italic">No general complaints reported.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'doubt_queue' && (
            <LectureEngagement user={user} sessionId="session-123" isTeacher />
          )}

          {activeTab === 'feedback' && (
            <LectureEngagement user={user} sessionId="session-123" isTeacher />
          )}

          {activeTab === 'workload' && (
             <WorkloadBalancer user={user} />
           )}

           {activeTab === 'resources' && (
             <ResourceBooking user={user} />
           )}

           {activeTab === 'assignments' && (
             <AssignmentDualCheck user={user} isTeacher />
           )}

           {activeTab === 'timetable' && (
             <TimetableManager user={user} />
           )}

           {activeTab === 'notes' && (
             <div className="space-y-8">
               <StudyPlanManager user={user} />
               <NotesManager user={user} mode="teacher" />
             </div>
           )}

           {activeTab === 'chatanalytics' && (
             <ChatAnalytics />
           )}

          {activeTab === 'events' && (
            <EventManager 
              user={user}
              events={events}
              onAddEvent={onAddEvent}
              onDeleteEvent={onDeleteEvent}
              mode="teacher"
            />
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Assigned Tasks & Meetings</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Admin Tasks</h4>
                  {tasks.length > 0 ? tasks.map(task => (
                    <div key={task.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                      <h5 className="font-bold text-white text-lg">{task.title}</h5>
                      <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                        <span className="text-xs text-indigo-400 font-bold">Due: {task.deadline}</span>
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">{task.status}</span>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 italic">No tasks assigned yet.</p>}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Upcoming Meetings</h4>
                  {meetings.length > 0 ? meetings.map(meet => (
                    <div key={meet.id} className="bg-indigo-600/10 p-6 rounded-2xl border border-indigo-500/20">
                      <h5 className="font-bold text-white text-lg">{meet.title}</h5>
                      <p className="text-indigo-300 text-sm mt-1">{meet.date} at {meet.time}</p>
                      <a href={meet.meetLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">
                        Open Google Meet
                      </a>
                    </div>
                  )) : <p className="text-gray-500 italic">No meetings scheduled.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'papers' && (
            <div className="space-y-8">
              {/* Existing Question Paper UI */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Upload Question Paper</h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    onUploadQuestionPaper({
                      subject: formData.get('subject') as string,
                      examType: formData.get('examType') as any,
                      year: formData.get('year') as string,
                      semester: formData.get('semester') as string,
                      fileUrl: '#', 
                    });
                    form.reset();
                    alert('Question paper uploaded successfully!');
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                    <select name="subject" required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                      {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Exam Type</label>
                    <select name="examType" required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                      <option value="Midterm">Midterm</option>
                      <option value="Final">Final</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                    <input name="year" type="text" required placeholder="e.g. 2023" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Semester</label>
                    <input name="semester" type="text" required placeholder="e.g. 5th" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Upload File (PDF/JPG/PNG)</label>
                    <input type="file" accept=".pdf,image/*" required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all">
                      Upload Paper
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Your Uploaded Papers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                      <tr className="text-gray-400 text-sm">
                        <th className="pb-4">Subject</th>
                        <th className="pb-4">Type</th>
                        <th className="pb-4">Year/Sem</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {questionPapers.filter(p => p.uploadedBy === user.id).map(paper => (
                        <tr key={paper.id} className="text-gray-300">
                          <td className="py-4">{paper.subject}</td>
                          <td className="py-4">{paper.examType}</td>
                          <td className="py-4">{paper.year} ({paper.semester})</td>
                          <td className="py-4 text-sm">{new Date(paper.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => onDeleteQuestionPaper(paper.id)} className="text-red-400 hover:text-red-300">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facultyLeave' && (
            <div className="space-y-8">
              {/* Leave Application Form */}
              <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Apply for Leave
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const start = new Date(formData.get('startDate') as string);
                    const end = new Date(formData.get('endDate') as string);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    onApplyFacultyLeave({
                      leaveType: formData.get('leaveType') as string,
                      startDate: formData.get('startDate') as string,
                      endDate: formData.get('endDate') as string,
                      totalDays: diffDays,
                      reason: formData.get('reason') as string,
                    });
                    form.reset();
                    alert('Leave request submitted to HOD!');
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Leave Type</label>
                    <select name="leaveType" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="Earned Leave">Earned Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Duty Leave">Duty Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                    <input name="startDate" type="date" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                    <input name="endDate" type="date" required className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason</label>
                    <textarea name="reason" required rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white" placeholder="Provide a detailed reason..."></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Attachment (Optional)</label>
                    <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>

              {/* Leave Tracking Timeline */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Your Leave History & Tracking</h3>
                {facultyLeaveRequests.length > 0 ? facultyLeaveRequests.map(req => (
                  <div key={req.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{req.leaveType}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === LeaveApprovalStatus.Approved ? 'bg-green-600/20 text-green-400' :
                            req.status === LeaveApprovalStatus.Rejected ? 'bg-red-600/20 text-red-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">ID: {req.id} • Applied on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold text-lg">{req.startDate} to {req.endDate}</p>
                        <p className="text-gray-500 text-sm">{req.totalDays} Days Total</p>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative mt-10 mb-6">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2 rounded-full"></div>
                      <div className="relative flex justify-between">
                        {[AdminRole.HOD, AdminRole.Office, AdminRole.Dean, AdminRole.Principal, AdminRole.HR].map((role, idx) => {
                          const approval = req.approvalHistory.find(h => h.role === role);
                          const isRejected = approval?.status === LeaveApprovalStatus.Rejected;
                          const isApproved = approval?.status === LeaveApprovalStatus.Approved;
                          const isCurrent = req.currentLevel === role && req.status !== LeaveApprovalStatus.Rejected && req.status !== LeaveApprovalStatus.Approved;
                          
                          return (
                            <div key={role} className="flex flex-col items-center gap-3 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                                isApproved ? 'bg-green-600 border-green-900 text-white' :
                                isRejected ? 'bg-red-600 border-red-900 text-white' :
                                isCurrent ? 'bg-yellow-600 border-yellow-900 text-white animate-pulse' :
                                'bg-gray-800 border-gray-700 text-gray-500'
                              }`}>
                                {isApproved ? '✓' : isRejected ? '✗' : idx + 1}
                              </div>
                              <div className="text-center">
                                <p className={`text-xs font-black uppercase tracking-tighter ${
                                  isApproved ? 'text-green-400' :
                                  isRejected ? 'text-red-400' :
                                  isCurrent ? 'text-yellow-400' :
                                  'text-gray-500'
                                }`}>
                                  {role}
                                </p>
                                {approval?.comment && (
                                  <p className="text-[10px] text-gray-400 max-w-[80px] mt-1 line-clamp-2 italic">"{approval.comment}"</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {req.status === LeaveApprovalStatus.Rejected && (
                      <div className="mt-6 p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                          Application Rejected by {req.approvalHistory[req.approvalHistory.length-1]?.role}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Reason: {req.approvalHistory[req.approvalHistory.length-1]?.comment || 'No reason provided.'}</p>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-gray-700 border-dashed">
                    <p className="text-gray-500 italic">No leave applications found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatedElement>
      </main>

      {selectedStudent && (
        <StudentDetailsView
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onPlanGenerated={handlePlanGenerated}
        />
      )}
      {isCameraOpen && (
        <AttendanceCamera
          students={students}
          onClose={handleBulkAttendanceUpdate}
        />
      )}
      {isQRScannerOpen && (
        <QRCodeScanner
            onClose={() => setIsQRScannerOpen(false)}
            onScanSuccess={handleQRScanSuccess}
        />
      )}
      <Chatbot 
        user={user}
        context={chatbotContext} 
        userRole={UserRole.Teacher} 
        actions={chatbotActions} 
      />
    </>
  );
};

export default TeacherDashboard;
