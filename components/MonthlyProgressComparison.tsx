import React, { useMemo } from 'react';
import { Student, AssignmentStatus } from '../types';

interface MonthlyProgressComparisonProps {
  student: Student;
}

interface MonthStats {
  label: string;
  attendancePct: number;
  totalClasses: number;
  presentClasses: number;
  avgScore: number | null;
  submittedCount: number;
  totalAssignments: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getMonthStats = (student: Student, year: number, month: number): MonthStats => {
  const label = `${MONTH_NAMES[month]} ${year}`;

  // Filter attendance by month
  const monthAttendance = student.attendance.filter(a => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const presentClasses = monthAttendance.filter(a => a.status === 'Present').length;
  const totalClasses = monthAttendance.length;
  const attendancePct = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  // Filter assignments by due date within month
  const allAssignments = (student.progress || []).flatMap(s => s.assignments || []);
  const monthAssignments = allAssignments.filter(a => {
    const d = new Date(a.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const graded = monthAssignments.filter(a => a.status === AssignmentStatus.Graded && a.score !== undefined);
  const avgScore = graded.length > 0
    ? graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length
    : null;
  const submittedCount = monthAssignments.filter(a =>
    a.status === AssignmentStatus.Graded || a.status === AssignmentStatus.Submitted
  ).length;

  return { label, attendancePct, totalClasses, presentClasses, avgScore, submittedCount, totalAssignments: monthAssignments.length };
};

const getDelta = (current: number | null, previous: number | null): { value: number; positive: boolean; neutral: boolean } => {
  if (current === null || previous === null || previous === 0) return { value: 0, positive: true, neutral: true };
  const delta = current - previous;
  return { value: Math.abs(Math.round(delta * 10) / 10), positive: delta >= 0, neutral: Math.abs(delta) < 0.5 };
};

const StatCard: React.FC<{
  label: string;
  current: string;
  previous: string;
  delta: { value: number; positive: boolean; neutral: boolean };
  icon: string;
  unit?: string;
}> = ({ label, current, previous, delta, icon, unit = '' }) => (
  <div className="bg-gray-700/30 border border-gray-700 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{icon}</span>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-2xl font-black text-white">{current}{unit}</p>
        <p className="text-gray-500 text-xs mt-0.5">Last month: {previous}{unit}</p>
      </div>
      {!delta.neutral && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${delta.positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          <span>{delta.positive ? '↑' : '↓'}</span>
          <span>{delta.value}{unit}</span>
        </div>
      )}
      {delta.neutral && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-gray-600/30 text-gray-400">
          <span>→ No change</span>
        </div>
      )}
    </div>
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-gray-700 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-700`}
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
    <span className="text-gray-400 text-xs w-8 text-right">{value}%</span>
  </div>
);

const MonthlyProgressComparison: React.FC<MonthlyProgressComparisonProps> = ({ student }) => {
  const { thisMonth, lastMonth, verdict } = useMemo(() => {
    const now = new Date();
    const thisY = now.getFullYear();
    const thisM = now.getMonth();
    const lastM = thisM === 0 ? 11 : thisM - 1;
    const lastY = thisM === 0 ? thisY - 1 : thisY;

    const thisMonth = getMonthStats(student, thisY, thisM);
    const lastMonth = getMonthStats(student, lastY, lastM);

    // Verdict
    let improved = 0, declined = 0;
    if (thisMonth.totalClasses > 0 && lastMonth.totalClasses > 0) {
      if (thisMonth.attendancePct > lastMonth.attendancePct) improved++;
      else if (thisMonth.attendancePct < lastMonth.attendancePct) declined++;
    }
    if (thisMonth.avgScore !== null && lastMonth.avgScore !== null) {
      if (thisMonth.avgScore > lastMonth.avgScore) improved++;
      else if (thisMonth.avgScore < lastMonth.avgScore) declined++;
    }

    const verdict = improved > declined ? 'improved' : declined > improved ? 'declined' : 'stable';
    return { thisMonth, lastMonth, verdict };
  }, [student]);

  const attendanceDelta = getDelta(thisMonth.attendancePct, lastMonth.attendancePct);
  const scoreDelta = getDelta(thisMonth.avgScore, lastMonth.avgScore);

  const verdictConfig = {
    improved: { emoji: '📈', text: 'Performance Improved!', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    declined: { emoji: '📉', text: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    stable:   { emoji: '➡️', text: 'Performance Stable', color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30'  },
  };
  const v = verdictConfig[verdict];

  const noData = thisMonth.totalClasses === 0 && lastMonth.totalClasses === 0;

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Monthly Progress Comparison
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {lastMonth.label} → {thisMonth.label}
          </p>
        </div>
        {!noData && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${v.bg} ${v.color}`}>
            <span>{v.emoji}</span>
            <span>{v.text}</span>
          </div>
        )}
      </div>

      {noData ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400">No attendance data found for the last two months.</p>
          <p className="text-gray-600 text-sm mt-1">Data will appear once attendance is recorded.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              label="Attendance"
              icon="📅"
              current={thisMonth.totalClasses > 0 ? thisMonth.attendancePct.toFixed(1) : 'N/A'}
              previous={lastMonth.totalClasses > 0 ? lastMonth.attendancePct.toFixed(1) : 'N/A'}
              delta={attendanceDelta}
              unit="%"
            />
            <StatCard
              label="Avg Score"
              icon="📝"
              current={thisMonth.avgScore !== null ? thisMonth.avgScore.toFixed(1) : 'N/A'}
              previous={lastMonth.avgScore !== null ? lastMonth.avgScore.toFixed(1) : 'N/A'}
              delta={scoreDelta}
              unit="%"
            />
          </div>

          {/* Visual bar comparison */}
          <div className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Visual Comparison</h3>
            <div className="space-y-4">
              {/* Attendance bars */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Attendance</span>
                  <span className="text-gray-500">{lastMonth.label} vs {thisMonth.label}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-16">{lastMonth.label}</span>
                    <MiniBar value={Math.round(lastMonth.attendancePct)} max={100} color="bg-gray-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-xs w-16">{thisMonth.label}</span>
                    <MiniBar value={Math.round(thisMonth.attendancePct)} max={100} color="bg-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Score bars (only if data exists) */}
              {(thisMonth.avgScore !== null || lastMonth.avgScore !== null) && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Assignment Score</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-16">{lastMonth.label}</span>
                      <MiniBar value={Math.round(lastMonth.avgScore ?? 0)} max={100} color="bg-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 text-xs w-16">{thisMonth.label}</span>
                      <MiniBar value={Math.round(thisMonth.avgScore ?? 0)} max={100} color="bg-purple-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classes attended detail */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-700/20 rounded-xl p-3 text-center border border-gray-700/40">
              <p className="text-gray-500 text-xs mb-1">{lastMonth.label}</p>
              <p className="text-lg font-bold text-gray-300">{lastMonth.presentClasses}/{lastMonth.totalClasses}</p>
              <p className="text-gray-500 text-xs">classes attended</p>
            </div>
            <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
              <p className="text-indigo-400 text-xs mb-1">{thisMonth.label}</p>
              <p className="text-lg font-bold text-white">{thisMonth.presentClasses}/{thisMonth.totalClasses}</p>
              <p className="text-indigo-400 text-xs">classes attended</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyProgressComparison;