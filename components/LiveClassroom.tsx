import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Student, LiveClass, User } from '../types';
import StudentVideoFeed from './StudentVideoFeed';
import Modal from './Modal';
import ScheduleClassForm from './ScheduleClassForm';

interface LiveClassroomProps {
  students: Student[];
  liveClasses: LiveClass[];
  onScheduleClass: (newClass: LiveClass) => void;
  onDeleteClass: (classId: string) => void;
  user: User;
  onUpdateClassStatus: (classId: string, status: 'Live' | 'Completed') => void;
}

function LiveClassroom({ students, liveClasses, onScheduleClass, onDeleteClass, user, onUpdateClassStatus }: LiveClassroomProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [alerts, setAlerts] = useState<{ studentName: string; message: string; timestamp: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // For the demo, we'll only monitor a subset of students to not overload the browser/API
  const monitoredStudents = students.slice(0, 4); 

  useEffect(() => {
    // This effect handles setting up and tearing down the camera stream based on whether a class is active.
    if (!activeClass) {
      // If no class is active, we don't need a stream. The cleanup function of the previous run will have handled stopping it.
      return;
    }

    let stream: MediaStream;

    const setupCamera = async () => {
      try {
        // Request media access from the user.
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Update the state to make the stream available to child components.
        setMediaStream(stream);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Could not access camera and microphone. Please check permissions and ensure they are not in use by another application.");
      }
    };

    setupCamera();

    // This cleanup function is crucial. It will be called when the component unmounts
    // or when the `activeClass` dependency changes (i.e., when monitoring stops).
    return () => {
      // We stop the tracks of the specific stream created in this effect run.
      // This is safer than relying on the `mediaStream` state which might be from a different render.
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Also reset the state to ensure a clean state for the next session.
      setMediaStream(null);
    };
  }, [activeClass]); // This effect should ONLY run when `activeClass` changes.

  // This effect will automatically mark running classes as 'Completed' when their time is up.
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        liveClasses.forEach(liveClass => {
            const endTime = liveClass.scheduledTime + liveClass.durationMinutes * 60000;
            if (liveClass.status === 'Live' && now > endTime) {
                onUpdateClassStatus(liveClass.id, 'Completed');
            }
        });
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [liveClasses, onUpdateClassStatus]);

  const handleAlert = useCallback((studentName: string, message: string) => {
    const newAlert = {
      studentName,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const handleStartMonitoring = (liveClass: LiveClass) => {
    setActiveClass(liveClass);
    setIsMonitoring(true);
    setAlerts([]); // Clear alerts when starting a new session
  };
  
  const handleStopMonitoring = () => {
    setActiveClass(null);
    setIsMonitoring(false);
  };

  const sortedLiveClasses = useMemo(() => {
    return [...liveClasses].sort((a,b) => b.scheduledTime - a.scheduledTime);
  }, [liveClasses]);

  const handleDelete = useCallback((classId: string, topic: string) => {
    if (window.confirm(`Are you sure you want to delete the class "${topic}"? This action cannot be undone.`)) {
        onDeleteClass(classId);
    }
  }, [onDeleteClass]);

  if (activeClass) {
    if (error) {
        return (
            <div className="bg-red-900/50 text-red-300 p-6 rounded-xl border border-red-500/50 text-center">
                <h3 className="text-xl font-bold mb-2">Error</h3>
                <p>{error}</p>
                <button onClick={handleStopMonitoring} className="mt-4 px-4 py-2 bg-gray-600 rounded-lg">Back to List</button>
            </div>
        );
    }
    // Monitoring View
    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-20rem)]">
            <div className="flex-1 bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {monitoredStudents.map(student => (
                    <StudentVideoFeed 
                        key={student.id} 
                        student={student} 
                        mediaStream={mediaStream}
                        isMonitoring={isMonitoring}
                        onAlert={handleAlert}
                    />
                ))}
                </div>
                <div className="mt-4 p-2 bg-gray-900 rounded-lg flex justify-center items-center gap-4">
                <button onClick={handleStopMonitoring} className="px-6 py-2 rounded-lg font-semibold text-white transition-colors text-lg bg-red-600 hover:bg-red-700">
                        End Monitoring Session
                    </button>
                </div>
            </div>
            <aside className="w-full lg:w-72 bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-600 pb-2 mb-2">Engagement Alerts</h3>
                <div className="overflow-y-auto flex-1">
                {alerts.length > 0 ? (
                    <ul className="space-y-3">
                    {alerts.map((alert, index) => (
                        <li key={index} className="text-sm p-2 bg-gray-700/50 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-yellow-300">{alert.studentName}</span>
                            <span className="text-xs text-gray-400">{alert.timestamp}</span>
                        </div>
                        <p className="text-gray-300">{alert.message}</p>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                        <p>Monitoring... No alerts yet.</p>
                    </div>
                )}
                </div>
            </aside>
        </div>
    );
  }

  // List & Schedule View
  return (
    <>
      {isScheduleModalOpen && (
        <Modal title="Schedule New Class" onClose={() => setIsScheduleModalOpen(false)}>
            <ScheduleClassForm user={user} onSchedule={(newClass) => { onScheduleClass(newClass); setIsScheduleModalOpen(false); }} onClose={() => setIsScheduleModalOpen(false)} />
        </Modal>
      )}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-indigo-400">Live Class Management</h2>
            <button onClick={() => setIsScheduleModalOpen(true)} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                + Schedule New Class
            </button>
        </div>

         <div className="space-y-4">
            {sortedLiveClasses.map(liveClass => {
                const startTime = new Date(liveClass.scheduledTime);
                const isPast = liveClass.status === 'Completed';
                return (
                    <div key={liveClass.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isPast ? 'bg-gray-900/40 border-gray-700/50' : 'bg-gray-900/70 border-gray-700'}`}>
                        <div>
                            <h3 className={`font-semibold text-lg ${isPast ? 'text-gray-400' : 'text-white'}`}>{liveClass.topic}</h3>
                            <p className="text-sm text-gray-400">{liveClass.subject}</p>
                            <p className="text-sm text-indigo-400 mt-1">{startTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                            {liveClass.status === 'Scheduled' && (
                                <button onClick={() => onUpdateClassStatus(liveClass.id, 'Live')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Start Class
                                </button>
                            )}
                            {liveClass.status === 'Live' && (
                                <>
                                    <a href={liveClass.meetLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 animate-pulse">
                                        Join Live Class
                                    </a>
                                    <button onClick={() => handleStartMonitoring(liveClass)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                        Start AI Monitoring
                                    </button>
                                </>
                            )}
                             {liveClass.status === 'Completed' && (
                                <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 rounded-lg">
                                    Class Ended
                                </span>
                            )}
                            {liveClass.status !== 'Live' && (
                                <button
                                    onClick={() => handleDelete(liveClass.id, liveClass.topic)}
                                    className="p-2 text-red-400 hover:bg-red-900/50 rounded-full transition-colors"
                                    aria-label={`Delete class ${liveClass.topic}`}
                                    title="Delete Class"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
             {sortedLiveClasses.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <p>No live classes scheduled. Click "Schedule New Class" to get started.</p>
                </div>
            )}
         </div>
      </div>
    </>
  );
};

export default LiveClassroom;