export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Parent = 'parent',
  Admin = 'admin',
}

export enum AdminRole {
  HOD = 'HOD',
  Principal = 'Principal',
  Dean = 'Dean',
  Office = 'Office',
  HR = 'HR',
  DeptHead = 'Department Head',
  HostelIncharge = 'Hostel Incharge',
  WorkshopIncharge = 'Workshop Incharge',
  ExamCoordinator = 'Exam Coordinator',
  Other = 'Administrative Authority',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole; // For admins
  password?: string;
  mobile?: string;
  registeredPhotoUrl: string;
  childId?: string; // For parents
  enableScanOnLogin?: boolean;
}

export interface AttendanceRecord {
  date: string; // e.g., '2023-10-27'
  subject: string;
  teacherName: string;
  timestamp: string; // e.g., '09:05 AM'
  status: 'Present' | 'Absent' | 'Late';
}

export interface DailyPlanItem {
    day: string;
    focus_topic: string;
    learning_activity: string;
    practice_task: string;
    estimated_time: string;
}

export interface LearningPath {
    overall_summary: string;
    daily_plan: DailyPlanItem[];
}

// New types for Progress Tracking
export enum AssignmentStatus {
  Graded = 'Graded',
  Submitted = 'Submitted',
  Pending = 'Pending',
  Late = 'Late',
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submittedDate?: string;
  status: AssignmentStatus;
  score?: number;
  maxScore: number;
}

export interface SubjectProgress {
  subjectName: string;
  overallGrade: string;
  teacherFeedback: string;
  assignments: Assignment[];
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  attendance: AttendanceRecord[];
  learningPath: LearningPath | null;
  isAccessBlocked: boolean;
  behaviourStatus: 'Good' | 'Needs Improvement';
  blockReason: 'Low Attendance' | 'Behaviour Issue' | 'Attendance & Behaviour' | null;
  progress: SubjectProgress[]; // Added progress tracking
  temporaryAccessExpires?: number; // Timestamp for manual override
  extracurriculars?: ExtracurricularActivity[]; // Added extracurricular activities
  events?: CampusEvent[]; // Added campus events
}



export interface ExtracurricularActivity {
  id: string;
  title: string;
  category: 'Sports' | 'Arts' | 'Tech' | 'Volunteer' | 'Other';
  description: string;
  date: string;
  hoursSpent: number;
  status: 'Completed' | 'Ongoing' | 'Planned';
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface PerformancePrediction {
  predicted_performance: string;
  confidence_score: string;
  rationale: string;
}

export interface ProgressInsight {
    strengths: string[];
    areas_for_improvement: string[];
    actionable_advice: string;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  category: 'Online Course' | 'Workshop' | 'Competition' | 'Project Idea' | 'Reading';
  rationale: string;
}


export interface FileNode {
    id: string;
    name: string;
    type: 'file';
    parentId: string | null;
    dataUrl: string;
    fileType: string;
}
export interface FolderNode {
    id:string;
    name: string;
    type: 'folder';
    parentId: string | null;
}
export type FileSystemNode = FileNode | FolderNode;

export interface SharedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdBy: string; // teacher's user id
}

export interface SubjectNote {
  id: string;
  title: string;
  department: string;
  subject: string;
  fileName: string;
  fileType: string;
  dataUrl: string;
  complexity: 'Easy' | 'Medium' | 'Hard';
  summary: string;
  keyConcepts: string[];
  uploadedBy: string;
  createdAt: string;
  readCount: number;
}

export interface StudentNoteProgress {
  studentId: string;
  noteId: string;
  status: 'Viewed' | 'Completed';
  lastAccessed: string;
}

export interface ChatInteraction {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  query: string;
  response: string;
  timestamp: string;
}

export interface StudyPlanTopic {
  topic: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  reason: string;
  documentUrl?: string; // Data URL for the uploaded file
  status: 'Pending' | 'Approved' | 'Rejected';
  teacherComment?: string;
  applicationDate: string; // ISO string of submission date
}

// --- New Exam Types ---
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Exam {
  id:string;
  title: string;
  subject: string;
  durationMinutes: number;
  createdBy: string; // teacher's user id
  questions: Question[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: { [questionId: string]: string }; // questionId: selectedAnswer
  submittedAt: number; // timestamp
  score: number; // percentage
  status: 'Completed' | 'Blocked';
}

// --- New Live Class Types ---
export interface LiveClass {
  id: string;
  topic: string;
  subject: string;
  scheduledTime: number; // timestamp
  durationMinutes: number;
  meetLink: string;
  recordingUrl?: string;
  teacherId: string; // user.id of the teacher who created it
  teacherName: string;
  status: 'Scheduled' | 'Live' | 'Completed';
}

// --- Admin & New Features Types ---

export interface CareerInsight {
  courseName: string;
  marketDemand: string;
  opportunities: string[];
  trends: string[];
  skillValue: string;
  futureScope: string;
  earningPotential: {
    paths: { title: string; range: string }[];
    freelance: string;
    roles: string[];
  };
}

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // teacher's user id
  assignedBy: string; // admin's user id
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  description: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
  adminComment?: string;
  createdAt: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  location: string;
}

export interface AdminMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  invitedTeachers: string[]; // array of user ids
  createdBy: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  googleFormLink?: string;
  createdBy: string; // teacher's or admin's user id
  createdAt: string;
  budget?: number;
  expenses?: number;
  managerId?: string;
  responsibleStaff?: string[];
  report?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  organizer?: string; // Add for consistency with EventManager
  category?: string; // Add for consistency with EventManager
}

// --- New Question Paper Types ---
export interface QuestionPaper {
  id: string;
  subject: string;
  examType: 'Midterm' | 'Final' | 'Assignment';
  year: string;
  semester: string;
  fileUrl: string; // Data URL or external link
  uploadedBy: string; // user id
  uploadedByName: string;
  createdAt: string;
}

// --- New Hostel Complaint Types ---
export interface HostelComplaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  imageUrl?: string; // Optional photo evidence
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
}

// --- New Library Self-Help Book Types ---
export interface LibrarySelfHelpBook {
  id: string;
  bookName: string;
  author: string;
  category: string;
  availability: 'Available' | 'Borrowed' | 'Reserved';
}

// --- Faculty Leave Management (EduPlus) ---
export enum LeaveApprovalStatus {
  Pending = 'Pending',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface ApprovalLog {
  role: AdminRole;
  status: LeaveApprovalStatus;
  comment?: string;
  updatedBy: string; // user id
  updatedAt: string;
}

export interface FacultyLeaveRequest {
  id: string;
  facultyId: string;
  facultyName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  currentLevel: AdminRole; // e.g., HOD, Office, Dean, Principal, HR
  status: LeaveApprovalStatus;
  approvalHistory: ApprovalLog[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}
