import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Student } from '../types';
import AnimatedElement from './AnimatedElement';

interface RiskStudent {
  id: string;
  name: string;
  rollNumber: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  signals: string[];
}

const AdminRiskMonitor: React.FC<{ students: Student[] }> = ({ students }) => {
  const [riskData, setRiskData] = useState<RiskStudent[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskStudent | null>(null);

  useEffect(() => {
    calculateRisk();
  }, [students]);

  const calculateRisk = () => {
    const data: RiskStudent[] = students.map(s => {
      let score = 0;
      const signals = [];

      const total = s.attendance?.length || 0;
      const present = s.attendance?.filter(a => a.status === 'Present').length || 0;
      const attRate = total > 0 ? (present / total) * 100 : 100;
      if (attRate < 60) {
        score += 40;
        signals.push('Attendance below 60%');
      }

      if (s.attendance?.slice(-3).every(a => a.status === 'Absent')) {
        score += 20;
        signals.push('3+ consecutive absences');
      }

      let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (score >= 80) level = 'Critical';
      else if (score >= 50) level = 'High';
      else if (score >= 30) level = 'Medium';

      return {
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        risk_score: score,
        risk_level: level,
        signals
      };
    });

    setRiskData(data.sort((a, b) => b.risk_score - a.risk_score));
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">Student Risk Monitor</h2>
          <p className="text-gray-400">Predictive dropout early-warning system</p>
        </div>
      </AnimatedElement>

      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-xs font-bold text-gray-500 uppercase">
              <th className="p-4">Student Name</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Risk Level</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {riskData.map(student => (
              <tr key={student.id} className="text-sm hover:bg-gray-700/30 transition-colors">
                <td className="p-4">
                  <p className="text-white font-bold">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.rollNumber}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className={`h-full ${
                            student.risk_level === 'Critical' ? 'bg-red-500' : 
                            student.risk_level === 'High' ? 'bg-orange-500' : 
                            student.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${student.risk_score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-white">{student.risk_score}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    student.risk_level === 'Critical' ? 'bg-red-600/20 text-red-400' : 
                    student.risk_level === 'High' ? 'bg-orange-600/20 text-orange-400' : 
                    student.risk_level === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-green-600/20 text-green-400'
                  }`}>
                    {student.risk_level}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => setSelectedRisk(student)}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    View Breakdown
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRisk && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-3xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Risk Breakdown: {selectedRisk.name}</h3>
                    <button onClick={() => setSelectedRisk(null)} className="p-2 hover:bg-gray-800 rounded-full">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Trigger Signals</h4>
                        <div className="space-y-2">
                            {selectedRisk.signals.length > 0 ? selectedRisk.signals.map((sig, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-red-600/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    <span className="text-lg">⚠️</span>
                                    {sig}
                                </div>
                            )) : (
                                <p className="text-gray-500 italic text-sm">No critical signals detected.</p>
                            )}
                        </div>
                    </div>
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
                        Assign Counselor & Notify Parent
                    </button>

                    {selectedRisk.risk_level === 'Critical' && (
                        <button 
                            onClick={async () => {
                                await supabase.from('parent_visibility_settings').upsert({
                                    student_id: selectedRisk.id,
                                    show_attendance: true,
                                    show_assignments: true,
                                    show_grades: true,
                                    show_burnout: true
                                });
                                alert('Emergency Override: All visibility settings enabled for parents.');
                            }}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all mt-2"
                        >
                            Emergency Override: Force Parent Visibility
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiskMonitor;
