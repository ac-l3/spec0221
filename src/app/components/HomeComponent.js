'use client';

import { useState, useEffect } from 'react';
import { SPECTRAL_TYPES } from '../../lib/constants';
import Layout from './Layout';

export default function HomeComponent({ fid: initialFid, initialData }) {
  const [isLoading, setIsLoading] = useState(!initialData && initialFid);
  const [analysis, setAnalysis] = useState(initialData?.analysis || null);
  const [fid, setFid] = useState(initialFid);
  const [userInfo, setUserInfo] = useState(
    initialData ? {
      username: initialData.username,
      display_name: initialData.displayName,
      pfp_url: initialData.pfpUrl,
      profile: { bio: { text: initialData.bio } }
    } : null
  );
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [userFid, setUserFid] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(null);

  useEffect(() => {
    async function loadAnalysis() {
      if (!fid || initialData) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analyze-profile?fid=${fid}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze profile');
        }

        setAnalysis(data.analysis);
        setUserInfo({
          username: data.username,
          display_name: data.displayName,
          pfp_url: data.pfpUrl,
          profile: { bio: { text: data.bio } }
        });
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalysis();
  }, [fid, initialData]);

  useEffect(() => {
    const checkUserFid = () => {
      const currentUserFid = window.userFid;
      
      if (currentUserFid !== userFid) {
        setUserFid(currentUserFid);
        setIsOwnProfile(currentUserFid ? (currentUserFid && fid && Number(currentUserFid) === Number(fid)) : null);
      }
    };
    
    checkUserFid();
    const interval = setInterval(checkUserFid, 1000);
    return () => clearInterval(interval);
  }, [fid, userFid]);

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    
    try {
      // Generate share image
      const response = await fetch('/api/generate-share-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid })
      });
      
      if (!response.ok) throw new Error('Failed to generate share image');
      const { imageUrl } = await response.json();

      // Create share text with spectral type
      const type = SPECTRAL_TYPES[analysis.spectralType];
      const shareText = `I'm ${type.name}! Discover your Spectral Researcher type by pressing the button below.`;
      
      // Create Warpcast share URL
      const encodedText = encodeURI(shareText);
      const encodedAppUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}?fid=${fid}`);
      const shareUrl = `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedAppUrl}`;

      // Open share URL using Frame SDK
      if (window.frame?.sdk?.actions?.openUrl) {
        window.frame.sdk.actions.openUrl(shareUrl);
      } else {
        throw new Error('Unable to open share dialog');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-candy-pink text-white font-semibold rounded-lg"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            Analyzing {userInfo?.username ? `@${userInfo.username}` : 'Profile'}
          </h1>
          <p className="text-lg">Discovering your research style...</p>
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-3xl font-bold mb-6">
            Discover Your Spectral Researcher Type
          </h1>
          <p className="text-lg mb-4">
            Connect your Farcaster account to analyze your research style.
          </p>
        </div>
      </Layout>
    );
  }

  const type = SPECTRAL_TYPES[analysis.spectralType];
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Spectral Analysis for @{userInfo.username}
        </h1>
        
        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{type.name}</h2>
            <p className="text-lg mb-6">{analysis.personalityOverview}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Key Patterns:</h3>
            <div className="space-y-4">
              {analysis.supportingEvidence.map((evidence, i) => (
                <div key={i} className="bg-white/70 rounded-lg p-4">
                  <h4 className="font-medium text-lg mb-2">{evidence.pattern}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {evidence.phrases.map((phrase, j) => (
                      <span key={j} className="inline-block bg-candy-pink/10 text-candy-pink px-3 py-1 rounded-full text-sm font-medium">
                        {phrase}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-800">{evidence.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {analysis.whyNotOtherTypes && analysis.whyNotOtherTypes.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">We also considered:</h3>
              <div className="space-y-4">
                {analysis.whyNotOtherTypes.map((type, i) => (
                  <div key={i} className="bg-white/70 rounded-lg p-4">
                    <h4 className="font-medium text-lg mb-2">{type.type}</h4>
                    <p className="text-gray-800">{type.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.growthAreas && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Growth Areas:</h3>
              <p className="text-gray-800">{analysis.growthAreas}</p>
            </div>
          )}

          <div className="text-center mt-8">
            {isOwnProfile === false ? (
              <a 
                href="/"
                className="px-6 py-3 bg-candy-pink text-white font-semibold rounded-full hover:bg-candy-pink/90 transition-colors"
              >
                Try Yours →
              </a>
            ) : (
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="px-6 py-3 bg-candy-pink text-white font-semibold rounded-full hover:bg-candy-pink/90 transition-colors disabled:opacity-50"
              >
                {isSharing ? 'Sharing...' : 'Share Results →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 