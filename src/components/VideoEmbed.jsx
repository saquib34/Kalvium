import React, { useState } from 'react';

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    : `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const VideoEmbed = ({ videoId, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      }, delay);
    });
  };

  const handleVideoClick = async () => {
    if (isSpeaking || isPlaying) return; // Prevent multiple triggers
    setIsSpeaking(true);

    await speakText("Now start revising what we learned");
    await speakText("Here is the video", 500);
    await speakText("Now give the video", 500);

    setIsSpeaking(false);
    setIsPlaying(true); // Play video inline after speech
  };

  return (
    <div className="container">
      <div className="video-card">
        {!isPlaying ? (
          <div className="thumbnail-container" onClick={handleVideoClick}>
            <img 
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Video thumbnail"
              className="thumbnail"
            />
            <span className="duration">{formatDuration(duration)}</span>
            {isSpeaking && <div className="speaking-indicator">Speaking...</div>}
          </div>
        ) : (
          <div className="video-frame">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          width: 100%;
        }

        .video-card {
          max-width: 360px;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .video-card:hover:not(:has(.video-frame)) {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .thumbnail-container {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .thumbnail {
          width: 100%;
          height: auto;
          transition: transform 0.5s ease;
        }

        .thumbnail-container:hover .thumbnail {
          transform: scale(1.05);
        }

        .duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }

        .speaking-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          animation: pulse 1.5s infinite;
        }

        .video-frame {
          width: 100%;
          height: 202px; /* Matches typical YouTube thumbnail aspect ratio (16:9 at 360px width) */
          opacity: 0;
          transform: scale(0.9);
          animation: zoomIn 0.5s ease-out forwards;
          animation-delay: 0.2s;
        }

        .video {
          width: 100%;
          height: 100%;
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoEmbed;