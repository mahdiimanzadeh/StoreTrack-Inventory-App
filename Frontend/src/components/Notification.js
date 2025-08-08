// src/components/Notification.js
import React, { useState, useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 3000); // پیام بعد از 3 ثانیه ناپدید می‌شود

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const textColor = 'text-white';

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${bgColor} ${textColor} z-50`}
      role="alert"
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ) : (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )}
        <span>{message}</span>
        <button onClick={() => setIsVisible(false)} className="ml-auto text-white opacity-75 hover:opacity-100">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
