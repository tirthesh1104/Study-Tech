import React from 'react';

interface CareerGuidanceProps {
  insight: {
    courseName: string;
    marketDemand: string;
    opportunities: string[];
    trends: string[];
    skillValue: string;
    futureScope: string;
    earningPotential: {
      paths: { title: string; range: string }[];
      freelance: string;
      roles: string[];
    };
  };
}

const CareerGuidance: React.FC<CareerGuidanceProps> = ({ insight }) => {
  return (
    <div className="space-y-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Career Guidance: {insight.courseName}</h2>
        <p className="text-gray-400">Personalized insights based on your academic path.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="bg-blue-600/10 p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-xl font-bold text-blue-400 mb-3">Market Demand</h3>
            <p className="text-gray-300 leading-relaxed">{insight.marketDemand}</p>
          </div>

          <div className="bg-purple-600/10 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-xl font-bold text-purple-400 mb-3">Key Opportunities</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insight.opportunities.map((opp, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-pink-600/10 p-6 rounded-xl border border-pink-500/20">
            <h3 className="text-xl font-bold text-pink-400 mb-3">Future Trends</h3>
            <div className="flex flex-wrap gap-2">
              {insight.trends.map((trend, idx) => (
                <span key={idx} className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
                  {trend}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-green-600/10 p-6 rounded-xl border border-green-500/20">
            <h3 className="text-xl font-bold text-green-400 mb-3">Earning Potential</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {insight.earningPotential.paths.map((path, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                    <span className="text-gray-400">{path.title}</span>
                    <span className="text-white font-bold">{path.range}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic mt-2">Freelance: {insight.earningPotential.freelance}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Ready to take the next step?</h3>
        <p className="text-gray-400 mb-4">Connect with our AI career counselor for a personalized roadmap.</p>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all">
          Chat with AI Advisor
        </button>
      </div>
    </div>
  );
};

export default CareerGuidance;
