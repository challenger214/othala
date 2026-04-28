import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MonitorPlay, AlertCircle, Volume2, Volume1, VolumeX } from 'lucide-react';

// Define only the available channels
const AVAILABLE_CHANNELS = [1, 9, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

const YOUTUBE_MAPPING: Record<number, string> = {
  1: 'jfKfPfyJRdk', // Lofi Girl
  9: 'o6-IbLjURyc', // Yonhap News TV
  19: 'M9MRGuPToEk', // TV Chosun
  20: 'P8QordVAUyU', // VOD
};

const NAME_MAPPING: Record<number, string> = {
  1: 'Lofi Girl',
  9: 'KBS',
  19: 'TV Chosun',
  20: 'VOD',
  21: 'Channel 21',
  22: 'Channel 22',
  23: 'Channel 23',
  24: 'Channel 24',
  25: 'Channel 25',
  26: 'Channel 26',
  27: 'Channel 27',
  28: 'Channel 28',
  29: 'Channel 29',
};

const STYLE_MAPPING: Record<number, string> = {
  1: 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950',
  9: 'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-950',
  19: 'bg-gradient-to-br from-red-900 via-red-800 to-red-950',
  20: 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950',
  21: 'bg-gradient-to-br from-green-900 via-green-800 to-green-950',
  22: 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950',
  23: 'bg-gradient-to-br from-pink-900 via-pink-800 to-pink-950',
  24: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950',
  25: 'bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950',
  26: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950',
  27: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950',
  28: 'bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950',
  29: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950',
};

export default function App() {
  const [channel, setChannel] = useState(1);
  const [osdVisible, setOsdVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Volume state - Initial volume set to 10
  const [volume, setVolume] = useState(10);
  const [volumeOsdVisible, setVolumeOsdVisible] = useState(false);
  
  const osdTimeoutRef = useRef<number | null>(null);
  const changeTimeoutRef = useRef<number | null>(null);
  const volumeOsdTimeoutRef = useRef<number | null>(null);

  const triggerOSD = useCallback(() => {
    setOsdVisible(true);
    if (osdTimeoutRef.current) window.clearTimeout(osdTimeoutRef.current);
    
    // Hide OSD after 3 seconds
    osdTimeoutRef.current = window.setTimeout(() => {
      setOsdVisible(false);
    }, 3000);
  }, []);

  const triggerVolumeOSD = useCallback(() => {
    setVolumeOsdVisible(true);
    if (volumeOsdTimeoutRef.current) window.clearTimeout(volumeOsdTimeoutRef.current);
    
    // Hide Volume OSD after 3 seconds
    volumeOsdTimeoutRef.current = window.setTimeout(() => {
      setVolumeOsdVisible(false);
    }, 3000);
  }, []);

  const changeChannel = useCallback((direction: 'up' | 'down') => {
    setIsChanging(true);
    triggerOSD();

    if (changeTimeoutRef.current) window.clearTimeout(changeTimeoutRef.current);

    setChannel((prev) => {
      const currentIndex = AVAILABLE_CHANNELS.indexOf(prev);
      if (direction === 'up') {
        const nextIndex = (currentIndex + 1) % AVAILABLE_CHANNELS.length;
        return AVAILABLE_CHANNELS[nextIndex];
      } else {
        const prevIndex = (currentIndex - 1 + AVAILABLE_CHANNELS.length) % AVAILABLE_CHANNELS.length;
        return AVAILABLE_CHANNELS[prevIndex];
      }
    });

    // Simulate a brief signal loss/black screen when switching digital channels
    changeTimeoutRef.current = window.setTimeout(() => {
      setIsChanging(false);
    }, 250); 
  }, [triggerOSD]);

  const changeVolume = useCallback((direction: 'up' | 'down') => {
    setVolume((prev) => {
      let newVolume = direction === 'up' ? prev + 5 : prev - 5;
      if (newVolume > 100) newVolume = 100;
      if (newVolume < 0) newVolume = 0;
      return newVolume;
    });
    triggerVolumeOSD();
  }, [triggerVolumeOSD]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeChannel('up');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeChannel('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume('down');
      } else if (e.key === '1') {
        e.preventDefault();
        setShowNotification(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeChannel, changeVolume]);

  // Initial OSD on power up
  useEffect(() => {
    triggerOSD();
  }, [triggerOSD]);

  // Helper to render the correct volume icon (size reduced to 14)
  const renderVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-white mb-1" size={14} />;
    if (volume < 50) return <Volume1 className="text-white mb-1" size={14} />;
    return <Volume2 className="text-white mb-1" size={14} />;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl gap-8">
      
      {/* Instructions */}
      <div className="text-neutral-400 text-sm md:text-base flex flex-wrap items-center justify-center gap-4 bg-neutral-800/50 px-6 py-3 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <MonitorPlay size={18} className="text-neutral-300" />
          <span>Use <kbd className="bg-neutral-700 px-2 py-1 text-white font-mono text-xs rounded">←</kbd> <kbd className="bg-neutral-700 px-2 py-1 text-white font-mono text-xs rounded">→</kbd> for channels</span>
        </div>
        <div className="w-px h-4 bg-neutral-600 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <span><kbd className="bg-neutral-700 px-2 py-1 text-white font-mono text-xs rounded">↑</kbd> <kbd className="bg-neutral-700 px-2 py-1 text-white font-mono text-xs rounded">↓</kbd> for volume</span>
        </div>
        <div className="w-px h-4 bg-neutral-600 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <span>Press <kbd className="bg-neutral-700 px-2 py-1 text-white font-mono text-xs rounded">1</kbd> for alert</span>
        </div>
      </div>

      {/* TV Set Container - Thin Bezel, No Rounded Corners */}
      <div className="relative w-full bg-neutral-900 p-1 md:p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-neutral-700">
        
        {/* TV Bezel */}
        <div className="relative bg-black overflow-hidden shadow-inner border-2 border-neutral-950">
          
          {/* 16:9 Screen Area */}
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            
            {/* Channel Content */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                isChanging ? 'opacity-0' : 'opacity-100'
              } ${STYLE_MAPPING[channel]}`}
            >
              {YOUTUBE_MAPPING[channel] ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_MAPPING[channel]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playlist=${YOUTUBE_MAPPING[channel]}&loop=1`}
                  title={NAME_MAPPING[channel]}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                ></iframe>
              ) : (
                <div className="flex flex-col items-center">
                  <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white/90 tracking-tighter drop-shadow-2xl select-none">
                    {NAME_MAPPING[channel]}
                  </h1>
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
                </div>
              )}
            </div>

            {/* Static Noise Overlay (always slightly visible for realism, more visible during change) */}
            <div className={`absolute inset-0 static-noise ${isChanging ? 'opacity-40' : 'opacity-5'}`}></div>
            
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>

            {/* Channel OSD (On-Screen Display) */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 left-8 transition-opacity duration-300 pointer-events-none ${
                osdVisible && !isChanging ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-black/60 rounded-r-xl rounded-l-sm px-6 py-4 shadow-lg flex flex-col border-l-4 border-green-500">
                <span className="text-white font-mono text-4xl md:text-5xl font-bold select-none">
                  CH {channel.toString().padStart(2, '0')}
                </span>
                <span className="text-white/80 text-lg md:text-xl font-medium select-none mt-1">
                  {NAME_MAPPING[channel]}
                </span>
              </div>
            </div>

            {/* Volume OSD */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 right-8 transition-opacity duration-300 pointer-events-none ${
                volumeOsdVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-black/60 rounded-l-xl rounded-r-sm px-3 py-3 shadow-lg flex flex-col items-center border-r-4 border-blue-500 min-w-[50px]">
                {renderVolumeIcon()}
                <span className="text-white font-mono text-lg font-bold select-none">
                  {volume}
                </span>
                {/* Vertical Volume Indicator */}
                <div className="h-20 w-1.5 bg-neutral-700 mt-2 rounded-full overflow-hidden flex flex-col justify-end">
                  <div 
                    className="w-full bg-blue-500 transition-all duration-200 ease-out" 
                    style={{ height: `${volume}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Emergency Notification */}
            {showNotification && (
              <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-lg p-5 shadow-2xl max-w-md flex gap-4 items-start">
                  <div className="text-red-500 mt-0.5 shrink-0 animate-pulse">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-white text-base leading-relaxed font-medium">
                      이상 동작이 감지되었습니다. 괜찮으신가요? "확인"버튼을 누르시거나 "응"이라고 답해주세요
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowNotification(false)}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors active:scale-95 shadow-lg"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Screen Glare/Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
