import React, { useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ChatInteraction, UserRole } from '../types';
import AnimatedElement from './AnimatedElement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChatAnalytics: React.FC = () => {
  const [interactions] = useLocalStorage<ChatInteraction[]>('interaction_analytics', []);

  const stats = useMemo(() => {
    const total = interactions.length;
    const byRole = interactions.reduce((acc: any, curr) => {
      acc[curr.userRole] = (acc[curr.userRole] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(byRole).map(role => ({
      name: role,
      value: byRole[role]
    }));

    // Group by day for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      count: interactions.filter(id => id.timestamp.startsWith(date)).length
    }));

    return { total, pieData, chartData };
  }, [interactions]);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

  return (
    <div className="space-y-8">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Chat Interaction <span className="text-indigo-400">Analytics</span></h2>
            <p className="text-gray-400 text-sm">Monitoring AI assistant engagement across campus</p>
          </div>
          <div className="bg-indigo-600/20 px-4 py-2 rounded-xl border border-indigo-500/30">
            <p className="text-xs text-indigo-400 font-bold uppercase">Total Queries</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedElement delay={100} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Usage by User Role
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4">
                {stats.pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-gray-400">{entry.name}:</span>
                        <span className="text-white font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={200} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Daily Engagement (Last 7 Days)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement delay={300} className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Interactions</h3>
            <button className="text-xs text-indigo-400 font-bold hover:underline">Download CSV</button>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900/50 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        <th className="p-4">User</th>
                        <th className="p-4">Query</th>
                        <th className="p-4">AI Response</th>
                        <th className="p-4">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {interactions.slice().reverse().map((inter) => (
                        <tr key={inter.id} className="text-xs hover:bg-gray-700/30 transition-colors">
                            <td className="p-4">
                                <p className="text-white font-bold">{inter.userName}</p>
                                <p className="text-gray-500">{inter.userRole}</p>
                            </td>
                            <td className="p-4 text-gray-300 max-w-[200px] truncate">{inter.query}</td>
                            <td className="p-4 text-indigo-300 max-w-[300px] truncate">{inter.response}</td>
                            <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(inter.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </AnimatedElement>
    </div>
  );
};

export default ChatAnalytics;
