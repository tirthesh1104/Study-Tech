import React, { useMemo, useState } from 'react';
import { Student, AssignmentStatus } from '../types';

interface AtRiskPanelProps {
  students: Student[];
}

type RiskLevel = 'critical' | 'high' | 'moderate';

interface RiskStudent {
  student: Student;
  riskLevel: RiskLevel;
  riskScore: number;
  signals: string[];
  attendancePct: number;
  avgScore: number | null;
}

const analyzeRisk = (student: Student): RiskStudent | null => {
  const total = student.attendance.length;
  const present = student.attendance.filter(a => a.status === 'Present').length;
  const attendancePct = total > 0 ? (present / total) * 100 : 100;

  const recentAttendance = [...student.attendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const recentAbsences = recentAttendance.filter(a => a.status !== 'Present').length;

  const allAssignments = (student.progress || []).flatMap(s => s.assignments || []);
  const graded = allAssignments.filter(a => a.status === AssignmentStatus.Graded && a.score !== undefined);
  const avgScore = graded.length > 0
    ? graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length
    : null;
  const pendingCount = allAssignments.filter(a => a.status === AssignmentStatus.Pending).length;

  const signals: string[] = [];
  let riskScore = 0;

  if (attendancePct < 60)      { signals.push(`Attendance critically low: ${attendancePct.toFixed(0)}%`); riskScore += 3; }
  else if (attendancePct < 75) { signals.push(`Attendance below 75%: ${attendancePct.toFixed(0)}%`); riskScore += 2; }

  if (recentAbsences >= 4)    { signals.push(`${recentAbsences}/5 recent classes absent`); riskScore += 3; }
  else if (recentAbsences >= 3) { signals.push(`${recentAbsences}/5 recent classes absent`); riskScore += 2; }

  if (avgScore !== null && avgScore < 50)  { signals.push(`Avg score: ${avgScore.toFixed(0)}% (below 50%)`); riskScore += 2; }
  else if (avgScore !== null && avgScore < 65) { signals.push(`Avg score: ${avgScore.toFixed(0)}% (below 65%)`); riskScore += 1; }

  if (pendingCount >= 3) { signals.push(`${pendingCount} assignments pending`); riskScore += 2; }
  else if (pendingCount >= 2) { signals.push(`${pendingCount} assignments pending`); riskScore += 1; }

  if (student.isAccessBlocked)                  { signals.push(`Access blocked: ${student.blockReason}`); riskScore += 3; }
  if (student.behaviourStatus === 'Needs Improvement') { signals.push('Behaviour concern flagged'); riskScore += 1; }

  if (riskScore === 0) return null;

  let riskLevel: RiskLevel;
  if (riskScore >= 6)      riskLevel = 'critical';
  else if (riskScore >= 3) riskLevel = 'high';
  else                     riskLevel = 'moderate';

  return { student, riskLevel, riskScore, signals, attendancePct, avgScore };
};

const levelConfig = {
  critical: { label: 'Critical', emoji: '🚨', bg: 'bg-red-500/10',    border: 'border-red-500/40',    text: 'text-red-400',    dot: 'bg-red-500' },
  high:     { label: 'High',     emoji: '🔴', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  moderate: { label: 'Moderate', emoji: '⚠️', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
};

const AtRiskPanel: React.FC<AtRiskPanelProps> = ({ students }) => {
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const riskStudents = useMemo(() => {
    return students
      .map(analyzeRisk)
      .filter((r): r is RiskStudent => r !== null)
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [students]);

  const filtered = filter === 'all' ? riskStudents : riskStudents.filter(r => r.riskLevel === filter);

  const criticalCount  = riskStudents.filter(r => r.riskLevel === 'critical').length;
  const highCount      = riskStudents.filter(r => r.riskLevel === 'high').length;
  const moderateCount  = riskStudents.filter(r => r.riskLevel === 'moderate').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🚨 At-Risk Students Panel
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered early warning — {riskStudents.length} student(s) need attention
          </p>
        </div>
        {riskStudents.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-pulse">
            🔔 {criticalCount} Critical Alert{criticalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { level: 'critical' as RiskLevel, count: criticalCount,  ...levelConfig.critical },
          { level: 'high' as RiskLevel,     count: highCount,      ...levelConfig.high },
          { level: 'moderate' as RiskLevel, count: moderateCount,  ...levelConfig.moderate },
        ].map(item => (
          <button
            key={item.level}
            onClick={() => setFilter(filter === item.level ? 'all' : item.level)}
            className={`${item.bg} border ${item.border} rounded-xl p-4 text-center transition-all hover:scale-[1.02] ${filter === item.level ? 'ring-2 ring-offset-1 ring-offset-gray-900 ring-current' : ''}`}
          >
            <p className="text-2xl mb-1">{item.emoji}</p>
            <p className={`text-3xl font-black ${item.text}`}>{item.count}</p>
            <p className="text-gray-400 text-xs mt-1">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'high', 'moderate'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${riskStudents.length})` : `${f} (${f === 'critical' ? criticalCount : f === 'high' ? highCount : moderateCount})`}
          </button>
        ))}
      </div>

      {/* Student cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-green-400 font-bold text-lg">No at-risk students detected</p>
          <p className="text-gray-500 text-sm mt-1">All students are performing within acceptable ranges</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ student, riskLevel, riskScore, signals, attendancePct, avgScore }) => {
            const cfg = levelConfig[riskLevel];
            const isOpen = expanded === student.id;
            return (
              <div
                key={student.id}
                className={`${cfg.bg} border ${cfg.border} rounded-xl overflow-hidden transition-all`}
              >
                {/* Row */}
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all"
                  onClick={() => setExpanded(isOpen ? null : student.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${riskLevel === 'critical' ? 'animate-pulse' : ''}`} />
                    <div>
                      <p className="font-bold text-white text-sm">{student.name}</p>
                      <p className="text-gray-400 text-xs">{student.rollNumber} · {student.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
                      <span>🎓 {attendancePct.toFixed(0)}%</span>
                      {avgScore !== null && <span>📝 {avgScore.toFixed(0)}%</span>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} border ${cfg.border} ${cfg.text}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-700/40 pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      AI Risk Signals ({signals.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {signals.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 bg-gray-800/60 rounded-lg p-2">
                          <span className={`text-xs ${cfg.text} mt-0.5`}>●</span>
                          <p className="text-xs text-gray-300">{s}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Risk Score: <span className={`font-bold ${cfg.text}`}>{riskScore} pts</span>
                      </p>
                      <p className="text-xs text-indigo-400 font-semibold">
                        Recommended: Contact parent + counselor
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AtRiskPanel;