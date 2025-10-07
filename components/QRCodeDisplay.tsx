import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Spinner from './Spinner';

// Make QRCode globally available from the script tag in index.html
declare var QRCode: any;

interface QRCodeDisplayProps {
  user: User;
  location: GeolocationCoordinates;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ user, location }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const header = { alg: 'none', typ: 'JWT' };
    const payload = {
      studentId: user.id,
      timestamp: Date.now(),
      exp: Date.now() + 60 * 1000, // Expiration time: 60 seconds from now
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };
    
    // URL-safe Base64 encoding for JWT parts
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // Since we can't securely sign on the client, we use an empty signature for alg 'none'
    const jwtToken = `${encodedHeader}.${encodedPayload}.`;

    QRCode.toDataURL(jwtToken, { width: 256, margin: 2 })
      .then((url: string) => {
        setQrCodeUrl(url);
      })
      .catch((err: Error) => {
        console.error('QR Code generation failed:', err);
        setError('Could not generate QR code. Please try again.');
      });
  }, [user, location]);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-xl font-bold text-white mb-2">Present this QR code to the teacher</h3>
      <p className="text-gray-400 mb-4">This code is valid for a single use.</p>
      <div className="bg-white p-4 rounded-lg shadow-lg w-72 h-72 flex items-center justify-center">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : qrCodeUrl ? (
          <img src={qrCodeUrl} alt="Attendance QR Code" />
        ) : (
          <Spinner />
        )}
      </div>
      <div className="mt-4 text-center">
        {expiresIn > 0 ? (
           <p className="text-lg text-yellow-400">
             Expires in: <span className="font-bold text-2xl">{expiresIn}s</span>
           </p>
        ) : (
           <p className="text-lg font-bold text-red-500">QR Code Expired</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeDisplay;