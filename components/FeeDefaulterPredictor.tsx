import React, { useState, useCallback } from 'react';
import { Student, AssignmentStatus } from '../types';

interface FeeDefaulterPredictorProps {
  students: Student[];
}

interface FeeRecord {
  studentId: string;
  totalFees: number;
  paidAmount: number;
  dueDate: string;
  lastPaymentDate: string;
  semester: string;
  installmentsMissed: number;
}

interface StudentRiskProfile {
  student: Student;
  fee: FeeRecord;
  attendancePct: number;
  submissionRate: number;
  avgGradeScore: number;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskFactors: string[];
  pendingAmount: number;
}

interface AIInsight {
  summary: string;
  topRiskStudents: string[];
  recommendedActions: string[];
  predictedDefaultRate: string;
}

// Mock fee data seeded per student
const MOCK_FEE_DATA: FeeRecord[] = [
  {
    studentId: 'user-2',
    totalFees: 85000,
    paidAmount: 75000,
    dueDate: '2024-01-15',
    lastPaymentDate: '2023-11-10',
    semester: 'Sem 5',
    installmentsMissed: 0,
  },
  {
    studentId: 'user-4',
    totalFees: 85000,
    paidAmount: 30000,
    dueDate: '2023-12-01',
    lastPaymentDate: '2023-08-20',
    semester: 'Sem 5',
    installmentsMissed: 2,
  },
  {
    studentId: 'user-5',
    totalFees: 90000,
    paidAmount: 60000,
    dueDate: '2024-01-01',
    lastPaymentDate: '2023-10-05',
    semester: 'Sem 3',
    installmentsMissed: 1,
  },
];

const GRADE_SCORE: Record<string, number> = {
  'A+': 100, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80,
  'C+': 77, 'C': 73, 'C-': 70, 'D': 60, 'F': 0,
};

function computeRiskProfile(student: Student, fee: FeeRecord): StudentRiskProfile {
  // Attendance %
  const total = student.attendance.length || 1;
  const present = student.attendance.filter(a => a.status === 'Present').length;
  const attendancePct = Math.round((present / total) * 100);

  // Assignment submission rate
  const allAssignments = (student.progress || []).flatMap(p => p.assignments || []);
  const submitted = allAssignments.filter(
    a => a.status !== AssignmentStatus.Pending
  ).length;
  const submissionRate = allAssignments.length
    ? Math.round((submitted / allAssignments.length) * 100)
    : 100;

  // Average grade score
  const grades = student.progress
    .map(p => GRADE_SCORE[p.overallGrade] ?? 70)
    .filter(Boolean);
  const avgGradeScore = grades.length
    ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
    : 70;

  // Pending amount
  const pendingAmount = fee.totalFees - fee.paidAmount;
  const pendingPct = (pendingAmount / fee.totalFees) * 100;

  // Risk Score (0–100, higher = more risk)
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Fee component (max 40 pts)
  if (pendingPct > 60) { riskScore += 40; riskFactors.push(`${pendingPct.toFixed(0)}% fees unpaid`); }
  else if (pendingPct > 30) { riskScore += 25; riskFactors.push(`${pendingPct.toFixed(0)}% fees still pending`); }
  else if (pendingPct > 10) { riskScore += 10; }

  // Missed installments (max 20 pts)
  if (fee.installmentsMissed >= 2) { riskScore += 20; riskFactors.push(`${fee.installmentsMissed} installments missed`); }
  else if (fee.installmentsMissed === 1) { riskScore += 10; riskFactors.push('1 installment missed'); }

  // Attendance (max 20 pts)
  if (attendancePct < 50) { riskScore += 20; riskFactors.push(`Critical attendance (${attendancePct}%)`); }
  else if (attendancePct < 70) { riskScore += 12; riskFactors.push(`Low attendance (${attendancePct}%)`); }
  else if (attendancePct < 80) { riskScore += 5; }

  // Submission rate (max 10 pts)
  if (submissionRate < 50) { riskScore += 10; riskFactors.push(`Poor submission rate (${submissionRate}%)`); }
  else if (submissionRate < 75) { riskScore += 5; riskFactors.push(`Moderate submission rate (${submissionRate}%)`); }

  // Behavior (max 10 pts)
  if (student.behaviourStatus === 'Needs Improvement') {
    riskScore += 10; riskFactors.push('Behaviour flagged as needing improvement');
  }

  const riskLevel: 'High' | 'Medium' | 'Low' =
    riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';

  return {
    student,
    fee,
    attendancePct,
    submissionRate,
    avgGradeScore,
    riskScore: Math.min(riskScore, 100),
    riskLevel,
    riskFactors,
    pendingAmount,
  };
}

