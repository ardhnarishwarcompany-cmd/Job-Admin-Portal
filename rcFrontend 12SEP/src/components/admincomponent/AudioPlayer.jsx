import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Mic, Radio } from "lucide-react";
import { motion } from "framer-motion";

const AudioPlayer = ({ src, label = "Audio Introduction" }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-full sm:max-w-md rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 p-3.5 sm:p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-blue-200">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Top Header Label */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 tracking-tight block">
              {label}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              Voice Preview
            </span>
          </div>
        </div>

        {/* Animated Equalizer Waveform Bars when playing */}
        <div className="flex items-center gap-1 h-4 px-2 py-1 rounded-full bg-white/80 border border-slate-200/60">
          {[0.6, 1, 0.4, 0.8, 0.5].map((scale, i) => (
            <motion.span
              key={i}
              className={`w-0.5 rounded-full ${
                isPlaying ? "bg-blue-600" : "bg-slate-300"
              }`}
              animate={
                isPlaying
                  ? {
                      height: ["4px", `${14 * scale}px`, "4px"],
                    }
                  : { height: "4px" }
              }
              transition={
                isPlaying
                  ? {
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }
                  : {}
              }
            />
          ))}
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={togglePlay}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all ${
            isPlaying
              ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-200 ring-2 ring-orange-400/30"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:shadow-blue-300"
          }`}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </motion.button>

        {/* Progress Bar & Timers */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="relative flex items-center w-full">
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200/90 accent-blue-600 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #2563eb ${progressPercent}%, #cbd5e1 ${progressPercent}%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-rose-500" />
          ) : (
            <Volume2 className="h-4 w-4 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
