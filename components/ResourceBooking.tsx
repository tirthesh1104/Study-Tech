import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface Resource {
  id: string;
  name: string;
  category: string;
  total_units: number;
  description: string;
  available_units?: number;
}

interface Booking {
  id: string;
  resource_id: string;
  user_id: string;
  booked_from: string;
  booked_to: string;
  status: string;
}

const ResourceBooking: React.FC<{ user: User }> = ({ user }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookingForm, setBookingForm] = useState({
    from: new Date().toISOString().slice(0, 16),
    to: new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  });

  useEffect(() => {
    fetchResources();
    fetchMyBookings();
  }, [user.id]);

  const fetchResources = async () => {
    const { data: resData } = await supabase.from('campus_resources').select('*');
    const { data: activeBookings } = await supabase
      .from('resource_bookings')
      .select('*')
      .eq('status', 'Confirmed');

    if (resData) {
      const updated = resData.map(res => {
        const count = activeBookings?.filter(b => b.resource_id === res.id).length || 0;
        return { ...res, available_units: res.total_units - count };
      });
      setResources(updated);
    }
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    const { data } = await supabase
      .from('resource_bookings')
      .select('*, campus_resources(name)')
      .eq('user_id', user.id)
      .order('booked_from', { ascending: false });
    if (data) setBookings(data);
  };

  const handleBooking = async () => {
    if (!selectedResource) return;
    
    const { error } = await supabase.from('resource_bookings').insert([{
      resource_id: selectedResource.id,
      user_id: user.id,
      booked_from: bookingForm.from,
      booked_to: bookingForm.to,
      status: 'Confirmed'
    }]);

    if (!error) {
      setSelectedResource(null);
      fetchResources();
      fetchMyBookings();
    } else {
        alert('Booking failed. Please check availability.');
    }
  };

  return (
    <div className="space-y-8">
      <AnimatedElement>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white">Campus Resource Booking</h2>
          <p className="text-gray-400">Reserve labs, equipment, or seminar rooms</p>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map(res => (
              <div 
                key={res.id} 
                className={`bg-gray-900/50 p-6 rounded-2xl border transition-all cursor-pointer ${
                    selectedResource?.id === res.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedResource(res)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{res.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (res.available_units || 0) > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                  }`}>
                    {res.available_units} / {res.total_units} Available
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{res.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{res.description}</p>
                <button 
                    disabled={(res.available_units || 0) <= 0}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    {(res.available_units || 0) > 0 ? 'Select Resource' : 'Fully Booked'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Create Booking</h3>
            {selectedResource ? (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20 mb-6">
                    <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Selected</p>
                    <p className="text-white font-bold">{selectedResource.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase">From</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    value={bookingForm.from}
                    onChange={e => setBookingForm({ ...bookingForm, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase">To</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                    value={bookingForm.to}
                    onChange={e => setBookingForm({ ...bookingForm, to: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleBooking}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all mt-4"
                >
                  Confirm Booking
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 italic">Select a resource to start booking</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">My Bookings</h3>
            <div className="space-y-3">
              {bookings.length > 0 ? bookings.map(b => (
                <div key={b.id} className="p-3 bg-gray-900/50 rounded-xl border border-gray-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">{(b as any).campus_resources?.name || 'Resource'}</span>
                    <span className="text-green-400 font-bold uppercase">{b.status}</span>
                  </div>
                  <p className="text-gray-500">
                    {new Date(b.booked_from).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} - {new Date(b.booked_to).toLocaleTimeString([], { timeStyle: 'short' })}
                  </p>
                </div>
              )) : (
                <p className="text-center text-gray-500 italic text-sm py-4">No active bookings</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResourceBooking;
