import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, Student, LearningPath, LeaveApplication, Exam, ExamSubmission, UserRole, LiveClass, CampusEvent, QuestionPaper, HostelComplaint, LibrarySelfHelpBook, AppNotification } from '../types';
import Header from './Header';
import Chatbot from './Chatbot';
import RollAccountView from './RollAccountView';
import StudentLearningPlanner from './StudentLearningPlanner';
import FileManager from './FileManager';
import AttendanceCheckinFlow from './AttendanceCheckinFlow';
import PerformancePredictor from './PerformancePredictor';
import SharedLinksView from './SharedLinksView';
import AnimatedElement from './AnimatedElement';
import ProgressTracker from './ProgressTracker';
import { isWithinGeofence } from '../utils/geolocation';
import Spinner from './Spinner';
import AccountSettings from './AccountSettings';
import LeaveApplicationManager from './LeaveApplicationManager';
import ExamPortal from './ExamPortal';
import LiveClassesView from './LiveClassesView';
import ExtracurricularManager from './ExtracurricularManager';
import EventManager from './EventManager';
import CareerGuidance from './CareerGuidance';
import EmotionalPulse from './EmotionalPulse';
import Scholarships from './Scholarships';
import SkillPassport from './SkillPassport';
import SkillExchange from './SkillExchange';
import ResourceBooking from './ResourceBooking';
import ParentPrivacy from './ParentPrivacy';
import StudyRooms from './StudyRooms';
import AssignmentDualCheck from './AssignmentDualCheck';
import AIStudyTwin from './AIStudyTwin';
import NotesManager from './NotesManager';
import AbsentStudentView from './AbsentStudentView';
import TroubleshootingDocumentation from './TroubleshootingDocumentation';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  studentData: Student;
  onPlanUpdate: (learningPath: LearningPath) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateUser: (user: User) => void;
  leaveApplications: LeaveApplication[];
  onApplyForLeave: (applicationData: Omit<LeaveApplication, 'id' | 'status' | 'applicationDate'>) => void;
  exams: Exam[];
  examSubmissions: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
  liveClasses: LiveClass[];
  events: CampusEvent[];
  questionPapers: QuestionPaper[];
  onUploadQuestionPaper: (paper: Omit<QuestionPaper, 'id' | 'uploadedBy' | 'uploadedByName' | 'createdAt'>) => void;
  hostelComplaints: HostelComplaint[];
  onSubmitHostelComplaint: (complaint: Omit<HostelComplaint, 'id' | 'studentId' | 'studentName' | 'status' | 'createdAt'>) => void;
  librarySelfHelpBooks: LibrarySelfHelpBook[];
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onSubmitComplaint: (complaint: { subject: string; description: string }) => void;
}

