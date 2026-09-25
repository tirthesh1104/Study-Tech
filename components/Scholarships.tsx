import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface AidProfile {
  annual_family_income: number;
  caste_category: string;
  state: string;
  disability_status: boolean;
  gender: string;
  academic_percentage: number;
}

interface Scholarship {
  id: string;
  name: string;
  eligibility_criteria: any;
  amount: string;
  deadline: string;
  apply_link: string;
}

const Scholarships: React.FC<{ user: User }> = ({ user }) => {
  const [profile, setProfile] = useState<AidProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [matchedScholarships, setMatchedScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<AidProfile>({
    annual_family_income: 0,
    caste_category: 'General',
    state: '',
    disability_status: false,
    gender: 'Other',
    academic_percentage: 0
  });

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('student_aid_profiles')
      .select('*')
      .eq('student_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData(data);
      fetchScholarships(data);
    } else {
      setIsEditingProfile(true);
      setLoading(false);
    }
  };

  const fetchScholarships = async (userProfile: AidProfile) => {
    setLoading(true);
    const { data, error } = await supabase.from('scholarships').select('*');
    if (data) {
      const matched = data.filter(s => {
        const criteria = s.eligibility_criteria;
        if (criteria.max_income && userProfile.annual_family_income > criteria.max_income) return false;
        if (criteria.min_percentage && userProfile.academic_percentage < criteria.min_percentage) return false;
        if (criteria.caste && criteria.caste !== userProfile.caste_category) return false;
        return true;
      });
      setMatchedScholarships(matched);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from('student_aid_profiles')
      .upsert({ student_id: user.id, ...formData });

    if (!error) {
      setProfile(formData);
      setIsEditingProfile(false);
      fetchScholarships(formData);
    }
  };

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Financial Aid & Scholarships</h2>
            <p className="text-gray-400">Match with scholarships based on your profile</p>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            {isEditingProfile ? 'Cancel' : 'Update Profile'}
          </button>
        </div>
      </AnimatedElement>

      {isEditingProfile && (
        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-6">
            <h3 className="text-xl font-bold text-white">Your Eligibility Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Annual Family Income (₹)</label>
                <input
                  type="number"
                  value={formData.annual_family_income}
                  onChange={e => setFormData({ ...formData, annual_family_income: parseInt(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Caste Category</label>
                <select
                  value={formData.caste_category}
                  onChange={e => setFormData({ ...formData, caste_category: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Academic Percentage (%)</label>
                <input
                  type="number"
                  value={formData.academic_percentage}
                  onChange={e => setFormData({ ...formData, academic_percentage: parseInt(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={saveProfile}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
            >
              Save Profile & Match
            </button>
          </div>
        </AnimatedElement>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Finding matches...</div>
        ) : matchedScholarships.length > 0 ? (
          matchedScholarships.map((s, idx) => (
            <AnimatedElement key={s.id} delay={idx * 100}>
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition-all flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-600/20 p-2 rounded-lg text-indigo-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="bg-red-600/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">
                    {getDaysLeft(s.deadline)} days left
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{s.name}</h3>
                <p className="text-2xl font-black text-green-400 mb-4">{s.amount}</p>
                <div className="mt-auto pt-4 flex gap-3">
                   <a 
                    href={s.apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 rounded-lg text-sm font-bold transition-colors"
                   >
                     View Details
                   </a>
                   <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold">
                     Apply
                   </button>
                </div>
              </div>
            </AnimatedElement>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
             <span className="text-4xl mb-4 block">🔍</span>
             <p className="text-gray-400">No matching scholarships found. Try updating your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scholarships;