const RISK_COLORS = {
  High: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300', bar: 'bg-red-500' },
  Medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300', bar: 'bg-yellow-500' },
  Low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300', bar: 'bg-green-500' },
};

const RiskBar: React.FC<{ score: number; level: 'High' | 'Medium' | 'Low' }> = ({ score, level }) => (
  <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
    <div
      className={`h-2 rounded-full transition-all duration-700 ${RISK_COLORS[level].bar}`}
      style={{ width: `${score}%` }}
    />
  </div>
);

const StatChip: React.FC<{ label: string; value: string; warn?: boolean }> = ({ label, value, warn }) => (
  <div className={`flex flex-col items-center px-3 py-2 rounded-xl text-center ${warn ? 'bg-red-500/10' : 'bg-gray-700/40'}`}>
    <span className={`text-sm font-black ${warn ? 'text-red-400' : 'text-gray-200'}`}>{value}</span>
    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{label}</span>
  </div>
);

const FeeDefaulterPredictor: React.FC<FeeDefaulterPredictorProps> = ({ students }) => {
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build risk profiles
  const profiles: StudentRiskProfile[] = students.map(student => {
    const feeRecord = MOCK_FEE_DATA.find(f => f.studentId === student.id) ?? {
      studentId: student.id,
      totalFees: 85000,
      paidAmount: Math.floor(Math.random() * 85000),
      dueDate: '2024-01-15',
      lastPaymentDate: '2023-10-01',
      semester: 'Sem 5',
      installmentsMissed: 0,
    };
    return computeRiskProfile(student, feeRecord);
  }).sort((a, b) => b.riskScore - a.riskScore);

  const filtered = filter === 'All' ? profiles : profiles.filter(p => p.riskLevel === filter);
  const highCount = profiles.filter(p => p.riskLevel === 'High').length;
  const medCount = profiles.filter(p => p.riskLevel === 'Medium').length;
  const lowCount = profiles.filter(p => p.riskLevel === 'Low').length;
  const totalPending = profiles.reduce((sum, p) => sum + p.pendingAmount, 0);

  const fetchAIInsight = useCallback(async () => {
    setIsLoadingAI(true);
    setAiError(null);

    const profileSummary = profiles.map(p => ({
      name: p.student.name,
      roll: p.student.rollNumber,
      dept: p.student.department,
      riskLevel: p.riskLevel,
      riskScore: p.riskScore,
      pendingFees: p.pendingAmount,
      attendancePct: p.attendancePct,
      installmentsMissed: p.fee.installmentsMissed,
      riskFactors: p.riskFactors,
    }));

    const prompt = `You are an academic finance analyst. Analyze the following student fee risk data and provide a structured assessment.

STUDENT RISK PROFILES:
${JSON.stringify(profileSummary, null, 2)}

Respond ONLY with a valid JSON object (no markdown, no extra text) with exactly this structure:
{
  "summary": "2-3 sentence executive summary of the fee defaulter risk situation",
  "topRiskStudents": ["Name (Roll No): reason for highest risk", ...],
  "recommendedActions": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "predictedDefaultRate": "X% of students predicted to default if unaddressed"
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed: AIInsight = JSON.parse(clean);
      setAiInsight(parsed);
    } catch (err) {
      setAiError('Could not generate AI insights. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  }, [profiles]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">💰</span>
            Fee Defaulter Predictor
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-powered risk analysis based on fees, attendance & academic performance</p>
        </div>
        <button
          onClick={fetchAIInsight}
          disabled={isLoadingAI}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          {isLoadingAI ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.364A3.014 3.014 0 0014 18.714v.286a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.286a3.014 3.014 0 00-.672-1.414l-.346-.364z" />
              </svg>
              Generate AI Insight
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'High Risk', value: highCount, color: 'red', icon: '🔴' },
          { label: 'Medium Risk', value: medCount, color: 'yellow', icon: '🟡' },
          { label: 'Low Risk', value: lowCount, color: 'green', icon: '🟢' },
          { label: 'Total Pending', value: `₹${(totalPending / 1000).toFixed(0)}K`, color: 'indigo', icon: '💸' },
        ].map(card => (
          <div key={card.label} className={`bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex flex-col items-center text-center`}>
            <span className="text-3xl mb-2">{card.icon}</span>
            <span className={`text-3xl font-black ${card.color === 'red' ? 'text-red-400' : card.color === 'yellow' ? 'text-yellow-400' : card.color === 'green' ? 'text-green-400' : 'text-indigo-400'}`}>
              {card.value}
            </span>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{card.label}</span>
          </div>
        ))}
      </div>

      {/* AI Insight Panel */}
      {aiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-400 text-sm font-medium">
          ⚠️ {aiError}
        </div>
      )}

      {aiInsight && (
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-black text-indigo-300">AI Analysis Report</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{aiInsight.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-4 md:col-span-1">
              <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-3">Predicted Default Rate</p>
              <p className="text-2xl font-black text-white">{aiInsight.predictedDefaultRate}</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-3">Top Risk Students</p>
              <ul className="space-y-1">
                {aiInsight.topRiskStudents.map((s, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-3">Recommended Actions</p>
              <ul className="space-y-1">
                {aiInsight.recommendedActions.map((a, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800 w-fit">
        {(['All', 'High', 'Medium', 'Low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f
                ? f === 'High' ? 'bg-red-600 text-white' : f === 'Medium' ? 'bg-yellow-600 text-white' : f === 'Low' ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {f} {f !== 'All' && `(${f === 'High' ? highCount : f === 'Medium' ? medCount : lowCount})`}
          </button>
        ))}
      </div>

      {/* Student Risk Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No students in this category.</div>
        )}
        {filtered.map(profile => {
          const c = RISK_COLORS[profile.riskLevel];
          const isExpanded = expandedId === profile.student.id;
          const paidPct = Math.round((profile.fee.paidAmount / profile.fee.totalFees) * 100);

          return (
            <div
              key={profile.student.id}
              className={`rounded-2xl border ${c.border} ${c.bg} transition-all duration-300 overflow-hidden`}
            >
              {/* Card Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : profile.student.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${c.badge}`}>
                      {profile.student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{profile.student.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.badge}`}>
                          {profile.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{profile.student.rollNumber} · {profile.student.department} · {profile.fee.semester}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-black ${c.text}`}>₹{profile.pendingAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Pending amount</p>
                    </div>
                    <div className="w-10 text-right">
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Risk score bar */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">Risk Score</span>
                  <div className="flex-1">
                    <RiskBar score={profile.riskScore} level={profile.riskLevel} />
                  </div>
                  <span className={`text-sm font-black ${c.text}`}>{profile.riskScore}/100</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-700/40 pt-5 space-y-5">
                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3">
                    <StatChip label="Attendance" value={`${profile.attendancePct}%`} warn={profile.attendancePct < 70} />
                    <StatChip label="Submissions" value={`${profile.submissionRate}%`} warn={profile.submissionRate < 75} />
                    <StatChip label="Avg Grade" value={`${profile.avgGradeScore}%`} warn={profile.avgGradeScore < 70} />
                    <StatChip label="Paid" value={`${paidPct}%`} warn={paidPct < 60} />
                    <StatChip label="Instalments Missed" value={`${profile.fee.installmentsMissed}`} warn={profile.fee.installmentsMissed > 0} />
                    <StatChip label="Behaviour" value={profile.student.behaviourStatus === 'Good' ? '✓ Good' : '⚠ Review'} warn={profile.student.behaviourStatus !== 'Good'} />
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fee Breakdown</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Fees</span>
                      <span className="text-white font-bold">₹{profile.fee.totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount Paid</span>
                      <span className="text-green-400 font-bold">₹{profile.fee.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-700/50 pt-2">
                      <span className="text-gray-400">Pending Balance</span>
                      <span className={`font-black ${c.text}`}>₹{profile.pendingAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 mt-2">
                      <div
                        className="h-3 rounded-full bg-green-500 transition-all duration-700"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Due Date: {profile.fee.dueDate}</span>
                      <span>Last Payment: {profile.fee.lastPaymentDate}</span>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {profile.riskFactors.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Risk Factors Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.riskFactors.map((f, i) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                            ⚠ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeeDefaulterPredictor;