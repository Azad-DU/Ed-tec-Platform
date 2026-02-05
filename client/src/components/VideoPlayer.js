import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { trackVideo } from '../services/xapiService';
import { lessonAPI } from '../services/apiService';
import './VideoPlayer.css';

const VideoPlayer = ({ lessonId, videoUrl, onComplete, onNext, onPrev }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('[VideoPlayer] Received URL:', videoUrl);
  console.log('[VideoPlayer] CanPlay?', videoUrl ? ReactPlayer.canPlay(videoUrl.trim()) : 'No URL');

  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const savePositionInterval = useRef(null);

  // Load saved position on mount
  useEffect(() => {
    const loadSavedPosition = async () => {
      try {
        const response = await lessonAPI.getLessonContent(lessonId);
        if (response.data.success && response.data.data.last_position_seconds) {
          setResumePosition(response.data.data.last_position_seconds);
        }
      } catch (error) {
        console.error('Failed to load saved position:', error);
      }
    };

    loadSavedPosition();
  }, [lessonId]);

  const [cinemaMode, setCinemaMode] = useState(false);

  // Helper to extract YouTube ID and clear query params
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const toggleCinemaMode = () => {
    setCinemaMode(!cinemaMode);
  };

  // Robust check: sanitize URL to ensure ReactPlayer picks the correct player
  const videoId = getYoutubeId(videoUrl);
  // Prepare cleanUrl for ReactPlayer fallback
  const cleanUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (videoUrl ? videoUrl.trim() : '');

  // Calculate current time for display
  const currentTime = duration * played;

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (savePositionInterval.current) clearInterval(savePositionInterval.current);
    };
  }, []);

  // Handle player ready
  const handleReady = () => {
    if (!hasInitialized) {
      trackVideo.initialized(lessonId, videoUrl);
      setHasInitialized(true);

      // Seek to saved position if exists
      if (resumePosition > 0 && playerRef.current) {
        playerRef.current.seekTo(resumePosition, 'seconds');
      }
    }
  };

  // Handle play
  const handlePlay = () => {
    setPlaying(true);
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    trackVideo.played(lessonId, currentTime, duration);

    // Track progress every 10 seconds
    progressInterval.current = setInterval(() => {
      const time = playerRef.current?.getCurrentTime() || 0;
      trackVideo.progressed(lessonId, time, duration);
    }, 10000);

    // Save position every 5 seconds
    savePositionInterval.current = setInterval(() => {
      saveCurrentPosition();
    }, 5000);
  };

  // Handle pause
  const handlePause = () => {
    setPlaying(false);
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    trackVideo.paused(lessonId, currentTime, duration);

    // Clear intervals
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (savePositionInterval.current) clearInterval(savePositionInterval.current);

    // Save position on pause
    saveCurrentPosition();
  };

  // Handle progress
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);

      // Check for completion (>90% watched)
      if (state.played > 0.9 && duration > 0 && onComplete) {
        trackVideo.completed(lessonId, duration);
        onComplete();
      }
    }
  };

  // Handle duration
  const handleDuration = (dur) => {
    setDuration(dur);
  };

  const [error, setError] = useState(null);

  // Handle player error
  const handleError = (e) => {
    console.error('ReactPlayer Error:', e);
    setError(e ? JSON.stringify(e) : 'Unknown error');
  };

  // Handle seek
  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  // Save current position to backend
  const saveCurrentPosition = async () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    if (currentTime > 0) {
      try {
        await lessonAPI.updateProgress({
          lesson_id: lessonId,
          last_position_seconds: Math.floor(currentTime),
          progress_percentage: (currentTime / duration) * 100,
        });
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Fallback for non-YouTube (though mostly we expect YouTube)
  // ... code for other players if intended ...

  if (!videoUrl) {
    return (
      <div className="video-player-container flex items-center justify-center p-12 bg-gray-900 border border-gray-800">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🎬</span>
          <p className="text-gray-400">Select a lesson to start watching</p>
        </div>
      </div>
    );
  }

  // FORCE NATIVE IFRAME FOR YOUTUBE
  if (videoId) {
    return (
      <div className={`video-player-container ${cinemaMode ? 'cinema-mode' : ''}`}>
        {/* Header Controls */}
        <div className="video-controls-header">
          <div className="flex items-center gap-3">
            <span className="video-status-badge youtube">
              <span className="live-indicator"></span> YouTube
            </span>

            <div className="flex gap-2 ml-4">
              {onPrev && (
                <button
                  className="video-status-badge nav-lesson-badge"
                  onClick={onPrev}
                  title="Previous Lesson"
                >
                  ⏮️ Prev
                </button>
              )}

              {onNext && (
                <button
                  className="video-status-badge nav-lesson-badge"
                  onClick={onNext}
                  title="Next Lesson"
                >
                  Next ⏭️
                </button>
              )}
            </div>

            <span className="text-sm text-gray-400 hidden sm:inline-block border-l border-gray-700 pl-3 ml-2">
              High Definition • auto-quality
            </span>
          </div>

          <div className="video-actions">
            <button
              className="action-btn"
              onClick={toggleCinemaMode}
              title={cinemaMode ? "Exit Theatre Mode" : "Enter Theatre Mode"}
            >
              {cinemaMode ? '✕' : '⤢'}
            </button>
          </div>
        </div>

        <div className="player-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1&playsinline=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Fallback for non-YouTube (though mostly we expect YouTube)
  // ... code for other players if intended ...

  return (
    <div className="video-player-container">
      {/* DEBUG OVERLAY */}
      <div style={{ padding: '10px', background: '#333', color: '#fff', fontSize: '12px', marginBottom: '10px' }}>
        <p><strong>Debug Info:</strong></p>
        <p>URL: {videoUrl || 'No URL provided'}</p>
        <p>Error: {JSON.stringify(error) || 'None'}</p>
      </div>

      <div className="player-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={cleanUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          width="100%"
          height="100%"
          controls={true}
          config={{
            youtube: {
              playerVars: { showinfo: 1, controls: 1 }
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />
      </div>

      <div className="video-controls">
        {/* Play/Pause Button */}
        <button
          className="control-btn"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸️' : '▶️'}
        </button>

        {/* Progress Bar */}
        <div className="progress-container">
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="progress-bar"
          />
          <div className="progress-fill" style={{ width: `${played * 100}%` }} />
        </div>

        {/* Time Display */}
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Next Lesson Button */}
        {onNext && (
          <button
            className="control-btn next-btn"
            onClick={onNext}
            title="Next Lesson"
          >
            ⏭️
          </button>
        )}

        {/* Volume Control */}
        <button
          className="control-btn"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />

        {/* Next Lesson Button */}
        {onNext && (
          <button
            className="control-btn next-btn"
            onClick={onNext}
            title="Next Lesson"
          >
            ⏭️
          </button>
        )}

        {/* Playback Speed */}
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="speed-selector"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

export default VideoPlayer;
