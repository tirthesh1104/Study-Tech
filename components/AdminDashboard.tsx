import React, { useState, useMemo } from 'react';
import { User, UserRole, AdminRole, AdminTask, AdminMeeting, Complaint, LibraryBook, CampusEvent, Student } from '../types';
import AnimatedElement from './AnimatedElement';
import EventManager from './EventManager';
import AtRiskPanel from './AtRiskPanel';
import ClassMoodHeatmap from './ClassMoodHeatmap';
import FeeDefaulterPredictor from './FeeDefaulterPredictor';
import Modal from './Modal';
import AdminRiskMonitor from './AdminRiskMonitor';
import AdminSOSManager from './AdminSOSManager';
import WorkloadBalancer from './WorkloadBalancer';
import TimetableManager from './TimetableManager';
import ChatAnalytics from './ChatAnalytics';
import AdminAnalytics from './AdminAnalytics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  users: User[];
  students: Student[];
  onDeleteUser: (userId: string) => void;
  onUpdateUserAccess: (userId: string, isBlocked: boolean) => void;
  tasks: AdminTask[];
  onAssignTask: (task: Omit<AdminTask, 'id' | 'createdAt'>) => void;
  meetings: AdminMeeting[];
  onScheduleMeeting: (meeting: Omit<AdminMeeting, 'id'>) => void;
  complaints: Complaint[];
  onResolveComplaint: (id: string, comment: string) => void;
  libraryBooks: LibraryBook[];
  onUpdateLibrary: (books: LibraryBook[]) => void;
  events: CampusEvent[];
  onAddEvent: (event: Omit<CampusEvent, 'id' | 'createdAt'>) => void;
  onDeleteEvent: (id: string) => void;
  hostelComplaints: any[];
  onResolveHostelComplaint: (id: string, status: 'Resolved' | 'In Progress') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'atrisk' | 'moodheatmap' | 'feedefaulter' | 'tasks' | 'meetings' | 'complaints' | 'library' | 'events' | 'hostel' | 'risk_monitor' | 'incidents' | 'workload' | 'timetable' | 'resources' | 'chatanalytics' | 'campusanalytics'>('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManager {...props} />;
      case 'analytics':
        return <AnalyticsSection {...props} />;
      case 'atrisk':
        return <AtRiskPanel students={props.students} />;
      case 'moodheatmap':
        return <ClassMoodHeatmap students={props.students} />;
      case 'feedefaulter':
        return <FeeDefaulterPredictor students={props.students} />;
      case 'tasks':
        return <TaskAssignmentSection {...props} />;
      case 'meetings':
        return <MeetingIntegrationSection {...props} />;
      case 'complaints':
        return <ComplaintManagementSection {...props} />;
      case 'library':
        return <LibraryManagementSection {...props} />;
      case 'hostel':
        return <HostelComplaintSection {...props} />;
      case 'events':
        return <EventManager {...props} mode="teacher" />;
      case 'risk_monitor':
        return <AdminRiskMonitor students={props.students} />;
      case 'incidents':
        return <AdminSOSManager user={props.user} />;
      case 'workload':
        return <WorkloadBalancer user={props.user} isAdmin />;
      case 'timetable':
        return <TimetableManager user={props.user} isAdmin />;
      case 'chatanalytics':
        return <ChatAnalytics />;
      case 'campusanalytics':
        return <AdminAnalytics students={props.students} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900/50 p-8 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">Admin <span className="text-indigo-500">Portal</span></h1>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {props.user.adminRole || 'Super Admin'}
                </span>
              </div>
              <p className="text-gray-400 font-medium mt-1">Logged in as <span className="text-gray-200">{props.user.name}</span></p>
            </div>
          </div>
          <button
            onClick={props.onLogout}
            className="px-6 py-3 bg-gray-800 hover:bg-red-600/10 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/50 rounded-2xl transition-all font-bold flex items-center gap-2 group"
          >
            <span>Sign Out</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        <nav className="flex flex-wrap gap-2 p-2 bg-gray-950/50 rounded-2xl border border-gray-800 backdrop-blur-sm sticky top-4 z-30 shadow-xl overflow-x-auto">
          {[
            { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'risk_monitor', label: 'Risk Monitor', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'incidents', label: 'Incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { id: 'timetable', label: 'Timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'chatanalytics', label: 'Chat AI', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { id: 'campusanalytics', label: 'Campus Stats', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
            { id: 'workload', label: 'Workload', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'complaints', label: 'Complaints', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { id: 'library', label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: 'hostel', label: 'Hostel', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="bg-gray-900/30 rounded-3xl border border-gray-800 p-8 min-h-[600px]">
          <AnimatedElement key={activeTab}>
            {renderContent()}
          </AnimatedElement>
        </main>
      </div>
    </div>
  );
};

// --- Sub-components ---

const UserManager: React.FC<AdminDashboardProps> = ({ users, onDeleteUser, onUpdateUserAccess }) => {
  const [filter, setFilter] = useState<UserRole | 'all'>('all');

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
          {['all', UserRole.Student, UserRole.Teacher, UserRole.Parent].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filter === role ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
          <div key={user.id} className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-gray-800/60 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-indigo-500/30 overflow-hidden">
                <img src={user.registeredPhotoUrl || 'https://via.placeholder.com/150'} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{user.role}</span>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => onUpdateUserAccess(user.id, true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-xs font-bold hover:bg-yellow-500/20 transition-all"
              >
                Restrict Access
              </button>
              <button
                onClick={() => onDeleteUser(user.id)}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all"
              >
                Delete User
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium italic">No users found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsSection: React.FC<AdminDashboardProps> = ({ users, complaints, libraryBooks, students }) => {
  const stats = [
    { label: 'Total Students', value: users.filter(u => u.role === UserRole.Student).length, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Faculty', value: users.filter(u => u.role === UserRole.Teacher).length, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Pending Complaints', value: complaints.filter(c => c.status === 'Pending').length, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Library Books', value: libraryBooks.reduce((acc, b) => acc + b.totalCopies, 0), color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  const chartData = useMemo(() => {
    // 1. Enrollment by Role
    const roleData = [
      { name: 'Students', value: users.filter(u => u.role === UserRole.Student).length },
      { name: 'Teachers', value: users.filter(u => u.role === UserRole.Teacher).length },
      { name: 'Parents', value: users.filter(u => u.role === UserRole.Parent).length },
      { name: 'Admins', value: users.filter(u => u.role === UserRole.Admin).length },
    ];

    // 2. Complaint Status Distribution
    const complaintData = [
      { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length },
      { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
    ];

    // 3. Attendance by Department (Average)
    const deptMap = new Map<string, { sum: number, count: number }>();
    students.forEach(s => {
      const dept = s.department || 'Unknown';
      const total = s.attendance.length;
      const present = s.attendance.filter(a => a.status === 'Present').length;
      const pct = total > 0 ? (present / total) * 100 : 100;
      
      const current = deptMap.get(dept) || { sum: 0, count: 0 };
      deptMap.set(dept, { sum: current.sum + pct, count: current.count + 1 });
    });

    const deptAttendanceData = Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      percentage: Math.round(data.sum / data.count)
    })).sort((a, b) => b.percentage - a.percentage);

    return { roleData, complaintData, deptAttendanceData };
  }, [users, complaints, students]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Academic Analytics</h2>
          <p className="text-gray-400 font-medium">Real-time campus-wide insights and data distribution.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest animate-pulse">
          Live Data Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <AnimatedElement key={i} delay={i * 50}>
            <div className={`${stat.bg} p-8 rounded-3xl border border-gray-800/50 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform duration-300`}>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
              <p className={`text-5xl font-black ${stat.color} drop-shadow-sm`}>{stat.value}</p>
            </div>
          </AnimatedElement>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Attendance Bar Chart */}
        <AnimatedElement delay={200} className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            Avg. Attendance by Department
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.deptAttendanceData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '1rem', padding: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.deptAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#10b981' : entry.percentage >= 60 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
           {/* User Distribution Pie Chart */}
          <AnimatedElement delay={300} className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              User Distribution
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    formatter={(value, entry: any) => <span className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AnimatedElement>

          {/* Complaint Resolution Progress */}
          <AnimatedElement delay={400} className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800 backdrop-blur-sm">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
              Complaint Status
            </h3>
            <div className="space-y-6">
              {chartData.complaintData.map((item, i) => {
                const total = complaints.length || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{item.name}</span>
                      <span className="text-sm font-black text-white">{item.value} <span className="text-gray-500 text-[10px]">({percentage}%)</span></span>
                    </div>
                    <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                      <div 
                        className={`h-full transition-all duration-1000 ${item.name === 'Resolved' ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
};

const TaskAssignmentSection: React.FC<AdminDashboardProps> = ({ users, tasks, onAssignTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const teachers = users.filter(u => u.role === UserRole.Teacher);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: teachers[0]?.id || '', deadline: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignTask({ ...newTask, assignedBy: 'current-admin', status: 'Pending' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Task Assignment</h2>
        <button onClick={() => setIsAdding(true)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
          New Task
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Task Title" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <select className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <textarea placeholder="Description" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white md:col-span-2" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            <input type="date" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" required value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 bg-gray-700 rounded-xl text-white font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold">Assign</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">{task.title}</h3>
              <p className="text-sm text-gray-400">Assigned to: {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}</p>
              <p className="text-xs text-indigo-400 font-bold mt-1">Deadline: {task.deadline}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              {task.status}
            </span>
          </div>
        )) : (
          <div className="text-center py-12 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium italic">No tasks assigned yet. Click "New Task" to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MeetingIntegrationSection: React.FC<AdminDashboardProps> = ({ users, meetings, onScheduleMeeting }) => {
  const [isAdding, setIsAdding] = useState(false);
  const teachers = users.filter(u => u.role === UserRole.Teacher);
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', meetLink: '', invitedTeachers: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScheduleMeeting({ ...newMeeting, createdBy: 'current-admin' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Teacher Meetings</h2>
        <button onClick={() => setIsAdding(true)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v3a3 3 0 00-3 3V6z" /></svg>
          Schedule via Google Meet
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Meeting Title" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white md:col-span-2" required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} />
            <input type="date" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" required value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} />
            <input type="time" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" required value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} />
            <input type="url" placeholder="Google Meet Link" className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white md:col-span-2" required value={newMeeting.meetLink} onChange={e => setNewMeeting({...newMeeting, meetLink: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 bg-gray-700 rounded-xl text-white font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold">Schedule</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {meetings.length > 0 ? meetings.map(meeting => (
          <div key={meeting.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">{meeting.title}</h3>
              <p className="text-gray-400">{meeting.date} at {meeting.time}</p>
            </div>
            <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
              Join Meeting
            </a>
          </div>
        )) : (
          <div className="text-center py-12 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium italic">No meetings scheduled. Click "Schedule via Google Meet" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ComplaintManagementSection: React.FC<AdminDashboardProps> = ({ complaints, onResolveComplaint }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Complaint Management</h2>
      <div className="grid grid-cols-1 gap-4">
        {complaints.length > 0 ? complaints.map(complaint => (
          <div key={complaint.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{complaint.subject}</h3>
                <p className="text-sm text-gray-400">By {complaint.userName} ({complaint.userRole})</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {complaint.status}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-6">{complaint.description}</p>
            {complaint.status !== 'Resolved' && (
              <button 
                onClick={() => onResolveComplaint(complaint.id, "Resolved by Admin")}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        )) : (
          <div className="text-center py-12 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium italic">No complaints reported. Everything is running smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LibraryManagementSection: React.FC<AdminDashboardProps> = ({ libraryBooks, onUpdateLibrary }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState<Partial<LibraryBook>>({
    title: '',
    author: '',
    category: 'Tech',
    totalCopies: 1,
    availableCopies: 1,
    location: ''
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const bookToAdd: LibraryBook = {
      ...newBook as LibraryBook,
      id: `book-${Date.now()}`,
    };

    onUpdateLibrary([...libraryBooks, bookToAdd]);
    setIsModalOpen(false);
    setNewBook({
      title: '',
      author: '',
      category: 'Tech',
      totalCopies: 1,
      availableCopies: 1,
      location: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Library System</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
        >
          Add New Book
        </button>
      </div>

      {isModalOpen && (
        <Modal title="Add New Book to Library" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Clean Architecture"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Robert C. Martin"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  value={newBook.category}
                  onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Tech">Technology</option>
                  <option value="Management">Management</option>
                  <option value="Science">Science</option>
                  <option value="Literature">Literature</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Shelf</label>
                <input
                  type="text"
                  value={newBook.location}
                  onChange={e => setNewBook({ ...newBook, location: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. A-12"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={newBook.totalCopies}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    setNewBook({ ...newBook, totalCopies: val, availableCopies: val });
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all mt-4"
            >
              Add Book to Database
            </button>
          </form>
        </Modal>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraryBooks.length > 0 ? libraryBooks.map(book => (
          <div key={book.id} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 hover:bg-gray-800/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <button 
                onClick={() => onUpdateLibrary(libraryBooks.filter(b => b.id !== book.id))}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete Book"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
            <p className="text-sm text-gray-400 mb-4 font-medium">{book.author}</p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">{book.category}</span>
                {book.location && <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Shelf: {book.location}</p>}
              </div>
              <div className="text-right">
                <span className={`text-xs font-black ${book.availableCopies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {book.availableCopies} / {book.totalCopies}
                </span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium italic">Library database is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HostelComplaintSection: React.FC<AdminDashboardProps> = ({ hostelComplaints, onResolveHostelComplaint }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Hostel Complaints</h2>
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
  );
};

export default AdminDashboard;