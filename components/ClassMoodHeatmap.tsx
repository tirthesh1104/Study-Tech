import React, { useMemo, useState } from 'react';
import { Student } from '../types';

interface ClassMoodHeatmapProps {
  students: Student[];
}

type MoodLevel = 'energized' | 'good' | 'neutral' | 'low' | 'stressed';

interface DeptMood {
  dept: string;
  studentCount: number;
  mood: MoodLevel;
  moodScore: number; // 0-100
  avgAttendance: number;
  atRiskCount: number;
  signals: string[];
}

const deriveMood = (deptStudents: Student[]): DeptMood['mood'] => {
  const avgAtt = deptStudents.reduce((sum, s) => {
    const total = s.attendance.length;
    const present = s.attendance.filter(a => a.status === 'Present').length;
    return sum + (total > 0 ? (present / total) * 100 : 100);
  }, 0) / deptStudents.length;

  const blockedCount = deptStudents.filter(s => s.isAccessBlocked).length;
  const blockedRatio = blockedCount / deptStudents.length;

  if (avgAtt >= 90 && blockedRatio === 0) return 'energized';
  if (avgAtt >= 80 && blockedRatio < 0.1) return 'good';
  if (avgAtt >= 70 && blockedRatio < 0.2) return 'neutral';
  if (avgAtt >= 60) return 'low';
  return 'stressed';
};

const moodConfig: Record<MoodLevel, {
  emoji: string; label: string; color: string; bg: string; border: string;
  textColor: string; barColor: string; description: string;
}> = {
  energized: { emoji: '🔥', label: 'Energized',  color: 'from-green-500 to-emerald-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  textColor: 'text-green-400',  barColor: 'bg-green-500',  description: 'High attendance & engagement' },
  good:      { emoji: '😊', label: 'Good',       color: 'from-blue-500 to-cyan-400',       bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   textColor: 'text-blue-400',   barColor: 'bg-blue-500',   description: 'Above average performance' },
  neutral:   { emoji: '😐', label: 'Neutral',    color: 'from-indigo-500 to-purple-400',   bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', textColor: 'text-indigo-400', barColor: 'bg-indigo-500', description: 'Average, needs monitoring' },
  low:       { emoji: '😔', label: 'Low Energy', color: 'from-yellow-500 to-amber-400',    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', textColor: 'text-yellow-400', barColor: 'bg-yellow-500', description: 'Below average — check in' },
  stressed:  { emoji: '😰', label: 'Stressed',   color: 'from-red-500 to-rose-400',        bg: 'bg-red-500/10',    border: 'border-red-500/40',    textColor: 'text-red-400',    barColor: 'bg-red-500',    description: 'High risk — immediate action' },
};

const ClassMoodHeatmap: React.FC<ClassMoodHeatmapProps> = ({ students }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const deptMoods = useMemo(() => {
    // Group students by department
    const deptMap = new Map<string, Student[]>();
    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(s);
    });

    return Array.from(deptMap.entries()).map(([dept, deptStudents]): DeptMood => {
      const mood = deriveMood(deptStudents);

      const avgAttendance = deptStudents.reduce((sum, s) => {
        const total = s.attendance.length;
        const present = s.attendance.filter(a => a.status === 'Present').length;
        return sum + (total > 0 ? (present / total) * 100 : 100);
      }, 0) / deptStudents.length;

      const atRiskCount = deptStudents.filter(s =>
        s.isAccessBlocked || s.behaviourStatus === 'Needs Improvement'
      ).length;

      const moodScore = Math.min(100, Math.round(avgAttendance - (atRiskCount / deptStudents.length) * 20));

      const signals: string[] = [];
      if (avgAttendance < 70) signals.push(`Low avg attendance: ${avgAttendance.toFixed(0)}%`);
      if (atRiskCount > 0)    signals.push(`${atRiskCount} student(s) at risk`);
      const blocked = deptStudents.filter(s => s.isAccessBlocked).length;
      if (blocked > 0)        signals.push(`${blocked} access blocked`);
      const behaviour = deptStudents.filter(s => s.behaviourStatus === 'Needs Improvement').length;
      if (behaviour > 0)      signals.push(`${behaviour} behaviour concern(s)`);
      if (signals.length === 0) signals.push('All students performing well');

      return { dept, studentCount: deptStudents.length, mood, moodScore, avgAttendance, atRiskCount, signals };
    }).sort((a, b) => a.moodScore - b.moodScore); // worst first
  }, [students]);

  const overallMood = useMemo(() => {
    if (deptMoods.length === 0) return null;
    const avg = deptMoods.reduce((s, d) => s + d.moodScore, 0) / deptMoods.length;
    let mood: MoodLevel;
    if (avg >= 85) mood = 'energized';
    else if (avg >= 75) mood = 'good';
    else if (avg >= 65) mood = 'neutral';
    else if (avg >= 50) mood = 'low';
    else mood = 'stressed';
    return { avg: Math.round(avg), mood };
  }, [deptMoods]);

  const selectedDeptData = selectedDept ? deptMoods.find(d => d.dept === selectedDept) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🌡️ Class Mood Heatmap
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-derived wellness score per department — updated in real-time
          </p>
        </div>
        {overallMood && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${moodConfig[overallMood.mood].bg} border ${moodConfig[overallMood.mood].border}`}>
            <span className="text-2xl">{moodConfig[overallMood.mood].emoji}</span>
            <div>
              <p className={`font-black text-sm ${moodConfig[overallMood.mood].textColor}`}>
                School Overall: {moodConfig[overallMood.mood].label}
              </p>
              <p className="text-gray-500 text-xs">Score: {overallMood.avg}/100</p>
            </div>
          </div>
        )}
      </div>

      {/* Mood Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(moodConfig) as [MoodLevel, typeof moodConfig[MoodLevel]][]).map(([level, cfg]) => (
          <div key={level} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} border ${cfg.border} ${cfg.textColor}`}>
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      {deptMoods.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/20 rounded-2xl border border-gray-700">
          <p className="text-gray-400">No department data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deptMoods.map(({ dept, studentCount, mood, moodScore, avgAttendance, atRiskCount, signals }) => {
            const cfg = moodConfig[mood];
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(isSelected ? null : dept)}
                className={`text-left rounded-2xl border ${cfg.border} ${cfg.bg} p-5 transition-all hover:scale-[1.01] ${isSelected ? 'ring-2 ring-offset-1 ring-offset-gray-900' : ''}`}
                style={isSelected ? { '--tw-ring-color': 'rgb(99 102 241)' } as React.CSSProperties : {}}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-black text-white text-base">{dept}</p>
                    <p className="text-gray-400 text-xs">{studentCount} student{studentCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-3xl">{cfg.emoji}</div>
                </div>

                {/* Mood score bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Wellness Score</span>
                    <span className={cfg.textColor}>{moodScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`${cfg.barColor} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${moodScore}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    📅 {avgAttendance.toFixed(0)}% attendance
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} border ${cfg.border} ${cfg.textColor}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Expanded signals */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Signals</p>
                    {signals.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-xs ${cfg.textColor}`}>●</span>
                        <p className="text-xs text-gray-300">{s}</p>
                      </div>
                    ))}
                    {atRiskCount > 0 && (
                      <p className="text-xs text-indigo-400 font-semibold mt-2">
                        ⚡ Recommend: Counselor session for {dept}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        * Mood score derived from attendance patterns, behaviour flags, and access status using rule-based AI
      </p>
    </div>
  );
};

export default ClassMoodHeatmap;