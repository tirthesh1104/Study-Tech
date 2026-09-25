import { User, UserRole, Student, AssignmentStatus, Exam, LiveClass, AdminRole, LeaveApplication, QuestionPaper, HostelComplaint, LibrarySelfHelpBook, FacultyLeaveRequest, AppNotification, LeaveApprovalStatus, AdminTask, AdminMeeting, Complaint, CampusEvent } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Teacher Alice',
    email: 'teacher@school.com',
    role: UserRole.Teacher,
    password: 'password123',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=teacher@school.com',
    enableScanOnLogin: true,
  },
  {
    id: 'user-2',
    name: 'Student Bob',
    email: 'student@school.com',
    role: UserRole.Student,
    password: 'password123',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=student@school.com',
    enableScanOnLogin: true,
  },
  {
    id: 'user-3',
    name: 'Parent Carol',
    email: 'parent@school.com',
    role: UserRole.Parent,
    password: 'password123',
    childId: 'user-2',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=parent@school.com',
    enableScanOnLogin: true,
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Principal',
    email: 'admin@college.edu',
    password: 'admin',
    role: UserRole.Admin,
    adminRole: AdminRole.Principal,
    registeredPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256',
    enableScanOnLogin: true,
  },
  {
    id: 'user-admin-2',
    name: 'Prof. Sharma (HOD)',
    email: 'hod@college.edu',
    password: 'hod',
    role: UserRole.Admin,
    adminRole: AdminRole.HOD,
    registeredPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
    enableScanOnLogin: true,
  },
  {
    id: 'user-admin-dean',
    name: 'Dr. Mehta (Dean)',
    email: 'dean@college.edu',
    password: 'dean',
    role: UserRole.Admin,
    adminRole: AdminRole.Dean,
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=dean@college.edu',
    enableScanOnLogin: true,
  },
  {
    id: 'user-admin-hr',
    name: 'Ms. Kapoor (HR)',
    email: 'hr@college.edu',
    password: 'hr',
    role: UserRole.Admin,
    adminRole: AdminRole.HR,
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=hr@college.edu',
    enableScanOnLogin: true,
  },
  {
    id: 'user-admin-office',
    name: 'Mr. Gupta (Office)',
    email: 'office@college.edu',
    password: 'office',
    role: UserRole.Admin,
    adminRole: AdminRole.Office,
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=office@college.edu',
    enableScanOnLogin: true,
  },
  {
    id: 'user-hostel-1',
    name: 'Mr. Rajesh (Hostel Incharge)',
    email: 'hostel@college.edu',
    password: 'hostel',
    role: UserRole.Admin,
    adminRole: AdminRole.HostelIncharge,
    registeredPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
    enableScanOnLogin: true,
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'user-2',
    name: 'Student Bob',
    rollNumber: 'S001',
    department: 'Computer Science',
    attendance: [
      { date: '2023-10-27', subject: 'Computer Graphics (CG)', teacherName: 'Teacher Alice', timestamp: '10:00 AM', status: 'Present' },
      { date: '2023-10-27', subject: 'District Mathematics Structure (DMS)', teacherName: 'Teacher Alice', timestamp: '12:00 PM', status: 'Present' },
      { date: '2023-10-26', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:00 AM', status: 'Present' },
      { date: '2023-10-26', subject: 'Algorithms', teacherName: 'Teacher Alice', timestamp: '11:00 AM', status: 'Present' },
      { date: '2023-10-25', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:05 AM', status: 'Absent' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [
        {
            subjectName: 'Data Structures',
            overallGrade: 'A-',
            teacherFeedback: 'Excellent work on the recent assignments. Keep focusing on time complexity analysis.',
            assignments: [
                { id: 'ds-1', title: 'Lab 1: Arrays & Structs', dueDate: '2023-09-15', status: AssignmentStatus.Graded, score: 9, maxScore: 10, submittedDate: '2023-09-14' },
                { id: 'ds-2', title: 'Lab 2: Linked Lists', dueDate: '2023-09-22', status: AssignmentStatus.Graded, score: 8, maxScore: 10, submittedDate: '2023-09-22' },
                { id: 'ds-3', title: 'Mid-Term Project', dueDate: '2023-10-10', status: AssignmentStatus.Graded, score: 95, maxScore: 100, submittedDate: '2023-10-09' },
                { id: 'ds-4', title: 'Lab 3: Trees', dueDate: '2023-10-20', status: AssignmentStatus.Submitted, maxScore: 10 },
            ],
        },
        {
            subjectName: 'Algorithms',
            overallGrade: 'B+',
            teacherFeedback: 'Good understanding of core concepts, but be careful with edge cases in your implementations.',
            assignments: [
                { id: 'algo-1', title: 'Problem Set 1: Sorting', dueDate: '2023-09-18', status: AssignmentStatus.Graded, score: 8, maxScore: 10, submittedDate: '2023-09-18' },
                { id: 'algo-2', title: 'Problem Set 2: Recursion', dueDate: '2023-09-25', status: AssignmentStatus.Graded, score: 7, maxScore: 10, submittedDate: '2023-09-26' },
                { id: 'algo-3', title: 'Quiz 1', dueDate: '2023-10-12', status: AssignmentStatus.Graded, score: 88, maxScore: 100, submittedDate: '2023-10-12' },
                { id: 'algo-4', title: 'Problem Set 3: Graphs', dueDate: '2023-10-24', status: AssignmentStatus.Pending, maxScore: 10 },
            ],
        },
    ],
  },
  {
    id: 'user-4',
    name: 'Student David',
    rollNumber: 'S002',
    department: 'Computer Science',
    attendance: [
      { date: '2023-10-27', subject: 'Open Elective-IQM', teacherName: 'Teacher Alice', timestamp: '02:00 PM', status: 'Absent' },
      { date: '2023-10-26', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:00 AM', status: 'Absent' },
      { date: '2023-10-25', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:02 AM', status: 'Absent' },
      { date: '2023-10-24', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:02 AM', status: 'Absent' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [],
    extracurriculars: [
      { id: 'act-1', title: 'Football Team', category: 'Sports', description: 'Captain of the varsity football team.', date: '2023-10-20', hoursSpent: 10, status: 'Ongoing' },
      { id: 'act-2', title: 'Code Club', category: 'Tech', description: 'Working on a community project for the campus.', date: '2023-10-15', hoursSpent: 5, status: 'Ongoing' }
    ],
  },
  {
    id: 'user-5',
    name: 'Student Eve',
    rollNumber: 'S003',
    department: 'Civil Engineering',
    attendance: [
       { date: '2023-10-27', subject: 'Civil GIS', teacherName: 'Teacher Frank', timestamp: '11:00 AM', status: 'Present' },
       { date: '2023-10-26', subject: 'Surveying', teacherName: 'Teacher Frank', timestamp: '01:00 PM', status: 'Present' },
       { date: '2023-10-25', subject: 'Circuit Theory', teacherName: 'Teacher Frank', timestamp: '10:00 AM', status: 'Present' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [],
  },
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Data Structures - Mid-Term',
    subject: 'Data Structures',
    durationMinutes: 30,
    createdBy: 'user-1',
    questions: [
      {
        id: 'q1',
        text: 'What is the time complexity of searching for an element in a balanced binary search tree?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctAnswer: 'O(log n)',
      },
      {
        id: 'q2',
        text: 'Which data structure uses the Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        correctAnswer: 'Stack',
      },
      {
        id: 'q3',
        text: 'What is the purpose of a hash function in a hash table?',
        options: ['To sort the elements', 'To find the median element', 'To map keys to indices', 'To reverse the elements'],
        correctAnswer: 'To map keys to indices',
      },
    ],
  },
  {
    id: 'exam-2',
    title: 'Algorithms - Quiz 1',
    subject: 'Algorithms',
    durationMinutes: 15,
    createdBy: 'user-1',
    questions: [
      {
        id: 'q1',
        text: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
        correctAnswer: 'Merge Sort',
      },
      {
        id: 'q2',
        text: 'Dijkstra\'s algorithm is used to solve which problem?',
        options: ['Maximum flow', 'Minimum spanning tree', 'All-pairs shortest path', 'Single-source shortest path'],
        correctAnswer: 'Single-source shortest path',
      },
    ],
  },
];

// --- Mock Live Classes ---
const todayAt2PM = new Date();
todayAt2PM.setHours(14, 0, 0, 0);

const yesterdayAt10AM = new Date();
yesterdayAt10AM.setDate(yesterdayAt10AM.getDate() - 1);
yesterdayAt10AM.setHours(10, 0, 0, 0);

export const MOCK_LIVE_CLASSES: LiveClass[] = [
  {
    id: 'live-1',
    topic: 'Introduction to Linked Lists',
    subject: 'Data Structures',
    scheduledTime: todayAt2PM.getTime(),
    durationMinutes: 45,
    meetLink: 'https://meet.google.com/lookup/d5fvyq7cft',
    teacherId: 'user-1',
    teacherName: 'Teacher Alice',
    status: 'Scheduled',
  },
  {
    id: 'live-2',
    topic: 'Big O Notation',
    subject: 'Algorithms',
    scheduledTime: yesterdayAt10AM.getTime(),
    durationMinutes: 60,
    meetLink: 'https://meet.google.com/lookup/g2h3jk4lmn',
    recordingUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example placeholder
    teacherId: 'user-1',
    teacherName: 'Teacher Alice',
    status: 'Completed',
  },
];

export const MOCK_LEAVE_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'leave-1',
    studentId: 'user-2',
    studentName: 'Student Bob',
    startDate: '2023-11-01',
    endDate: '2023-11-02',
    reason: 'Fever',
    status: 'Pending',
    applicationDate: new Date().toISOString(),
    studentRollNumber: 'S001'
  }
];

export const MOCK_QUESTION_PAPERS: QuestionPaper[] = [
  {
    id: 'qp-1',
    subject: 'Data Structures',
    examType: 'Midterm',
    year: '2023',
    semester: '3rd',
    fileUrl: '#',
    uploadedBy: 'user-1',
    uploadedByName: 'Teacher Alice',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'qp-2',
    subject: 'Algorithms',
    examType: 'Final',
    year: '2022',
    semester: '4th',
    fileUrl: '#',
    uploadedBy: 'user-admin-1',
    uploadedByName: 'Dr. Principal',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_HOSTEL_COMPLAINTS: HostelComplaint[] = [
  {
    id: 'hc-1',
    studentId: 'user-2',
    studentName: 'Student Bob',
    title: 'Water Issue',
    description: 'No water supply in Room 102 since morning.',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_LIBRARY_SELF_HELP_BOOKS: LibrarySelfHelpBook[] = [
  {
    id: 'lib-1',
    bookName: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    availability: 'Available',
  },
  {
    id: 'lib-2',
    bookName: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity',
    availability: 'Available',
  },
  {
    id: 'lib-3',
    bookName: 'The 5 AM Club',
    author: 'Robin Sharma',
    category: 'Self-Help',
    availability: 'Borrowed',
  }
];

export const MOCK_FACULTY_LEAVE_REQUESTS: FacultyLeaveRequest[] = [
  {
    id: 'leave-f-1',
    facultyId: 'user-1',
    facultyName: 'Teacher Alice',
    leaveType: 'Medical Leave',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    totalDays: 3,
    reason: 'Severe fever and doctor recommended rest.',
    currentLevel: AdminRole.HOD,
    status: LeaveApprovalStatus.Pending,
    approvalHistory: [],
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    message: 'Welcome to EduPlus! Your dashboard is ready.',
    type: 'info',
    isRead: false,
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_ADMIN_TASKS: AdminTask[] = [
  {
    id: 'task-1',
    title: 'Review Syllabus',
    description: 'Review the updated syllabus for Computer Science.',
    assignedTo: 'user-1',
    assignedBy: 'user-admin-1',
    status: 'Pending',
    deadline: '2023-11-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Grade Midterms',
    description: 'Finish grading all mid-term papers by Friday.',
    assignedTo: 'user-1',
    assignedBy: 'user-admin-2',
    status: 'In Progress',
    deadline: '2023-11-15',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_ADMIN_MEETINGS: AdminMeeting[] = [
  {
    id: 'meet-1',
    title: 'Faculty Monthly Meeting',
    date: '2023-11-25',
    time: '10:00 AM',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    invitedTeachers: ['user-1'],
    createdBy: 'user-admin-1',
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    userId: 'user-2',
    userName: 'Student Bob',
    userRole: UserRole.Student,
    subject: 'Library AC',
    description: 'The AC in the library is not working properly.',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'event-1',
    title: 'Tech Fest 2023',
    description: 'Annual technology festival with workshops and competitions.',
    date: '2023-12-10',
    location: 'Main Auditorium',
    organizer: 'Tech Club',
    category: 'Academic',
    time: '10:00 AM',
    createdBy: 'user-admin-1',
    status: 'Planned',
    createdAt: new Date().toISOString(),
  }
];
