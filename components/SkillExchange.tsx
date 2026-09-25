import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface SkillBarterPost {
  id: string;
  student_id: string;
  can_teach: string[];
  wants_to_learn: string[];
  contact_visible: boolean;
  created_at: string;
}

const SkillExchange: React.FC<{ user: User }> = ({ user }) => {
  const [posts, setPosts] = useState<SkillBarterPost[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const [newPost, setNewPost] = useState({
    can_teach: '',
    wants_to_learn: '',
    contact_visible: true
  });

  useEffect(() => {
    fetchPosts();
    fetchCredits();
  }, [user.id]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('skill_barter_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const fetchCredits = async () => {
    const { data, error } = await supabase
      .from('credits_ledger')
      .select('amount')
      .eq('student_id', user.id);

    if (data) {
      setCredits(data.reduce((acc, curr) => acc + curr.amount, 0));
    }
  };

  const handleCreatePost = async () => {
    const { error } = await supabase
      .from('skill_barter_posts')
      .insert([{
        student_id: user.id,
        can_teach: newPost.can_teach.split(',').map(s => s.trim()),
        wants_to_learn: newPost.wants_to_learn.split(',').map(s => s.trim()),
        contact_visible: newPost.contact_visible
      }]);

    if (!error) {
      setIsPosting(false);
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Peer Knowledge Barter</h2>
            <p className="text-gray-400">Exchange skills with your peers and earn Campus Credits</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600/20 px-4 py-2 rounded-xl border border-indigo-500/30 flex items-center gap-2">
                <span className="text-indigo-400 font-bold">Credits:</span>
                <span className="text-white text-lg font-black">{credits}</span>
            </div>
            <button
              onClick={() => setIsPosting(!isPosting)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              {isPosting ? 'Cancel' : 'Create Post'}
            </button>
          </div>
        </div>
      </AnimatedElement>

      {isPosting && (
        <AnimatedElement delay={100}>
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-white">What can you offer?</h3>
            <div className="space-y-4">
              <input
                placeholder="Skills I can teach (comma separated, e.g. Python, Guitar, UI Design)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newPost.can_teach}
                onChange={e => setNewPost({ ...newPost, can_teach: e.target.value })}
              />
              <input
                placeholder="Skills I want to learn (comma separated, e.g. React, French, Public Speaking)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                value={newPost.wants_to_learn}
                onChange={e => setNewPost({ ...newPost, wants_to_learn: e.target.value })}
              />
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPost.contact_visible}
                  onChange={e => setNewPost({ ...newPost, contact_visible: e.target.checked })}
                  className="w-4 h-4 bg-gray-900 border border-gray-700 rounded"
                />
                Show my contact info to potential matches
              </label>
            </div>
            <button
              onClick={handleCreatePost}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
            >
              Post Skill Barter
            </button>
          </div>
        </AnimatedElement>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Searching for matches...</div>
        ) : posts.length > 0 ? (
          posts.filter(p => p.student_id !== user.id).map((post, idx) => (
            <AnimatedElement key={post.id} delay={idx * 50}>
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition-all flex flex-col h-full group">
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Can Teach</h4>
                    <div className="flex flex-wrap gap-2">
                        {post.can_teach.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-green-600/10 text-green-400 rounded-lg text-xs font-bold border border-green-500/20">{s}</span>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Wants to Learn</h4>
                    <div className="flex flex-wrap gap-2">
                        {post.wants_to_learn.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-red-600/10 text-red-400 rounded-lg text-xs font-bold border border-red-500/20">{s}</span>
                        ))}
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
                   <span className="text-xs text-gray-500">Posted {new Date(post.created_at).toLocaleDateString()}</span>
                   <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold group-hover:scale-105 transition-transform">
                     Request Swap
                   </button>
                </div>
              </div>
            </AnimatedElement>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
             <p className="text-gray-400">No skill exchange posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillExchange;
