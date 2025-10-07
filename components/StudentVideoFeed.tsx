import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Student } from '../types';
import { analyzeStudentEngagement } from '../services/geminiService';
import Spinner from './Spinner';

type EngagementStatus = 'Focused' | 'Losing Focus' | 'Sleeping' | 'Idle';

interface StudentVideoFeedProps {
  student: Student;
  mediaStream: MediaStream | null;
  isMonitoring: boolean;
  onAlert: (studentName: string, message: string) => void;
}

const MONITORING_INTERVAL = 30000; // 30 seconds to respect API rate limits (4 students * 2 req/min = 8 req/min < 10)

const StudentVideoFeed: React.FC<StudentVideoFeedProps> = ({ student, mediaStream, isMonitoring, onAlert }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [status, setStatus] = useState<EngagementStatus>('Idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [distractedInfo, setDistractedInfo] = useState<{ startTime: number; alertSent: boolean } | null>(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
    }
  }, [mediaStream]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) {
      return;
    }
    
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.5);
    const base64Image = imageDataUrl.split(',')[1];
    
    const result = await analyzeStudentEngagement(base64Image);
    
    if (result) {
        const isDistracted = result.status === 'Losing Focus' || result.status === 'Sleeping';

        if (isDistracted) {
            if (distractedInfo === null) {
                // Start timer for distraction
                setDistractedInfo({ startTime: Date.now(), alertSent: false });
            } else if (!distractedInfo.alertSent && Date.now() - distractedInfo.startTime > 120000) {
                // Timer exceeded 2 mins and no alert sent yet
                onAlert(student.name, `${result.reason} (for over 2 minutes)`);
                setDistractedInfo({ ...distractedInfo, alertSent: true }); // Mark alert as sent
            }
        } else {
            // Student is focused, reset distraction timer
            setDistractedInfo(null);
        }
      setStatus(result.status);
    }

    setIsProcessing(false);
  }, [onAlert, student.name, distractedInfo]);

  useEffect(() => {
    if (isMonitoring) {
      // Initial check
      captureAndAnalyze();
      // Set up interval
      intervalRef.current = window.setInterval(captureAndAnalyze, MONITORING_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStatus('Idle');
      setDistractedInfo(null);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMonitoring, captureAndAnalyze]);

  const getBorderColor = () => {
    if (!isMonitoring) return 'border-gray-600';
    switch (status) {
      case 'Focused': return 'border-green-500';
      case 'Losing Focus': return 'border-yellow-400';
      case 'Sleeping': return 'border-red-500 animate-pulse';
      default: return 'border-gray-600';
    }
  };

  return (
    <div className={`relative bg-black rounded-lg border-4 transition-all duration-500 ${getBorderColor()} overflow-hidden flex flex-col`}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      
      {status === 'Sleeping' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <p className="text-white text-xl font-bold text-center p-4">{student.name} may be sleeping</p>
        </div>
      )}

      {isProcessing && (
         <div className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
            <Spinner />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <span className="text-white font-semibold">{student.name}</span>
      </div>
    </div>
  );
};

export default StudentVideoFeed;