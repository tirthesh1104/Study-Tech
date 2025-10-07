import React, { useState, useEffect } from 'react';
import { LiveClass } from '../types';
import AnimatedElement from './AnimatedElement';

interface LiveClassesViewProps {
  liveClasses: LiveClass[];
}

const LiveClassesView: React.FC<LiveClassesViewProps> = ({ liveClasses }) => {
  
  const upcomingClasses = liveClasses
    .filter(c => c.status !== 'Completed')
    .sort((a, b) => a.scheduledTime - b.scheduledTime);

  const pastClasses = liveClasses
    .filter(c => c.status === 'Completed')
    .sort((a, b) => b.scheduledTime - a.scheduledTime);

  const ClassCard: React.FC<{ liveClass: LiveClass }> = ({ liveClass }) => {
    const startTime = new Date(liveClass.scheduledTime);

    const getActionButton = () => {
        switch (liveClass.status) {
            case 'Live':
                return (
                    <a href={liveClass.meetLink} target="_blank" rel="noopener noreferrer" 
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-green-600 hover:bg-green-700 animate-pulse">
                        Join Meeting
                    </a>
                );
            case 'Completed':
                return liveClass.recordingUrl ? (
                    <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        View Recording
                    </a>
                ) : (
                    <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 rounded-lg">
                        Completed
                    </span>
                );
            case 'Scheduled':
            default:
                return (
                    <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 rounded-lg cursor-not-allowed">
                        Upcoming
                    </span>
                );
        }
    };

    return (
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{liveClass.topic}</h3>
          <p className="text-sm text-gray-400">{liveClass.subject} with {liveClass.teacherName}</p>
          <p className="text-sm text-indigo-400 mt-1">
            {startTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div>
          {getActionButton()}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">Upcoming & Live Classes</h2>
        {upcomingClasses.length > 0 ? (
          <div className="space-y-4">
            {upcomingClasses.map((c, i) => <AnimatedElement key={c.id} delay={i * 100}><ClassCard liveClass={c} /></AnimatedElement>)}
          </div>
        ) : (
          <p className="text-gray-400">No upcoming classes scheduled.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">Past Classes</h2>
        {pastClasses.length > 0 ? (
          <div className="space-y-4">
            {pastClasses.map((c, i) => <AnimatedElement key={c.id} delay={i * 100}><ClassCard liveClass={c} /></AnimatedElement>)}
          </div>
        ) : (
          <p className="text-gray-400">No past classes found.</p>
        )}
      </div>
    </div>
  );
};

export default LiveClassesView;