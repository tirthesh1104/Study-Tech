import React, { useState, useMemo } from 'react';
import { User, Student, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import Header from './Header';
import Chatbot from './Chatbot';
import RollAccountView from './RollAccountView';
import LearningPathView from './LearningPathView';
import PersonalizedSuggestions from './PersonalizedSuggestions';
import ProgressTracker from './ProgressTracker';
import AccountSettings from './AccountSettings';
import AchievementWall from './AchievementWall';
import MonthlyProgressComparison from './MonthlyProgressComparison';
import BurnoutAlertCard from './BurnoutAlertCard';
import AnimatedElement from './AnimatedElement';

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
  childData: Student;
  onUpdateUser: (user: User) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onLogout, childData, onUpdateUser }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'attendance' | 'learning' | 'achievements' | 'comparison' | 'suggestions' | 'digest' | 'alerts'>('overview');
  const [visibility, setVisibility] = React.useState<any>(null);
  const [alerts, setAlerts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchVisibility = async () => {
      const { data } = await supabase.from('parent_visibility_settings').select('*').eq('student_id', childData.id).single();
      setVisibility(data || { show_attendance: true, show_assignments: true, show_grades: false, show_burnout: false });
    };
    fetchVisibility();
    
    // Simulate fetching alerts for this child
    setAlerts([
        { id: 1, type: 'Support', message: 'Your child may need extra support in Data Structures based on recent attendance.', date: new Date().toISOString() }
    ]);
  }, [childData.id]);

  const totalClasses = (childData.attendance || []).length;
  const presentClasses = (childData.attendance || []).filter(a => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  const latestAttendance = useMemo(() => {
    if (!childData.attendance || !Array.isArray(childData.attendance) || childData.attendance.length === 0) return null;
    return [...childData.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [childData.attendance]);

  const chatbotActions = useMemo(() => ({}), []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedElement delay={100} className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 backdrop-blur-sm group hover:border-indigo-500/50 transition-all">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Overall Attendance</h3>
                  <p className={`text-5xl font-black ${attendancePercentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>{attendancePercentage.toFixed(1)}%</p>
                  <p className="text-gray-400 mt-2 font-medium">{presentClasses} of {totalClasses} classes attended</p>
                </AnimatedElement>

                <AnimatedElement delay={200} className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 backdrop-blur-sm group hover:border-purple-500/50 transition-all">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Most Recent Record</h3>
                  {latestAttendance ? (
                    <div className="space-y-1">
                      <p className={`text-3xl font-black ${latestAttendance.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                        {latestAttendance.status}
                      </p>
                      <p className="text-white font-bold">{latestAttendance.subject}</p>
                      <p className="text-gray-400 text-sm">{new Date(latestAttendance.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 font-medium">No records yet.</p>
                  )}
                </AnimatedElement>

                <AnimatedElement delay={300} className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 backdrop-blur-sm flex flex-col justify-center text-center">
                  <h3 className="text-indigo-400 font-bold text-lg mb-2">AI Assistant</h3>
                  <p className="text-gray-400 text-sm font-medium">Ask about {childData.name}'s progress or school policies.</p>
                </AnimatedElement>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <BurnoutAlertCard student={childData} />
               {childData.learningPath && <LearningPathView learningPath={childData.learningPath} />}
            </div>
          </div>
        );
      case 'progress':
        return <ProgressTracker student={childData} />;
      case 'attendance':
        return <RollAccountView attendance={childData.attendance} />;
      case 'learning':
        return childData.learningPath ? <LearningPathView learningPath={childData.learningPath} /> : <div className="text-center py-20 text-gray-500 italic">No learning path generated yet.</div>;
      case 'achievements':
        return <AchievementWall student={childData} />;
      case 'comparison':
        return <MonthlyProgressComparison student={childData} />;
      case 'suggestions':
        return <PersonalizedSuggestions childData={childData} />;
      case 'digest':
        return <WeeklyDigest childData={childData} visibility={visibility} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} />;
      default:
        return null;
    }
  };

  const AlertsTab: React.FC<{ alerts: any[] }> = ({ alerts }) => (
    <div className="max-w-2xl mx-auto space-y-6">
        <AnimatedElement>
            <div className="bg-red-600/10 p-6 rounded-2xl border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400">Important Alerts</h3>
                <p className="text-gray-400 text-sm">Critical notifications regarding your child's academic progress</p>
            </div>
        </AnimatedElement>
        <div className="space-y-4">
            {alerts.map(alert => (
                <AnimatedElement key={alert.id} delay={100}>
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex gap-4">
                        <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-xl">⚠️</div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">{alert.type}</span>
                                <span className="text-[10px] text-gray-500">{new Date(alert.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-white font-medium">{alert.message}</p>
                        </div>
                    </div>
                </AnimatedElement>
            ))}
        </div>
    </div>
  );

  const WeeklyDigest: React.FC<{ childData: Student, visibility: any }> = ({ childData, visibility }) => {
    const attendancePercentage = useMemo(() => {
        const total = childData.attendance?.length || 0;
        const present = childData.attendance?.filter(a => a.status === 'Present').length || 0;
        return total > 0 ? (present / total) * 100 : 100;
    }, [childData]);

    const assignmentStats = useMemo(() => {
        const allAssignments = childData.progress?.flatMap(p => p.assignments) || [];
        const total = allAssignments.length;
        const submitted = allAssignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
        const onTime = allAssignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length; // Simplified
        return {
            total,
            submitted,
            percentage: total > 0 ? (submitted / total) * 100 : 100,
            onTime: total > 0 ? (onTime / total) * 100 : 100
        };
    }, [childData]);

    const averageGrade = useMemo(() => {
        if (!childData.progress || childData.progress.length === 0) return 'N/A';
        const grades = childData.progress.map(p => p.overallGrade);
        // Simplified: return the most frequent grade or just the first one for now
        return grades[0] || 'N/A';
    }, [childData]);

    const emotionalStatus = useMemo(() => {
        return childData.behaviourStatus === 'Good' ? 'Positive' : 'Needs Support';
    }, [childData]);

    return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AnimatedElement>
        <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2">Weekly Performance Digest</h3>
                <p className="text-indigo-100 font-medium">Report for {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            </div>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibility?.show_attendance && (
            <AnimatedElement delay={100} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Attendance Rate</h4>
                <div className="flex items-center gap-4">
                    <p className="text-4xl font-black text-white">{attendancePercentage.toFixed(1)}%</p>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${attendancePercentage > 75 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        {attendancePercentage > 75 ? 'Excellent' : 'Needs Focus'}
                    </span>
                </div>
            </AnimatedElement>
        )}

        {visibility?.show_assignments && (
            <AnimatedElement delay={200} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Assignments</h4>
                <div className="flex items-center gap-4">
                    <p className="text-4xl font-black text-white">{assignmentStats.percentage.toFixed(0)}%</p>
                    <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded">
                        {assignmentStats.onTime.toFixed(0)}% On Time
                    </span>
                </div>
            </AnimatedElement>
        )}

        {visibility?.show_grades && (
            <AnimatedElement delay={300} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Academic Grade</h4>
                <p className="text-4xl font-black text-white">{averageGrade}</p>
            </AnimatedElement>
        )}

        {visibility?.show_burnout && (
            <AnimatedElement delay={400} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Emotional Well-being</h4>
                <p className="text-4xl font-black text-white">{emotionalStatus}</p>
            </AnimatedElement>
        )}
      </div>

      <AnimatedElement delay={500} className="bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-700 text-center">
        <p className="text-gray-400 text-sm italic">This report is generated based on information shared by {childData.name}.</p>
      </AnimatedElement>
    </div>
  );
  };

  return (
    <>
      <Header user={user} onLogout={onLogout} onOpenSettings={() => setIsSettingsOpen(true)} />
      {isSettingsOpen && (
        <AccountSettings
            user={user}
            onUpdateUser={onUpdateUser}
            onClose={() => setIsSettingsOpen(false)}
        />
      )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatedElement className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Parent Dashboard</h1>
          <p className="text-gray-400 font-medium italic">Viewing academic progress for <span className="font-bold text-indigo-400 not-italic">{childData.name}</span>.</p>
        </AnimatedElement>
        
        <AnimatedElement className="border-b border-gray-700 mb-8 sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md" delay={100}>
          <nav className="flex flex-wrap gap-2 p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'digest', label: 'Weekly Digest' },
              { id: 'progress', label: 'Progress' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'learning', label: 'Learning' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'comparison', label: 'Monthly' },
              { id: 'suggestions', label: 'Insights' },
              { id: 'alerts', label: 'Alerts' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </AnimatedElement>

        {renderContent()}

      </main>

      <Chatbot 
        user={user}
        userRole={user.role} 
        context={`Parent: ${user.name}, Child: ${childData.name}, Active Tab: ${activeTab}`}
        actions={chatbotActions}
      />
    </>
  );
};

export default ParentDashboard;