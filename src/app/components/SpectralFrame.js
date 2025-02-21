'use client';

import { useState, useEffect } from 'react';
import SpectralQuiz from './SpectralQuiz';

export default function SpectralFrame() {
  const [frameMessage, setFrameMessage] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Listen for Frame messages
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'frame') {
        setFrameMessage(event.data);
      }
    });
  }, []);

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">
          Discover Your Spectral Researcher Type
        </h1>
        <p className="text-lg mb-8">
          Take this quick quiz to understand your unique approach to research and knowledge processing.
        </p>
        <button
          onClick={() => setIsStarted(true)}
          className="bg-candy-pink text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  return <SpectralQuiz />;
} 