type ReadinessStatus = 'idle' | 'checking' | 'ready' | 'geofence_fail' | 'permission_fail' | 'error';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, studentData, onPlanUpdate, onUpdateStudent, onUpdateUser, leaveApplications, onApplyForLeave, exams, examSubmissions, onSubmitExam, liveClasses, events, questionPapers, onUploadQuestionPaper, hostelComplaints, onSubmitHostelComplaint, librarySelfHelpBooks, notifications, onMarkNotificationAsRead, onSubmitComplaint }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckinFlowOpen, setIsCheckinFlowOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [complaintType, setComplaintType] = useState<'general' | 'hostel'>('general');

  // New states for the "Ready for Class" feature
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>('idle');
  const [readinessMessage, setReadinessMessage] = useState('Verify your location to enable attendance check-in.');
  const [verifiedLocation, setVerifiedLocation] = useState<GeolocationCoordinates | null>(null);

  const totalClasses = studentData.attendance.length;
  const presentClasses = studentData.attendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  const handleLocationCheck = useCallback(() => {
    setReadinessStatus('checking');
    setReadinessMessage('Getting your location... Please wait.');
    setVerifiedLocation(null);

    if (!navigator.geolocation) {
      setReadinessStatus('error');
      setReadinessMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User location:", position.coords);
        if (isWithinGeofence(position.coords)) {
          setReadinessStatus('ready');
          setReadinessMessage('Location Verified! You are inside the campus.');
          setVerifiedLocation(position.coords);
        } else {
          setReadinessStatus('geofence_fail');
          setReadinessMessage('You seem to be outside the campus boundary. Please move inside and try again.');
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let userMessage = 'Could not get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setReadinessStatus('permission_fail');
            userMessage += "Please enable location permissions for this site in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            setReadinessStatus('error');
            userMessage += "Location information is unavailable. Try connecting to a different network.";
            break;
          case error.TIMEOUT:
            setReadinessStatus('error');
            userMessage += "The request timed out. Please check your internet connection and try again.";
            break;
          default:
            setReadinessStatus('error');
            userMessage += "An unknown error occurred.";
            break;
        }
        setReadinessMessage(userMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      handleLocationCheck();
    } else {
      // FIX: Ensure the check-in flow (and face scan) is closed when navigating away from the overview tab.
      setIsCheckinFlowOpen(false);
    }
  }, [activeTab, handleLocationCheck]);


  const chatbotContext = useMemo(() => {
    let context = `User is a student named ${user.name}. They are viewing their ${activeTab} tab.`;

    if (studentData.learningPath) {
      const planString = studentData.learningPath.daily_plan
        .map(day => `- ${day.day}: ${day.focus_topic} (${day.learning_activity})`)
        .join('\n');
      
      context += `\n\nHere is the student's current learning plan:\nSummary: "${studentData.learningPath.overall_summary}"\nSchedule:\n${planString}`;
    } else {
      context += ' The student does not have an active AI-generated learning plan yet.';
    }
    
    return context;
  }, [user.name, activeTab, studentData.learningPath]);

  const chatbotActions = useMemo(() => ({
    navigate_to_tab: async (tab: string) => {
        const validTabs = ['overview', 'live', 'progress', 'attendance', 'leave', 'learning', 'activities', 'exams', 'events', 'career', 'files', 'links', 'papers', 'hostel', 'library', 'pulse', 'scholarships', 'passport', 'exchange', 'resources', 'privacy', 'rooms', 'assignments', 'twin', 'notes', 'absent', 'support'];
        const lowerTab = tab.toLowerCase().replace(/\s+/g, '');

        if (validTabs.includes(lowerTab)) {
            setActiveTab(lowerTab);
            return `OK. Navigated to the ${tab} tab.`;
        }
        return `Sorry, I can't find a tab called "${tab}". Please choose from: ${validTabs.join(', ')}.`;
    }
  }), []);
  
  const ReadinessStatusIcon: React.FC = () => {
    switch (readinessStatus) {
        case 'checking': return <Spinner />;
        case 'ready': return <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'geofence_fail':
        case 'permission_fail':
        case 'error':
             return <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
             return <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    }
  };

  const getReadinessMessageColor = () => {
     switch (readinessStatus) {
        case 'ready': return 'text-green-300';
        case 'geofence_fail':
        case 'permission_fail':
        case 'error': return 'text-red-300';
        default: return 'text-gray-400';
     }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedElement>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 interactive-card">
                  <h3 className="text-lg font-semibold text-indigo-400">Attendance Summary</h3>
                  <p className="text-4xl font-bold mt-2">{attendancePercentage.toFixed(1)}%</p>
                  <p className="text-gray-400">{presentClasses} / {totalClasses} classes attended</p>
                </div>
              </AnimatedElement>
              <AnimatedElement delay={100}>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 interactive-card">
                   <h3 className="text-lg font-semibold text-indigo-400">Activities Tracker</h3>
                   <p className="text-4xl font-bold mt-2">{(studentData.extracurriculars || []).length}</p>
                   <p className="text-gray-400">Active involvements</p>
                </div>
              </AnimatedElement>
              <AnimatedElement delay={200} className="md:col-span-2">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center interactive-card text-center min-h-[200px]">
                  <ReadinessStatusIcon />
                  <h3 className="text-xl font-bold text-white mt-4 mb-2">Ready for Class?</h3>
                  <p className={`mb-4 text-sm min-h-[40px] ${getReadinessMessageColor()}`}>{readinessMessage}</p>
                  
                  {readinessStatus !== 'ready' && (
                    <>
                        <button
                          onClick={handleLocationCheck}
                          disabled={readinessStatus === 'checking'}
                          className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-800 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center w-full max-w-xs"
                        >
                          {readinessStatus === 'checking' ? 'Checking...' : "I'm on Campus, Check My Location"}
                        </button>
                    </>
                  )}
                </div>
              </AnimatedElement>
            </div>
             {readinessStatus === 'ready' && (
                 <AnimatedElement delay={300} className="mt-6">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-green-500/50 flex flex-col items-center justify-center interactive-card">
                        <svg className="w-16 h-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="text-xl font-bold text-white mb-2">You're All Set!</h3>
                        <p className="text-gray-400 mb-4 text-center text-sm">Your on-campus location is verified. Proceed to mark your attendance.</p>
                        <button 
                          onClick={() => setIsCheckinFlowOpen(true)}
                          className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                        >
                          Mark My Attendance
                        </button>
                    </div>
                </AnimatedElement>
            )}
            <AnimatedElement delay={400} className="mt-6">
              <PerformancePredictor student={studentData} />
            </AnimatedElement>
          </div>
        );
      case 'live':
        return <AnimatedElement><LiveClassesView liveClasses={liveClasses} /></AnimatedElement>;
      case 'progress':
        return <AnimatedElement><ProgressTracker student={studentData} /></AnimatedElement>;
      case 'attendance':
        return <AnimatedElement><RollAccountView attendance={studentData.attendance} /></AnimatedElement>;
      case 'leave':
        return <AnimatedElement><LeaveApplicationManager 
            student={studentData}
            applications={leaveApplications}
            onApplyForLeave={onApplyForLeave}
        /></AnimatedElement>;
      case 'learning':
        return <AnimatedElement><StudentLearningPlanner 
            student={studentData} 
            onPlanGenerated={onPlanUpdate}
        /></AnimatedElement>;
      case 'activities':
        return <AnimatedElement><ExtracurricularManager 
            student={studentData} 
            mode="student"
            onAddActivity={(act) => {
              if (onUpdateStudent) {
                const newAct = { ...act, id: `act-${Date.now()}` };
                onUpdateStudent({
                  ...studentData,
                  extracurriculars: [...(studentData.extracurriculars || []), newAct]
                });
              }
            }}
            onDeleteActivity={(id) => {
              if (onUpdateStudent) {
                onUpdateStudent({
                  ...studentData,
                  extracurriculars: (studentData.extracurriculars || []).filter(a => a.id !== id)
                });
              }
            }}
        /></AnimatedElement>;
      case 'events':
        return <AnimatedElement><EventManager 
            user={user}
            events={events}
            onAddEvent={() => {}} 
            onDeleteEvent={() => {}} 
            mode="student"
        /></AnimatedElement>;
      case 'exams':
      case 'exam':
      case 'examportal':
      case 'exam portal':
      case 'exam-portal':
      case 'examinations':
        return <AnimatedElement><ExamPortal 
            studentId={user.id}
            exams={exams}
            submissions={examSubmissions}
            onSubmitExam={onSubmitExam}
        /></AnimatedElement>;
      case 'career':
        return <AnimatedElement><CareerGuidance insight={{
          courseName: studentData.department,
          marketDemand: "High demand for specialized engineers in automation, AI, and sustainable technologies. Companies are actively seeking graduates with practical problem-solving skills.",
          opportunities: ["Research & Development", "Product Management", "Software Architecture", "Systems Analysis", "Project Engineering"],
          trends: ["Cloud Native Computing", "Edge AI", "Sustainable Tech", "Cybersecurity Mesh"],
          skillValue: "A degree in this field combined with a strong portfolio is currently valued between $60k-$120k for entry-level roles globally.",
          futureScope: "With the rapid digital transformation, the scope is expanding into aerospace, smart cities, and advanced robotics.",
          earningPotential: {
            paths: [
              { title: "Entry Level", range: "₹6L - ₹12L PA" },
              { title: "Mid Senior", range: "₹18L - ₹35L PA" },
              { title: "Architect/CTO", range: "₹50L+ PA" }
            ],
            freelance: "Independent consultants in this field can earn up to $150/hr on platforms like Toptal or Upwork.",
            roles: ["DevOps Engineer", "Data Scientist", "Full Stack Developer", "AI Engineer"]
          }
        }} /></AnimatedElement>;
      case 'files':
        return <AnimatedElement><FileManager mode="student" /></AnimatedElement>;
      case 'links':
        return <AnimatedElement><SharedLinksView /></AnimatedElement>;
      case 'papers':
        return (
          <AnimatedElement>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Question Papers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-700">
                    <tr className="text-gray-400 text-sm">
                      <th className="pb-4 font-semibold">Subject</th>
                      <th className="pb-4 font-semibold">Exam Type</th>
                      <th className="pb-4 font-semibold">Year</th>
                      <th className="pb-4 font-semibold">Semester</th>
                      <th className="pb-4 font-semibold">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {questionPapers.map(paper => (
                      <tr key={paper.id} className="text-gray-300">
                        <td className="py-4">{paper.subject}</td>
                        <td className="py-4">{paper.examType}</td>
                        <td className="py-4">{paper.year}</td>
                        <td className="py-4">{paper.semester}</td>
                        <td className="py-4">
                          <a 
                            href={paper.fileUrl} 
                            download 
                            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                    {questionPapers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500 italic">No question papers available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedElement>
        );
      case 'hostel':
        return (
          <AnimatedElement>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Submit a Complaint</h3>
                <div className="flex bg-gray-900 rounded-lg p-1">
                  <button 
                    onClick={() => setComplaintType('general')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${complaintType === 'general' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    General
                  </button>
                  <button 
                    onClick={() => setComplaintType('hostel')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${complaintType === 'hostel' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Hostel
                  </button>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const title = formData.get('title') as string;
                  const description = formData.get('description') as string;

                  if (complaintType === 'hostel') {
                    onSubmitHostelComplaint({ title, description });
                  } else {
                    onSubmitComplaint({ subject: title, description });
                  }
                  
                  form.reset();
                  alert('Complaint submitted successfully!');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {complaintType === 'hostel' ? 'Complaint Title' : 'Subject'}
                  </label>
                  <input 
                    name="title" 
                    type="text" 
                    required 
                    placeholder={complaintType === 'hostel' ? "e.g. Water Issue, Electricity" : "e.g. Faculty, Facilities, Exam Schedule"} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={4} 
                    placeholder="Describe the problem in detail..." 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Upload Evidence (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all"
                >
                  Submit {complaintType === 'hostel' ? 'Hostel' : 'General'} Complaint
                </button>
              </form>
            </div>
          </AnimatedElement>
        );
      case 'library':
        return (
          <AnimatedElement>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Library Self-Help Books</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-700">
                    <tr className="text-gray-400 text-sm">
                      <th className="pb-4 font-semibold">Book Name</th>
                      <th className="pb-4 font-semibold">Author</th>
                      <th className="pb-4 font-semibold">Category</th>
                      <th className="pb-4 font-semibold">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {librarySelfHelpBooks.map(book => (
                      <tr key={book.id} className="text-gray-300">
                        <td className="py-4 font-medium">{book.bookName}</td>
                        <td className="py-4">{book.author}</td>
                        <td className="py-4 text-sm text-gray-400">{book.category}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            book.availability === 'Available' ? 'bg-green-600/20 text-green-400' :
                            book.availability === 'Borrowed' ? 'bg-red-600/20 text-red-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {book.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedElement>
        );
      case 'pulse':
        return <AnimatedElement><EmotionalPulse user={user} studentData={studentData} /></AnimatedElement>;
      case 'scholarships':
         return <AnimatedElement><Scholarships user={user} /></AnimatedElement>;
       case 'passport':
         return <AnimatedElement><SkillPassport user={user} /></AnimatedElement>;
       case 'exchange':
          return <AnimatedElement><SkillExchange user={user} /></AnimatedElement>;
        case 'resources':
          return <AnimatedElement><ResourceBooking user={user} /></AnimatedElement>;
        case 'privacy':
          return <AnimatedElement><ParentPrivacy user={user} /></AnimatedElement>;
        case 'rooms':
          return <AnimatedElement><StudyRooms user={user} /></AnimatedElement>;
        case 'assignments':
          return <AnimatedElement><AssignmentDualCheck user={user} /></AnimatedElement>;
        case 'twin':
          return <AnimatedElement><AIStudyTwin user={user} /></AnimatedElement>;
        case 'notes':
          return <AnimatedElement><NotesManager user={user} mode="student" /></AnimatedElement>;
        case 'absent':
          return <AnimatedElement><AbsentStudentView user={user} /></AnimatedElement>;
        case 'support':
          return <AnimatedElement><TroubleshootingDocumentation /></AnimatedElement>;
        default:
          return <AnimatedElement><ExamPortal 
              studentId={user.id}
              exams={exams}
              submissions={examSubmissions}
              onSubmitExam={onSubmitExam}
          /></AnimatedElement>;
      }
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
       {isCheckinFlowOpen && verifiedLocation && (
        <AttendanceCheckinFlow 
            user={user} 
            onClose={() => setIsCheckinFlowOpen(false)} 
            location={verifiedLocation} 
        />
       )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatedElement>
          <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
          <p className="text-gray-400 mb-6">Welcome back, {user.name}!</p>
        </AnimatedElement>
        
        <AnimatedElement className="border-b border-gray-700 mb-6 sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md" delay={100}>
            <nav className="flex flex-wrap gap-2 p-1" aria-label="Tabs">
                 {['overview', 'live', 'progress', 'attendance', 'leave', 'learning', 'activities', 'exams', 'events', 'career', 'files', 'links', 'papers', 'hostel', 'library', 'pulse', 'scholarships', 'passport', 'exchange', 'resources', 'privacy', 'rooms', 'assignments', 'twin', 'notes', 'absent', 'support'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`tab-button px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                       activeTab === tab ? 'active bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:text-gray-200'
                     }`}
                   >
                     {tab === 'live' ? 'Live Classes' :
                      tab === 'progress' ? 'Progress Tracker' :
                      tab === 'exams' ? 'Exam Portal' :
                      tab === 'leave' ? 'Leave Applications' :
                      tab === 'attendance' ? 'Full Attendance Record' :
                      tab === 'learning' ? 'AI Learning Planner' :
                      tab === 'links' ? 'Important Links' :
                      tab === 'career' ? 'Career' : 
                      tab === 'papers' ? 'Papers' :
                      tab === 'hostel' ? 'Hostel' :
                      tab === 'library' ? 'Library' :
                      tab === 'pulse' ? 'Pulse' :
                      tab === 'scholarships' ? 'Scholarships' :
                      tab === 'passport' ? 'Skill Passport' :
                      tab === 'exchange' ? 'Skill Exchange' :
                      tab === 'resources' ? 'Resources' :
                      tab === 'privacy' ? 'Privacy' :
                      tab === 'rooms' ? 'Study Rooms' :
                      tab === 'assignments' ? 'Assignments' :
                      tab === 'twin' ? 'AI Study Twin' :
                      tab === 'notes' ? 'Study Notes' :
                      tab === 'absent' ? 'Absent View' :
                      tab === 'support' ? 'Support' :
                      tab.charAt(0).toUpperCase() + tab.slice(1)}
                   </button>
                 ))}
            </nav>
          </AnimatedElement>

        {renderContent()}
      </main>
      
      <Chatbot 
        user={user}
        context={chatbotContext} 
        userRole={UserRole.Student} 
        actions={chatbotActions} 
      />
    </>
  );
};

export default StudentDashboard;
