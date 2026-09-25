import React from 'react';
import { BackgroundGradient } from './ui/BackgroundGradient';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onQuickParentLogin?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin, onQuickParentLogin }) => {
  return (
    <BackgroundGradient>
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Smart Attendance System
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            The next generation of campus management. Streamlined attendance, 
            real-time analytics, and AI-powered learning paths all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Get Started
            </button>
            
            <button
              onClick={onLogin}
              className="px-10 py-4 bg-transparent border-2 border-gray-600 hover:border-gray-400 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-8">
             <p className="text-gray-500 text-sm mb-4 italic">Quick Demo Access:</p>
             <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={onQuickParentLogin} 
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all"
                >
                  Parent Portal
                </button>
             </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-blue-400 font-bold text-xl mb-3">AI Face Recognition</h3>
              <p className="text-gray-400">Secure and fast attendance marking using advanced computer vision technology.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-purple-400 font-bold text-xl mb-3">Smart Dashboards</h3>
              <p className="text-gray-400">Personalized insights for students, teachers, parents, and administrators.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-pink-400 font-bold text-xl mb-3">Live Classroom</h3>
              <p className="text-gray-400">Seamless integration with virtual classes and real-time interaction tools.</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 text-center text-gray-500 text-sm">
          &copy; 2026 Smart Attendance System. All rights reserved.
        </div>
      </div>
    </BackgroundGradient>
  );
};

export default WelcomeScreen;
