import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MonitorPlay, AlertCircle, Volume2, Volume1, VolumeX, Mic, MicOff, Moon } from 'lucide-react';

// Define only the available channels
const AVAILABLE_CHANNELS = [1, 9, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31];

const YOUTUBE_MAPPING: Record<number, string> = {
  1: 'jfKfPfyJRdk', // Lofi Girl
  9: 'o6-IbLjURyc', // Yonhap News TV
  19: 'M9MRGuPToEk', // TV Chosun
  20: 'P8QordVAUyU', // VOD
  31: 'pQR2ldbwY00', // 트로트 채널
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
  31: '트로트 채널',
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
  31: 'bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950',
};

// Speech Recognition Type Definition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export default function App() {
  const [channel, setChannel] = useState(1);
  const [osdVisible, setOsdVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showSleepNotification, setShowSleepNotification] = useState(false);
  const [brightness, setBrightness] = useState(100);
  
  // Volume state
  const [volume, setVolume] = useState(10);
  const [volumeOsdVisible, setVolumeOsdVisible] = useState(false);

  // Voice Recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);
  
  const osdTimeoutRef = useRef<number | null>(null);
  const changeTimeoutRef = useRef<number | null>(null);
  const volumeOsdTimeoutRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            setTranscript(interimTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);

      // Auto stop after 10 seconds
      if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, 10000);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

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

    changeTimeoutRef.current = window.setTimeout(() => {
      setIsChanging(false);
    }, 250); 
  }, [triggerOSD]);

  const changeVolume = useCallback((direction: 'up' | 'down') => {
    setVolume((prev) => {
      let newVolume = direction === 'up' ? prev + 1 : prev - 1;
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
        startRecording();
      } else if (e.key === '2') {
        e.preventDefault();
        toggleRecording();
      } else if (e.key === '3') {
        e.preventDefault();
        setShowRecommendation(true);
        startRecording();
      } else if (e.key === '4') {
        e.preventDefault();
        setShowSleepNotification(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeChannel, changeVolume, toggleRecording, startRecording]);

  // Handle voice commands for notification
  useEffect(() => {
    if (isRecording && showNotification && (transcript.includes('확인') || transcript.includes('응'))) {
      setShowNotification(false);
      stopRecording();
    }
  }, [transcript, isRecording, showNotification, stopRecording]);

  // Handle voice commands for recommendation
  useEffect(() => {
    if (isRecording && showRecommendation && (transcript.includes('바꿔줘') || transcript.includes('그래') || transcript.includes('응'))) {
      setChannel(31);
      triggerOSD();
      setShowRecommendation(false);
      stopRecording();
    }
  }, [transcript, isRecording, showRecommendation, stopRecording, triggerOSD]);

  useEffect(() => {
    triggerOSD();
  }, [triggerOSD]);

  useEffect(() => {
    const cleanupInterval = () => {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
        volumeIntervalRef.current = null;
      }
    };

    if (showSleepNotification) {
      setBrightness(40);

      const targetVolume = 2; // Target volume is now 2
      const startVolume = Math.floor(volume);

      if (startVolume > targetVolume) {
        const duration = 5000; // Duration is now 5 seconds
        const totalDecrement = startVolume - targetVolume;
        const intervalTime = duration / totalDecrement; // Time per integer step

        cleanupInterval();

        volumeIntervalRef.current = window.setInterval(() => {
          setVolume(prevVolume => {
            if (prevVolume <= targetVolume) {
              cleanupInterval();
              return targetVolume;
            }
            triggerVolumeOSD();
            // Decrement by 1 and ensure it doesn't go past the target
            return Math.max(prevVolume - 1, targetVolume);
          });
        }, intervalTime);
      }
    } else {
      setBrightness(100);
      cleanupInterval();
    }

    return cleanupInterval;
  }, [showSleepNotification, triggerVolumeOSD, volume]);

  const renderVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-white mb-1" size={14} />;
    if (volume < 50) return <Volume1 className="text-white mb-1" size={14} />;
    return <Volume2 className="text-white mb-1" size={14} />;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-8">
      
      {/* TV Set Container */}
      <div className="relative w-full bg-neutral-900 p-1 md:p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-neutral-700">
        <div className="relative bg-black overflow-hidden shadow-inner border-2 border-neutral-950">
          <div 
            className="relative w-full aspect-video bg-black overflow-hidden"
            style={{ 
              filter: `brightness(${brightness}%)`,
              transition: 'filter 5s linear'
            }}
          >
            
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
                </div>
              )}
            </div>

            {/* Recording Dimming Effect */}
            <div 
              className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 pointer-events-none ${
                isRecording ? 'opacity-100' : 'opacity-0'
              }`}
            ></div>

            {/* Recording UI */}
            <div 
              className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-300 ${
                isRecording ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              {transcript && (
                <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
                  <p className="text-white text-lg md:text-xl font-medium animate-pulse">
                    "{transcript}"
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3 bg-red-600 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce">
                <Mic className="text-white" size={20} />
                <span className="text-white font-bold text-sm tracking-wider uppercase">Listening...</span>
              </div>
            </div>

            {/* Static Noise & Scanlines */}
            <div className={`absolute inset-0 static-noise ${isChanging ? 'opacity-40' : 'opacity-5'}`}></div>
            <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>

            {/* Channel OSD */}
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
                <span className="text-white font-mono text-lg font-bold select-none">{volume}</span>
                <div className="h-20 w-1.5 bg-neutral-700 mt-2 rounded-full overflow-hidden flex flex-col justify-end">
                  <div className="w-full bg-blue-500 transition-all duration-200 ease-out" style={{ height: `${volume}%` }}></div>
                </div>
              </div>
            </div>

            {/* Emergency Notification */}
            {showNotification && (
              <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-lg p-5 shadow-2xl max-w-md flex gap-4 items-start">
                  <div className="text-red-500 mt-0.5 shrink-0 animate-pulse"><AlertCircle size={24} /></div>
                  <div className="flex flex-col gap-4">
                    <p className="text-white text-base leading-relaxed font-medium">
                      이상 동작이 감지되었습니다. 괜찮으신가요? "확인"버튼을 누르시거나 "응"이라고 답해주세요
                    </p>
                    <div className="flex justify-end">
                      <button onClick={() => { setShowNotification(false); stopRecording(); }} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors shadow-lg">확인</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation Notification */}
            {showRecommendation && (
              <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-black/80 backdrop-blur-md border border-blue-400/30 rounded-lg p-5 shadow-2xl max-w-sm flex flex-col gap-4">
                  <p className="text-white text-sm md:text-base leading-relaxed font-medium">
                    보고싶은 방송이 없으시면, 좋아하실만한 방송을 틀어드리겠습니다. 미스터트롯 방영중인데 틀어드릴까요?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowRecommendation(false)}
                      className="text-white/60 hover:text-white px-3 py-1 text-sm font-medium transition-colors"
                    >
                      닫기
                    </button>
                    <button 
                      onClick={() => {
                        setChannel(31);
                        triggerOSD();
                        setShowRecommendation(false);
                        stopRecording();
                      }}
                      className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-lg active:scale-95"
                    >
                      시청하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sleep Mode Notification */}
            {showSleepNotification && (
              <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-indigo-950/80 backdrop-blur-md border border-indigo-400/30 rounded-lg p-5 shadow-2xl max-w-sm flex gap-4 items-start">
                  <div className="text-indigo-400 mt-0.5 shrink-0 animate-pulse"><Moon size={24} /></div>
                  <div className="flex flex-col gap-4">
                    <p className="text-white text-base leading-relaxed font-medium">
                      수면 패턴이 감지되어 취침 모드로 전환합니다
                    </p>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setShowSleepNotification(false)} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors shadow-lg active:scale-95"
                      >
                        중지
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Screen Glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
