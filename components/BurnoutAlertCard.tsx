import React, { useMemo } from 'react';
import { Student, AssignmentStatus } from '../types';

interface BurnoutAlertCardProps {
  student: Student;
}

interface BurnoutFactor {
  label: string;
  triggered: boolean;
  detail: string;
  weight: number;
}

const BurnoutAlertCard: React.FC<BurnoutAlertCardProps> = ({ student }) => {
  const { riskLevel, riskScore, factors, suggestion } = useMemo(() => {
    // ── Factor 1: Low recent attendance (last 7 records)
    const recentAttendance = [...student.attendance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
    const recentAbsences = recentAttendance.filter(a => a.status !== 'Present').length;
    const lowRecentAttendance = recentAbsences >= 3;

    // ── Factor 2: Overall attendance below 75%
    const total = student.attendance.length;
    const present = student.attendance.filter(a => a.status === 'Present').length;
    const overallPct = total > 0 ? (present / total) * 100 : 100;
    const lowOverallAttendance = overallPct < 75;

    // ── Factor 3: Pending assignments piling up
    const allAssignments = (student.progress || []).flatMap(s => s.assignments || []);
    const pendingCount = allAssignments.filter(a => a.status === AssignmentStatus.Pending).length;
    const hasPendingBacklog = pendingCount >= 2;

    // ── Factor 4: Low avg score in graded work
    const graded = allAssignments.filter(a => a.status === AssignmentStatus.Graded && a.score !== undefined);
    const avgScore = graded.length > 0
      ? graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length
      : null;
    const lowScores = avgScore !== null && avgScore < 60;

    // ── Factor 5: Behaviour issue
    const hasBehaviourIssue = student.behaviourStatus === 'Needs Improvement';

    // ── Factor 6: Access blocked (very high risk signal)
    const isBlocked = student.isAccessBlocked;

    const factors: BurnoutFactor[] = [
      {
        label: 'Low Recent Attendance',
        triggered: lowRecentAttendance,
        detail: `${recentAbsences} absences in last ${recentAttendance.length} classes`,
        weight: 2,
      },
      {
        label: 'Overall Attendance Below 75%',
        triggered: lowOverallAttendance,
        detail: `Current: ${overallPct.toFixed(1)}% (minimum required: 75%)`,
        weight: 2,
      },
      {
        label: 'Pending Assignment Backlog',
        triggered: hasPendingBacklog,
        detail: `${pendingCount} assignment(s) not yet submitted`,
        weight: 1,
      },
      {
        label: 'Declining Academic Scores',
        triggered: lowScores,
        detail: `Average score: ${avgScore?.toFixed(1)}% (below 60%)`,
        weight: 2,
      },
      {
        label: 'Behaviour Concern Flagged',
        triggered: hasBehaviourIssue,
        detail: 'Teacher has flagged a behaviour concern',
        weight: 1,
      },
      {
        label: 'Access Restricted by School',
        triggered: isBlocked,
        detail: `Reason: ${student.blockReason ?? 'Review required'}`,
        weight: 3,
      },
    ];

    const riskScore = factors.reduce((sum, f) => sum + (f.triggered ? f.weight : 0), 0);
    const maxScore = factors.reduce((sum, f) => sum + f.weight, 0);
    const riskPct = (riskScore / maxScore) * 100;

    let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    if (riskPct >= 65) riskLevel = 'critical';
    else if (riskPct >= 40) riskLevel = 'high';
    else if (riskPct >= 20) riskLevel = 'moderate';
    else riskLevel = 'low';

    const suggestions = {
      critical: '⚠️ Immediate action needed. Please contact the school counselor and meet with your child today.',
      high: '📞 Schedule a meeting with the class teacher this week. Your child needs focused support right now.',
      moderate: '💬 Have a supportive conversation with your child. Check if they feel overwhelmed or stressed.',
      low: '✅ Your child is doing well! Keep encouraging their consistency.',
    };

    return { riskLevel, riskScore, factors, suggestion: suggestions[riskLevel] };
  }, [student]);

  const levelConfig = {
    low:      { label: 'Low Risk',      emoji: '✅', bar: 'bg-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  pulse: '' },
    moderate: { label: 'Moderate Risk', emoji: '⚠️', bar: 'bg-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', pulse: '' },
    high:     { label: 'High Risk',     emoji: '🔴', bar: 'bg-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', pulse: 'animate-pulse' },
    critical: { label: 'Critical Risk', emoji: '🚨', bar: 'bg-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    text: 'text-red-400',    pulse: 'animate-pulse' },
  };

  const cfg = levelConfig[riskLevel];
  const triggeredFactors = factors.filter(f => f.triggered);
  const maxScore = factors.reduce((sum, f) => sum + f.weight, 0);
  const barWidth = Math.round((riskScore / maxScore) * 100);

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🧠 Burnout Risk Detector
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI analysis for {student.name}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${cfg.bg} border ${cfg.border} ${cfg.pulse}`}>
          <span className="text-xl">{cfg.emoji}</span>
          <span className={`font-black text-sm ${cfg.text}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Risk Score Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Burnout Risk Level</span>
          <span className={cfg.text}>{barWidth}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`${cfg.bar} h-3 rounded-full transition-all duration-700`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Safe</span>
          <span>Moderate</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Triggered factors */}
      {triggeredFactors.length > 0 ? (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            🔍 Risk Signals Detected ({triggeredFactors.length})
          </p>
          <div className="space-y-2">
            {triggeredFactors.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                <span className="text-red-400 mt-0.5 text-sm">●</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-gray-400">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-5 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
          <p className="text-green-400 text-sm font-semibold">✅ No risk signals detected this period</p>
        </div>
      )}

      {/* AI Suggestion */}
      <div className={`rounded-xl p-4 border ${cfg.border} ${cfg.bg}`}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">💡 AI Recommendation</p>
        <p className={`text-sm font-medium ${cfg.text}`}>{suggestion}</p>
      </div>
    </div>
  );
};

export default BurnoutAlertCard;