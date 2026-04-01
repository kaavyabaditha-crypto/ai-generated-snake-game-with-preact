import React, { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const GAME_SPEED = 100; // ms per tick

const TRACKS = [
  {
    id: 1,
    title: "TRK_01: NEON_NIGHTS.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "TRK_02: CYBER_PULSE.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "TRK_03: DIGI_HORIZON.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Music Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) {
          resetGame();
        } else {
          setIsPaused(p => !p);
        }
        return;
      }

      if (gameOver || isPaused) return;

      setDirection(prevDir => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return prevDir.y === 1 ? prevDir : { x: 0, y: -1 };
          case 'ArrowDown':
          case 's':
          case 'S':
            return prevDir.y === -1 ? prevDir : { x: 0, y: 1 };
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return prevDir.x === 1 ? prevDir : { x: -1, y: 0 };
          case 'ArrowRight':
          case 'd':
          case 'D':
            return prevDir.x === -1 ? prevDir : { x: 1, y: 0 };
          default:
            return prevDir;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Audio play failed:", e);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, isPlaying]);

  const handleTrackEnd = () => {
    playNext();
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono flex flex-col items-center justify-between overflow-hidden relative uppercase">
      <div className="static-noise"></div>
      <div className="scanlines"></div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center border-b-4 border-fuchsia-500 bg-black z-10 tear">
        <h1 className="text-4xl font-bold glitch tracking-widest" data-text="SYS.SNAKE_PROTOCOL">
          SYS.SNAKE_PROTOCOL
        </h1>
        <div className="text-2xl font-bold text-fuchsia-500 bg-cyan-950/50 px-4 py-2 border-2 border-cyan-500 shadow-[4px_4px_0px_#f0f]">
          FRAGMENTS: {score.toString().padStart(4, '0')}
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full relative z-10">
        <div 
          className="relative bg-black border-4 border-cyan-500 shadow-[8px_8px_0px_#f0f] tear"
          style={{ width: GRID_SIZE * 20, height: GRID_SIZE * 20 }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute ${isHead ? 'bg-fuchsia-500 z-10' : 'bg-cyan-500 opacity-80'}`}
                style={{
                  left: segment.x * 20,
                  top: segment.y * 20,
                  width: 20,
                  height: 20,
                  border: '1px solid #000'
                }}
              />
            );
          })}

          {/* Food */}
          <div
            className="absolute bg-white animate-pulse"
            style={{
              left: food.x * 20,
              top: food.y * 20,
              width: 20,
              height: 20,
              boxShadow: '0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #f0f'
            }}
          />

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-fuchsia-500 m-2">
              <h2 className="text-4xl font-bold text-fuchsia-500 glitch mb-4" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
              <p className="text-xl text-cyan-400 mb-6">FRAGMENTS_LOST: {score}</p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-fuchsia-500 text-black font-bold hover:bg-cyan-400 hover:text-black transition-none border-2 border-black shadow-[4px_4px_0px_#0ff] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {">"} EXECUTE_REBOOT
              </button>
            </div>
          )}
          
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
              <h2 className="text-3xl font-bold text-cyan-400 glitch" data-text="SYSTEM_SUSPENDED">SYSTEM_SUSPENDED</h2>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-8 text-fuchsia-500 text-xl tracking-widest bg-black px-4 py-2 border-2 border-fuchsia-500 shadow-[4px_4px_0px_#0ff]">
          [INPUT]: ARROWS/WASD | [INTERRUPT]: SPACE
        </div>
      </main>

      {/* Music Player Footer */}
      <footer className="w-full bg-black border-t-4 border-cyan-500 p-4 z-10 shadow-[0_-8px_0px_rgba(255,0,255,0.3)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Track Info */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className="w-12 h-12 bg-black border-2 border-fuchsia-500 flex items-center justify-center relative overflow-hidden shrink-0">
              {isPlaying && (
                 <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
              )}
              <div className="w-full h-2 bg-fuchsia-500 animate-bounce"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm text-fuchsia-500 font-bold">AUDIO_STREAM.ACTIVE</span>
              <span className="text-lg text-cyan-400 truncate glitch" data-text={TRACKS[currentTrackIndex].title}>{TRACKS[currentTrackIndex].title}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 text-2xl font-bold">
            <button onClick={playPrev} className="text-cyan-500 hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 border border-transparent hover:border-fuchsia-500">
              [{"<<"}]
            </button>
            <button 
              onClick={togglePlay} 
              className="text-black bg-cyan-500 hover:bg-fuchsia-500 px-4 py-1 border-2 border-cyan-400 shadow-[4px_4px_0px_#f0f] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {isPlaying ? "||" : ">"}
            </button>
            <button onClick={playNext} className="text-cyan-500 hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 border border-transparent hover:border-fuchsia-500">
              [{">>"}]
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full md:w-1/3 justify-end text-xl">
            <span className="text-fuchsia-500">VOL:</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-2 bg-black border border-cyan-500 appearance-none cursor-pointer accent-fuchsia-500"
              style={{
                background: `linear-gradient(to right, #f0f ${volume * 100}%, #000 ${volume * 100}%)`
              }}
            />
          </div>
        </div>
        
        <audio 
          ref={audioRef} 
          src={TRACKS[currentTrackIndex].url} 
          onEnded={handleTrackEnd}
          className="hidden"
        />
      </footer>
    </div>
  );
}
