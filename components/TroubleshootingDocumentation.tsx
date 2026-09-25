import React, { useState } from 'react';
import AnimatedElement from './AnimatedElement';

interface IssueCardProps {
  title: string;
  scenario: string;
  solution: string;
  image: string;
}

const IssueCard: React.FC<IssueCardProps> = ({ title, scenario, solution, image }) => (
  <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden group">
    <div className="relative h-48 overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
      <div className="absolute bottom-4 left-4">
        <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase">Issue Scenario</span>
      </div>
    </div>
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 text-sm italic">"{scenario}"</p>
      
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-green-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span> Recommended Solution
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">{solution}</p>
      </div>
    </div>
  </div>
);

const TroubleshootingDocumentation: React.FC = () => {
  const issues = [
    {
      title: "Blank Exam Screen",
      scenario: "Student encounters a completely white or loading screen when trying to start an examination.",
      solution: "Clear browser cache and cookies, then ensure you are using a supported browser like Chrome or Firefox. Update your browser to the latest version.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Authentication Error",
      scenario: "Session timeout or 'Access Denied' message appearing during question navigation.",
      solution: "Refresh the page and log in again. Ensure your internet connection is stable and you haven't logged in from another device.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Network Connectivity Failure",
      scenario: "Questions fail to load or options are non-responsive due to intermittent internet.",
      solution: "Reset your network router or switch to a more stable connection. The system will auto-save your progress once connection is restored.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Browser Compatibility",
      scenario: "Inaccessible question interface where buttons or text are overlapping or missing.",
      solution: "Disable all browser extensions (especially ad-blockers) and ensure zoom level is set to 100%. Use Incognito mode for the best experience.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <AnimatedElement>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-white">System <span className="text-indigo-400">Support Center</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Visual troubleshooting guide for common technical hurdles during examinations and portal usage.</p>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {issues.map((issue, i) => (
          <AnimatedElement key={i} delay={i * 100}>
            <IssueCard {...issue} />
          </AnimatedElement>
        ))}
      </div>

      <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-8">
        <div className="text-5xl">🆘</div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-white">Still having trouble?</h3>
          <p className="text-gray-400 text-sm">Our technical team is available 24/7 during exam periods. Click the button below to start a live support session.</p>
        </div>
        <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          Contact IT Support
        </button>
      </div>
    </div>
  );
};

export default TroubleshootingDocumentation;
