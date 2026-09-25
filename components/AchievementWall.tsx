import React, { useState } from 'react';
import { Student, AssignmentStatus } from '../types';

interface AchievementWallProps {
  student: Student;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  earned: boolean;
  earnedDate?: string;
  category: 'Attendance' | 'Academic' | 'Activity' | 'Behaviour';
}

const AchievementWall: React.FC<AchievementWallProps> = ({ student }) => {
  const [shareMsg, setShareMsg] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  // --- Derive badges from existing student data ---
  const totalClasses = student.attendance.length;
  const presentClasses = student.attendance.filter(a => a.status === 'Present').length;
  const attendancePct = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  const allAssignments = (student.progress || []).flatMap(s => s.assignments || []);
  const gradedAssignments = allAssignments.filter(a => a.status === AssignmentStatus.Graded && a.score !== undefined);
  const avgScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / gradedAssignments.length
    : 0;
  const allSubmitted = allAssignments.length > 0 && allAssignments.every(a => a.status !== AssignmentStatus.Pending);
  const hasAGrade = gradedAssignments.some(a => (a.score! / a.maxScore) * 100 >= 90);
  const extracurriculars = student.extracurriculars ?? [];

  const badges: Badge[] = [
    {
      id: 'perfect-attendance',
      title: '🏆 Perfect Attendance',
      description: '100% attendance maintained',
      icon: '🏆',
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/40',
      earned: attendancePct === 100,
      earnedDate: attendancePct === 100 ? 'This Semester' : undefined,
      category: 'Attendance',
    },
    {
      id: 'star-student',
      title: '⭐ Star Student',
      description: '90%+ attendance record',
      icon: '⭐',
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/40',
      earned: attendancePct >= 90,
      earnedDate: attendancePct >= 90 ? 'This Semester' : undefined,
      category: 'Attendance',
    },
    {
      id: 'academic-excellence',
      title: '🎓 Academic Excellence',
      description: 'Average score above 85%',
      icon: '🎓',
      color: 'text-indigo-300',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/40',
      earned: avgScore >= 85,
      earnedDate: avgScore >= 85 ? 'Recent Exams' : undefined,
      category: 'Academic',
    },
    {
      id: 'a-grade',
      title: '💯 Top Scorer',
      description: 'Scored 90%+ in an assignment',
      icon: '💯',
      color: 'text-green-300',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/40',
      earned: hasAGrade,
      earnedDate: hasAGrade ? 'Recent Assignment' : undefined,
      category: 'Academic',
    },
    {
      id: 'assignment-champion',
      title: '📚 Assignment Champion',
      description: 'All assignments submitted on time',
      icon: '📚',
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/40',
      earned: allSubmitted && allAssignments.length > 0,
      earnedDate: allSubmitted ? 'This Month' : undefined,
      category: 'Academic',
    },
    {
      id: 'good-behaviour',
      title: '🌟 Good Behaviour',
      description: 'Excellent conduct record',
      icon: '🌟',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/40',
      earned: student.behaviourStatus === 'Good',
      earnedDate: student.behaviourStatus === 'Good' ? 'This Year' : undefined,
      category: 'Behaviour',
    },
    {
      id: 'multi-talent',
      title: '🎭 Multi-Talent',
      description: 'Active in extracurricular activities',
      icon: '🎭',
      color: 'text-pink-300',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/40',
      earned: extracurriculars.length >= 2,
      earnedDate: extracurriculars.length >= 2 ? 'This Semester' : undefined,
      category: 'Activity',
    },
    {
      id: 'sports-star',
      title: '⚽ Sports Star',
      description: 'Participated in sports activities',
      icon: '⚽',
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/40',
      earned: extracurriculars.some(e => e.category === 'Sports'),
      earnedDate: extracurriculars.find(e => e.category === 'Sports')?.date,
      category: 'Activity',
    },
    {
      id: 'tech-wizard',
      title: '💻 Tech Wizard',
      description: 'Involved in tech clubs/projects',
      icon: '💻',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/40',
      earned: extracurriculars.some(e => e.category === 'Tech'),
      earnedDate: extracurriculars.find(e => e.category === 'Tech')?.date,
      category: 'Activity',
    },
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned);

  // WhatsApp share
  const handleWhatsAppShare = (badge: Badge) => {
    const text = `🎉 Proud moment! My child *${student.name}* just earned the *${badge.title}* badge on EduInsight AI!\n\n"${badge.description}"\n\n📊 Department: ${student.department}\n🏫 Roll No: ${student.rollNumber}\n\n#EduInsightAI #StudentAchievement #ProudParent`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    setShareMsg(`Shared "${badge.title}" to WhatsApp!`);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleShareAll = () => {
    const badgeList = earnedBadges.map(b => `  ${b.icon} ${b.title}`).join('\n');
    const text = `🏆 My child *${student.name}* has earned ${earnedBadges.length} achievement badges on EduInsight AI!\n\n${badgeList}\n\n📊 Department: ${student.department} | Roll No: ${student.rollNumber}\n\n#EduInsightAI #StudentAchievement #ProudParent`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏅 Achievement Wall
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {earnedBadges.length} of {badges.length} badges earned
          </p>
        </div>
        {earnedBadges.length > 0 && (
          <button
            onClick={handleShareAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-green-600/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.136 1.543 5.871L0 24l6.334-1.521A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.67-.52-5.186-1.424l-.371-.22-3.763.904.946-3.671-.242-.381A9.948 9.948 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Share All
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round((earnedBadges.length / badges.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-widest mb-3">✅ Earned Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                className={`${badge.bgColor} border ${badge.borderColor} rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-bold text-sm ${badge.color}`}>{badge.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{badge.description}</p>
                    {badge.earnedDate && (
                      <p className="text-gray-500 text-xs mt-1">🗓 {badge.earnedDate}</p>
                    )}
                  </div>
                  <span className="text-2xl">{badge.icon}</span>
                </div>
                <button
                  onClick={() => handleWhatsAppShare(badge)}
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 bg-green-700/30 hover:bg-green-600/50 text-green-300 rounded-lg text-xs font-semibold transition-all border border-green-700/30"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.136 1.543 5.871L0 24l6.334-1.521A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.67-.52-5.186-1.424l-.371-.22-3.763.904.946-3.671-.242-.381A9.948 9.948 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Share on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Locked badges */}
      {unearnedBadges.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">🔒 Locked Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {unearnedBadges.map(badge => (
              <div
                key={badge.id}
                className="bg-gray-700/20 border border-gray-700/40 rounded-xl p-3 flex flex-col items-center gap-1 opacity-50 grayscale"
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-gray-500 text-xs font-semibold text-center leading-tight">{badge.title.replace(/.*?\s/, '')}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast notification */}
      {showShareToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold z-50 flex items-center gap-2">
          ✅ {shareMsg}
        </div>
      )}
    </div>
  );
};

export default AchievementWall;