import React, { useMemo } from 'react';
import { Student, SubjectNote } from '../types';
import AnimatedElement from './AnimatedElement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap, Cell } from 'recharts';

interface AdminAnalyticsProps {
  students: Student[];
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ students }) => {
  
  const burnoutData = useMemo(() => {
    const depts = Array.from(new Set(students.map(s => s.department)));
    return depts.map(dept => {
      const deptStudents = students.filter(s => s.department === dept);
      // Simulate burnout score based on low mood/high stress
      const score = Math.floor(Math.random() * 40) + 10; 
      return { name: dept, score };
    });
  }, [students]);

  const scholarshipStats = useMemo(() => {
    return {
      matched: Math.floor(students.length * 0.65),
      applied: Math.floor(students.length * 0.4),
      unclaimed: '₹12.5L'
    };
  }, [students]);

  const skillHeatmapData = [
    { name: 'Python', size: 400, dept: 'CS' },
    { name: 'React', size: 300, dept: 'CS' },
    { name: 'Public Speaking', size: 200, dept: 'Business' },
    { name: 'Data Analysis', size: 250, dept: 'Math' },
    { name: 'UI/UX', size: 180, dept: 'Design' },
    { name: 'Cloud Computing', size: 220, dept: 'CS' },
    { name: 'Project Management', size: 150, dept: 'Business' },
  ];

  const integritySummary = [
    { subject: 'Data Structures', originality: 88, aiLikelihood: 12 },
    { subject: 'Algorithms', originality: 92, aiLikelihood: 8 },
    { subject: 'DBMS', originality: 75, aiLikelihood: 25 },
    { subject: 'OS', originality: 82, aiLikelihood: 18 },
  ];

  return (
    <div className="space-y-8">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Campus-Wide <span className="text-indigo-400">Analytics</span></h2>
            <p className="text-gray-400 text-sm">Aggregate insights for institutional decision making</p>
          </div>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedElement delay={100} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Scholarship Matches</p>
            <p className="text-3xl font-black text-white">{scholarshipStats.matched}</p>
            <p className="text-[10px] text-green-400 mt-2 font-bold">↑ 12% from last month</p>
        </AnimatedElement>
        <AnimatedElement delay={200} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Applications Sent</p>
            <p className="text-3xl font-black text-white">{scholarshipStats.applied}</p>
            <p className="text-[10px] text-indigo-400 mt-2 font-bold">62% conversion rate</p>
        </AnimatedElement>
        <AnimatedElement delay={300} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Potential Aid Unclaimed</p>
            <p className="text-3xl font-black text-red-400">{scholarshipStats.unclaimed}</p>
            <p className="text-[10px] text-gray-500 mt-2 font-bold">Action required: Notify students</p>
        </AnimatedElement>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedElement delay={400} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-6">Department Burnout Risk</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnoutData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" hide />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#F87171" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={500} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-6">Skill Demand Heatmap</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={skillHeatmapData}
                dataKey="size"
                stroke="#111827"
                fill="#6366F1"
              >
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </AnimatedElement>
      </div>

      <AnimatedElement delay={600} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-6">Academic Integrity Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integritySummary.map((item, i) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">{item.subject}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-green-400">Originality</span>
                            <span className="text-white font-bold">{item.originality}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${item.originality}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1">
                            <span className="text-red-400">AI Likelihood</span>
                            <span className="text-white font-bold">{item.aiLikelihood}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${item.aiLikelihood}%` }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </AnimatedElement>
    </div>
  );
};

export default AdminAnalytics;
