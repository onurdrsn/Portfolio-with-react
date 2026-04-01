import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Trophy, RotateCcw, Volume2, VolumeX, Star, Award, Crown, Zap } from 'lucide-react';

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bird, setBird] = useState({ y: 250, velocity: 0 });
  const [pipes, setPipes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [ground, setGround] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');
  const [character, setCharacter] = useState('bird');
  const [medals, setMedals] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 150;
  const GRAVITY = 0.35; // Reduced from 0.5 for gentler fall
  const JUMP_STRENGTH = -6.5; // Reduced from -8 for smoother jump
  const PIPE_SPEED = 3;
  const GROUND_HEIGHT = 100;
  const MAX_FALL_SPEED = 8; // Cap fall speed

  const characters = {
    bird: { emoji: '🐦', color: '#fbbf24', name: 'Kuş' },
    plane: { emoji: '✈️', color: '#06b6d4', name: 'Uçak' },
    rocket: { emoji: '🚀', color: '#ef4444', name: 'Roket' },
    bee: { emoji: '🐝', color: '#fbbf24', name: 'Arı' },
    butterfly: { emoji: '🦋', color: '#a855f7', name: 'Kelebek' },
    dragon: { emoji: '🐲', color: '#10b981', name: 'Ejderha' }
  };

  const difficulties = {
    easy: { speed: 2, gap: 180, name: 'Kolay' },
    normal: { speed: 3, gap: 150, name: 'Normal' },
    hard: { speed: 4, gap: 130, name: 'Zor' },
    extreme: { speed: 5, gap: 110, name: 'Ekstrem' }
  };

  const getMedal = (score) => {
    if (score >= 100) return { icon: '👑', name: 'Efsane', color: '#fbbf24' };
    if (score >= 50) return { icon: '🏆', name: 'Altın', color: '#fbbf24' };
    if (score >= 30) return { icon: '🥈', name: 'Gümüş', color: '#94a3b8' };
    if (score >= 10) return { icon: '🥉', name: 'Bronz', color: '#ea580c' };
    return null;
  };

  const createParticles = (x, y, color, count = 15) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        life: 60,
        size: Math.random() * 6 + 3
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setGameStarted(false);
    setBird({ y: CANVAS_HEIGHT / 2 - 50, velocity: 0 });
    setPipes([
      { x: CANVAS_WIDTH + 200, height: 200, passed: false },
      { x: CANVAS_WIDTH + 450, height: 250, passed: false },
      { x: CANVAS_WIDTH + 700, height: 180, passed: false }
    ]);
    setParticles([]);
    setGround(0);
  };

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setGameStarted(true);
      setBird(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
      createParticles(50, bird.y, characters[character].color, 8);
    } else if (gameState === 'menu' || gameState === 'gameOver') {
      startGame();
    }
  }, [gameState, bird.y, character]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [jump]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Update bird
    setBird(prev => {
      // Don't apply gravity until game actually starts
      if (!gameStarted) {
        return prev;
      }

      const newVelocity = Math.min(prev.velocity + GRAVITY, MAX_FALL_SPEED); // Cap fall speed
      const newY = prev.y + newVelocity;

      // Check ground collision
      if (newY + BIRD_SIZE / 2 >= CANVAS_HEIGHT - GROUND_HEIGHT) {
        setGameState('gameOver');
        setHighScore(h => Math.max(h, score));
        createParticles(50, CANVAS_HEIGHT - GROUND_HEIGHT, '#ef4444', 30);
        return prev;
      }

      // Check ceiling collision
      if (newY - BIRD_SIZE / 2 <= 0) {
        return { ...prev, y: BIRD_SIZE / 2, velocity: 0 };
      }

      return { y: newY, velocity: newVelocity };
    });

    // Update pipes
    setPipes(prev => {
      const diffSettings = difficulties[difficulty];
      const speed = diffSettings.speed;

      const updated = prev.map(pipe => {
        const newX = pipe.x - speed;

        // Check collision
        if (
          50 + BIRD_SIZE / 2 > newX &&
          50 - BIRD_SIZE / 2 < newX + PIPE_WIDTH &&
          (bird.y - BIRD_SIZE / 2 < pipe.height ||
            bird.y + BIRD_SIZE / 2 > pipe.height + diffSettings.gap)
        ) {
          setGameState('gameOver');
          setHighScore(h => Math.max(h, score));
          createParticles(50, bird.y, '#ef4444', 30);
        }

        // Check if passed
        if (!pipe.passed && newX + PIPE_WIDTH < 50) {
          setScore(s => s + 1);
          createParticles(50, bird.y, '#10b981', 15);
          return { ...pipe, x: newX, passed: true };
        }

        return { ...pipe, x: newX };
      }).filter(pipe => pipe.x > -PIPE_WIDTH);

      // Add new pipe
      if (updated.length < 3) {
        const lastPipe = updated[updated.length - 1];
        const minHeight = 100;
        const maxHeight = CANVAS_HEIGHT - GROUND_HEIGHT - diffSettings.gap - 100;
        updated.push({
          x: lastPipe.x + 250,
          height: Math.random() * (maxHeight - minHeight) + minHeight,
          passed: false
        });
      }

      return updated;
    });

    // Update ground
    setGround(prev => (prev - difficulties[difficulty].speed) % 50);

    // Update particles
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.3,
        life: p.life - 1
      })).filter(p => p.life > 0)
    );

    // Clear canvas with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#0ea5e9');
    bgGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = ((ground * 0.5) + i * 150) % CANVAS_WIDTH;
      ctx.beginPath();
      ctx.arc(x, 80 + i * 40, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, 80 + i * 40, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, 80 + i * 40, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw pipes
    pipes.forEach(pipe => {
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      pipeGradient.addColorStop(0, '#10b981');
      pipeGradient.addColorStop(0.5, '#059669');
      pipeGradient.addColorStop(1, '#10b981');

      // Top pipe
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.height);
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.height);

      // Top pipe cap
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipe.x - 5, pipe.height - 20, PIPE_WIDTH + 10, 20);
      ctx.strokeRect(pipe.x - 5, pipe.height - 20, PIPE_WIDTH + 10, 20);

      // Bottom pipe
      const bottomY = pipe.height + difficulties[difficulty].gap;
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT - bottomY);
      ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT - bottomY);

      // Bottom pipe cap
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 20);
      ctx.strokeRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 20);
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, '#84cc16');
    groundGradient.addColorStop(1, '#65a30d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    // Ground pattern
    ctx.fillStyle = '#4d7c0f';
    for (let i = 0; i < CANVAS_WIDTH / 50 + 1; i++) {
      const x = (ground + i * 50) % CANVAS_WIDTH;
      ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT, 50, 5);
      ctx.fillRect(x + 10, CANVAS_HEIGHT - GROUND_HEIGHT + 20, 30, 3);
    }

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 60;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw bird
    ctx.save();
    ctx.translate(50, bird.y);

    // Rotate bird based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
    ctx.rotate(rotation);

    // Bird glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = characters[character].color;

    // Draw bird emoji/character
    ctx.font = `${BIRD_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(characters[character].emoji, 0, 0);

    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(score, CANVAS_WIDTH / 2, 70);
    ctx.fillText(score, CANVAS_WIDTH / 2, 70);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, bird, pipes, ground, particles, score, difficulty, character]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-900 to-sky-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🐦</span>
            Flappy Bird
            <span className="text-5xl">🎮</span>
          </h1>
          <p className="text-slate-300 text-lg">Uçmaya devam et, engellere çarpma!</p>
        </div>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-cyan-500/30 text-center">
                <div className="text-8xl mb-6 animate-bounce">🐦</div>
                <h2 className="text-4xl font-bold text-white mb-4">Flappy Bird</h2>
                <p className="text-slate-300 text-lg mb-8">
                  Tıklayarak veya boşluk tuşuyla zıpla!
                </p>

                {highScore > 0 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <Trophy className="text-yellow-400 inline-block mr-2" size={32} />
                    <span className="text-white font-bold text-2xl">En Yüksek: {highScore}</span>
                    {getMedal(highScore) && (
                      <div className="mt-2">
                        <span className="text-3xl">{getMedal(highScore).icon}</span>
                        <span className="text-white ml-2">{getMedal(highScore).name}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={startGame}
                  className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <Play size={28} />
                  Oyuna Başla
                </button>

                <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className="text-white font-bold">Hedef</p>
                    <p className="text-xs text-gray-300">Engelleri geç</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="text-3xl mb-2">⬆️</div>
                    <p className="text-white font-bold">Kontrol</p>
                    <p className="text-xs text-gray-300">Tıkla / Boşluk</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-white font-bold">Madalya</p>
                    <p className="text-xs text-gray-300">Skor 10+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="text-cyan-400" />
                  Zorluk
                </h3>
                <div className="space-y-2">
                  {Object.entries(difficulties).map(([key, diff]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`w-full p-3 rounded-lg transition-all ${difficulty === key
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="text-purple-400" />
                  Karakter Seç
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(characters).map(([key, char]) => (
                    <button
                      key={key}
                      onClick={() => setCharacter(key)}
                      className={`p-3 rounded-lg transition-all ${character === key
                        ? 'bg-purple-500 scale-110'
                        : 'bg-white/10 hover:bg-white/20'
                        }`}
                    >
                      <div className="text-3xl">{char.emoji}</div>
                      <p className="text-xs text-white mt-1">{char.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="text-green-400" />
                  Madalyalar
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-gray-300">🥉 Bronz</span>
                    <span className="text-orange-400 font-bold">10+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-gray-300">🥈 Gümüş</span>
                    <span className="text-gray-400 font-bold">30+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-gray-300">🏆 Altın</span>
                    <span className="text-yellow-400 font-bold">50+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-gray-300">👑 Efsane</span>
                    <span className="text-yellow-400 font-bold">100+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="max-w-md mx-auto">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
              <div className="mb-4 flex justify-between items-center">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-300">Zorluk</p>
                  <p className="text-white font-bold">{difficulties[difficulty].name}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-300">Karakter</p>
                  <p className="text-2xl">{characters[character].emoji}</p>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full border-2 border-cyan-500/30 rounded-lg cursor-pointer"
              />

              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm">Tıklayın veya SPACE tuşuna basın</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-red-500/30 text-center">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-4xl font-bold text-white mb-6">Oyun Bitti!</h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
                  <Trophy className="text-cyan-400 mx-auto mb-3" size={48} />
                  <p className="text-gray-300 text-sm mb-2">Skorunuz</p>
                  <p className="text-white font-bold text-5xl">{score}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                  <Crown className="text-yellow-400 mx-auto mb-3" size={48} />
                  <p className="text-gray-300 text-sm mb-2">En İyi</p>
                  <p className="text-white font-bold text-5xl">{highScore}</p>
                </div>
              </div>

              {/* Medal Display */}
              {getMedal(score) && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-6 border-2 border-yellow-500/50">
                  <div className="text-6xl mb-3 animate-bounce">{getMedal(score).icon}</div>
                  <h3 className="text-white font-bold text-2xl mb-1">
                    {getMedal(score).name} Madalya Kazandınız!
                  </h3>
                  <p className="text-gray-300">Harika bir performans!</p>
                </div>
              )}

              {/* New High Score */}
              {score === highScore && score > 0 && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6 border border-purple-500/50">
                  <Star className="text-purple-400 inline-block mr-2 animate-spin" size={24} />
                  <span className="text-white font-bold text-xl">Yeni Rekor!</span>
                  <Star className="text-purple-400 inline-block ml-2 animate-spin" size={24} />
                </div>
              )}

              {/* Performance Rating */}
              <div className="bg-white/5 rounded-xl p-6 mb-8">
                <h3 className="text-white font-bold mb-4">Performans Değerlendirmesi</h3>
                <div className="space-y-3">
                  {score >= 50 ? (
                    <>
                      <div className="text-5xl mb-2">🌟</div>
                      <p className="text-yellow-400 font-bold text-xl">Muhteşem!</p>
                      <p className="text-gray-300 text-sm">Profesyonel seviyede!</p>
                    </>
                  ) : score >= 30 ? (
                    <>
                      <div className="text-5xl mb-2">⭐</div>
                      <p className="text-green-400 font-bold text-xl">Harika!</p>
                      <p className="text-gray-300 text-sm">Çok iyi gidiyorsunuz!</p>
                    </>
                  ) : score >= 10 ? (
                    <>
                      <div className="text-5xl mb-2">👍</div>
                      <p className="text-blue-400 font-bold text-xl">İyi!</p>
                      <p className="text-gray-300 text-sm">Güzel bir başlangıç!</p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-2">💪</div>
                      <p className="text-purple-400 font-bold text-xl">Devam Edin!</p>
                      <p className="text-gray-300 text-sm">Pratik yapmaya devam!</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <RotateCcw size={24} />
                  Tekrar Oyna
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-lg transition-all flex items-center gap-2"
                >
                  Ana Menü
                </button>
              </div>

              {/* Tips */}
              <div className="mt-8 text-left max-w-md mx-auto">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  💡 İpuçları
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Kısa ve düzenli zıplamalar yapın</p>
                  <p>• Zamanlamaya odaklanın</p>
                  <p>• Boruların ortasından geçmeye çalışın</p>
                  <p>• Sabırlı olun ve panik yapmayın</p>
                  <p>• Kolay modda pratik yapın</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions - Always visible at bottom */}
        {gameState === 'menu' && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Zap className="text-cyan-400" />
                  Nasıl Oynanır?
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>1. Tıklayın veya SPACE tuşuna basın</p>
                  <p>2. Kuş havada kalır</p>
                  <p>3. Yeşil borulara çarpmayın</p>
                  <p>4. Her borudan geçişte +1 puan</p>
                  <p>5. Yere çarparsanız oyun biter</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Star className="text-purple-400" />
                  Zorluk Seviyeleri
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">Kolay:</span>
                    <span className="text-gray-300">Geniş aralık, yavaş</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">Normal:</span>
                    <span className="text-gray-300">Standart oyun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-400">Zor:</span>
                    <span className="text-gray-300">Dar aralık, hızlı</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Ekstrem:</span>
                    <span className="text-gray-300">En zor mod</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Başarılar
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>🥉 10 puan: Bronz Madalya</p>
                  <p>🥈 30 puan: Gümüş Madalya</p>
                  <p>🏆 50 puan: Altın Madalya</p>
                  <p>👑 100 puan: Efsane</p>
                  <p className="text-cyan-400 mt-2">Hedefinizi belirleyin!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sound Toggle */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/10 transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="text-white" size={24} />
            ) : (
              <VolumeX className="text-gray-400" size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;