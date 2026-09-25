import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface PrivacySettings {
  show_attendance: boolean;
  show_assignments: boolean;
  show_grades: boolean;
  show_burnout: boolean;
}

const ParentPrivacy: React.FC<{ user: User }> = ({ user }) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    show_attendance: true,
    show_assignments: true,
    show_grades: false,
    show_burnout: false
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [user.id]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('parent_visibility_settings')
      .select('*')
      .eq('student_id', user.id)
      .single();

    if (data) setSettings(data);
    setLoading(false);
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    if (key === 'show_attendance') return; // Always on
    setSettings({ ...settings, [key]: !settings[key] });
    setSaved(false);
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('parent_visibility_settings')
      .upsert({ student_id: user.id, ...settings });

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">Parent Privacy Controls</h2>
          <p className="text-gray-400">Control what information your parents can see on their dashboard</p>
        </div>
      </AnimatedElement>

      <AnimatedElement delay={100}>
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 opacity-60">
              <div>
                <h4 className="text-white font-bold">Attendance Percentage</h4>
                <p className="text-xs text-gray-500">Required for institutional compliance</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-indigo-500/50 transition-all"
              onClick={() => handleToggle('show_assignments')}
            >
              <div>
                <h4 className="text-white font-bold">Assignment Completion</h4>
                <p className="text-xs text-gray-500">Show pending and completed assignments</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.show_assignments ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.show_assignments ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-indigo-500/50 transition-all"
              onClick={() => handleToggle('show_grades')}
            >
              <div>
                <h4 className="text-white font-bold">Academic Grades</h4>
                <p className="text-xs text-gray-500">Show marks and overall grades</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.show_grades ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.show_grades ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-indigo-500/50 transition-all"
              onClick={() => handleToggle('show_burnout')}
            >
              <div>
                <h4 className="text-white font-bold">Wellness & Burnout Score</h4>
                <p className="text-xs text-gray-500">Share your emotional pulse summary</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.show_burnout ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.show_burnout ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Settings Saved
              </>
            ) : 'Update Privacy Settings'}
          </button>
        </div>
      </AnimatedElement>

      <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl">
        <div className="flex gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
                <h4 className="text-red-400 font-bold text-sm uppercase">Important Note</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Administrators reserve the right to override these settings in cases of critical risk (e.g., severe dropout risk or safety concerns). Counselor notes are always kept private from parents.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPrivacy;
