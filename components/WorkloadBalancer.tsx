import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WorkloadStats {
  teacher_id: string;
  teacher_name: string;
  lectures_count: number;
  doubts_count: number;
  assignments_pending: number;
  attendance_sessions: number;
  workload_score: number;
}

const WorkloadBalancer: React.FC<{ user: User; isAdmin?: boolean }> = ({ user, isAdmin }) => {
  const [stats, setStats] = useState<WorkloadStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkload();
  }, [user.id]);

  const fetchWorkload = async () => {
    // In a real app, this would be a complex query or a database view.
    // For demo, we'll generate some data based on the user's role.
    const mockStats: WorkloadStats[] = [
      { 
        teacher_id: user.id, 
        teacher_name: user.name, 
        lectures_count: 24, 
        doubts_count: 15, 
        assignments_pending: 42, 
        attendance_sessions: 20,
        workload_score: 78
      },
      { 
        teacher_id: 't2', 
        teacher_name: 'Prof. Sharma', 
        lectures_count: 18, 
        doubts_count: 8, 
        assignments_pending: 12, 
        attendance_sessions: 15,
        workload_score: 45
      },
      { 
        teacher_id: 't3', 
        teacher_name: 'Dr. Patil', 
        lectures_count: 30, 
        doubts_count: 25, 
        assignments_pending: 65, 
        attendance_sessions: 28,
        workload_score: 95
      }
    ];

    setStats(isAdmin ? mockStats : [mockStats[0]]);
    setLoading(false);
  };

  const avgScore = stats.reduce((acc, curr) => acc + curr.workload_score, 0) / stats.length;

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">Teacher Workload Balancer</h2>
          <p className="text-gray-400">Monitoring teaching load and engagement metrics</p>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 1).map(s => (
          <React.Fragment key={s.teacher_id}>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Lectures (Month)</p>
                <p className="text-2xl font-black text-white">{s.lectures_count}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Active Doubts</p>
                <p className="text-2xl font-black text-white">{s.doubts_count}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pending Reviews</p>
                <p className="text-2xl font-black text-white">{s.assignments_pending}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Workload Score</p>
                <p className={`text-2xl font-black ${s.workload_score > 80 ? 'text-red-400' : 'text-green-400'}`}>
                    {s.workload_score}
                </p>
            </div>
          </React.Fragment>
        ))}
      </div>

      {isAdmin && (
        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Department Workload Equity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="teacher_name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="workload_score" radius={[4, 4, 0, 0]}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.workload_score > avgScore * 1.3 ? '#F87171' : '#6366F1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-700">
                    <th className="pb-4">Teacher</th>
                    <th className="pb-4">Workload Score</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats.sort((a, b) => b.workload_score - a.workload_score).map(s => (
                    <tr key={s.teacher_id} className="text-sm">
                      <td className="py-4 text-white font-medium">{s.teacher_name}</td>
                      <td className="py-4 text-gray-300">{s.workload_score}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            s.workload_score > avgScore * 1.3 ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
                        }`}>
                            {s.workload_score > avgScore * 1.3 ? 'Overloaded' : 'Balanced'}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-indigo-400 hover:text-indigo-300 font-bold">Reassign</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedElement>
      )}
    </div>
  );
};

export default WorkloadBalancer;
