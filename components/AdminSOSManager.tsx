import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import AnimatedElement from './AnimatedElement';

interface SOSAlert {
  id: string;
  student_id: string;
  triggered_at: string;
  status: string;
  location_text: string;
  resolution_notes: string;
  profiles?: { name: string };
}

const AdminSOSManager: React.FC<{ user: User }> = ({ user }) => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);

  useEffect(() => {
    fetchAlerts();
    const subscription = supabase
      .channel('sos_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, payload => {
        fetchAlerts();
        new Audio('/alert.mp3').play().catch(() => {});
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('sos_alerts')
      .select('*, profiles(name)')
      .order('triggered_at', { ascending: false });
    if (data) setAlerts(data);
  };

  const resolveAlert = async (id: string, status: string, notes: string) => {
    await supabase.from('sos_alerts').update({ status, resolution_notes: notes }).eq('id', id);
    fetchAlerts();
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      <AnimatedElement>
        <div className="bg-red-600/10 p-6 rounded-2xl border border-red-500/30 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-red-500">Campus Safety Incidents</h2>
            <p className="text-gray-400">Manage emergency SOS alerts in real-time</p>
          </div>
          <div className="flex gap-4">
              <div className="bg-red-600/20 px-4 py-2 rounded-xl border border-red-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-bold uppercase text-xs tracking-widest">Live Monitoring</span>
              </div>
          </div>
        </div>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map(alert => (
          <AnimatedElement key={alert.id}>
            <div className={`bg-gray-800/50 p-6 rounded-2xl border transition-all ${
                alert.status === 'Pending' ? 'border-red-500 animate-in fade-in zoom-in-95' : 'border-gray-700'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{(alert as any).profiles?.name || 'Unknown Student'}</h3>
                  <p className="text-xs text-gray-500">{new Date(alert.triggered_at).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    alert.status === 'Pending' ? 'bg-red-600 text-white' : 
                    alert.status === 'Resolved' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                }`}>
                    {alert.status}
                </span>
              </div>
              <div className="p-3 bg-gray-900 rounded-xl mb-6">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Location</p>
                  <p className="text-sm text-white font-medium">{alert.location_text}</p>
              </div>
              <button 
                onClick={() => setSelectedAlert(alert)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all text-sm border border-gray-700"
              >
                Respond & Resolve
              </button>
            </div>
          </AnimatedElement>
        ))}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-3xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-red-600/10">
                    <h3 className="text-xl font-bold text-red-500">Alert Resolution: {(selectedAlert as any).profiles?.name}</h3>
                    <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-gray-800 rounded-full">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => resolveAlert(selectedAlert.id, 'Responded', 'Officer dispatched.')} className="py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold">Responded</button>
                        <button onClick={() => resolveAlert(selectedAlert.id, 'False Alarm', 'Mistake by student.')} className="py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold">False Alarm</button>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Resolution Notes</h4>
                        <textarea 
                            placeholder="Type resolution notes here..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                        />
                    </div>
                    <button onClick={() => resolveAlert(selectedAlert.id, 'Resolved', 'Issue resolved successfully.')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Mark as Resolved</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminSOSManager;
