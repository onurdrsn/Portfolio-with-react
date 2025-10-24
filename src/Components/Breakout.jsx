import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, Heart, Zap, Target, Crown, Shield, Flame } from 'lucide-react';

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, victory
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({});
  const [particles, setParticles] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [bricksDestroyed, setBricksDestroyed] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 6;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 75;
  const BRICK_HEIGHT = 25;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 35;

  const [paddle, setPaddle] = useState({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8
  });

  const [balls, setBalls] = useState([{
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    dx: 4,
    dy: -4,
    radius: BALL_RADIUS,
    stuck: true
  }]);

  const [bricks, setBricks] = useState([]);

  const BRICK_COLORS = [
    { color: '#ef4444', points: 70, hits: 3 },
    { color: '#f97316', points: 60, hits: 2 },
    { color: '#fbbf24', points: 50, hits: 2 },
    { color: '#84cc16', points: 40, hits: 1 },
    { color: '#06b6d4', points: 30, hits: 1 },
    { color: '#8b5cf6', points: 20, hits: 1 }
  ];

  const POWER_UP_TYPES = {
    expandPaddle: { icon: '📏', color: '#10b981', duration: 10000 },
    multiball: { icon: '⚾', color: '#3b82f6', duration: 0 },
    laser: { icon: '🔫', color: '#ef4444', duration: 15000 },
    shield: { icon: '🛡️', color: '#8b5cf6', duration: 20000 },
    slowBall: { icon: '🐌', color: '#06b6d4', duration: 8000 },
    fireball: { icon: '🔥', color: '#f97316', duration: 12000 }
  };

  const initBricks = useCallback(() => {
    const newBricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brickInfo = BRICK_COLORS[row];
        newBricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: brickInfo.color,
          points: brickInfo.points * level,
          hits: brickInfo.hits,
          maxHits: brickInfo.hits,
          visible: true
        });
      }
    }
    setBricks(newBricks);
  }, [level]);

  const createParticles = (x, y, color, count = 15) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        life: 60,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnPowerUp = (x, y) => {
    if (Math.random() < 0.3) {
      const types = Object.keys(POWER_UP_TYPES);
      const type = types[Math.floor(Math.random() * types.length)];
      setPowerUps(prev => [...prev, {
        id: Date.now(),
        type,
        x,
        y,
        vy: 2,
        size: 20
      }]);
    }
  };

  const activatePowerUp = (type) => {
    switch(type) {
      case 'expandPaddle':
        setPaddle(prev => ({ ...prev, width: 150 }));
        break;
      case 'multiball':
        setBalls(prev => {
          const newBalls = [];
          prev.forEach(ball => {
            if (!ball.stuck) {
              newBalls.push(
                { ...ball, dx: ball.dx * 0.8, dy: ball.dy * 0.8 },
                { ...ball, dx: -ball.dx * 0.8, dy: ball.dy * 0.8 },
                { ...ball, dx: ball.dx * 1.2, dy: -ball.dy * 0.8 }
              );
            } else {
              newBalls.push(ball);
            }
          });
          return newBalls.length > prev.length ? newBalls : prev;
        });
        break;
      case 'laser':
      case 'shield':
      case 'slowBall':
      case 'fireball':
        // These will be handled in the game loop
        break;
    }

    const powerUpInfo = POWER_UP_TYPES[type];
    if (powerUpInfo.duration > 0) {
      setActivePowerUps(prev => ({ ...prev, [type]: Date.now() + powerUpInfo.duration }));
      setTimeout(() => {
        setActivePowerUps(prev => {
          const newPowerUps = { ...prev };
          delete newPowerUps[type];
          return newPowerUps;
        });
        if (type === 'expandPaddle') {
          setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH }));
        }
      }, powerUpInfo.duration);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    setPaddle(prev => ({
      ...prev,
      x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, mouseX - prev.width / 2))
    }));
  }, [gameState]);

  const handleClick = () => {
    if (gameState === 'playing') {
      setBalls(prev => prev.map(ball => 
        ball.stuck ? { ...ball, stuck: false } : ball
      ));

      if (activePowerUps.laser) {
        // Fire laser
        const laser = {
          id: Date.now(),
          x: paddle.x + paddle.width / 2,
          y: paddle.y,
          width: 4,
          height: 20,
          vy: -10
        };
        // Handle laser collision with bricks
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setBricksDestroyed(0);
    setPowerUps([]);
    setActivePowerUps({});
    setParticles([]);
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 40,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 8
    });
    setBalls([{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: 4,
      dy: -4,
      radius: BALL_RADIUS,
      stuck: true
    }]);
    initBricks();
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setBalls([{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: 4 + level * 0.5,
      dy: -4 - level * 0.5,
      radius: BALL_RADIUS,
      stuck: true
    }]);
    setPowerUps([]);
    setActivePowerUps({});
  };

  useEffect(() => {
    initBricks();
  }, [level, initBricks]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background pattern
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw bricks
    let visibleBricks = 0;
    bricks.forEach(brick => {
      if (brick.visible) {
        visibleBricks++;
        const opacity = brick.hits / brick.maxHits;
        ctx.fillStyle = brick.color;
        ctx.globalAlpha = opacity;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Brick border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        
        // Hit indicator
        if (brick.hits < brick.maxHits) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(brick.hits, brick.x + brick.width / 2, brick.y + brick.height / 2);
        }
        ctx.globalAlpha = 1;
      }
    });

    // Check for level completion
    if (visibleBricks === 0 && bricks.length > 0) {
      setGameState('victory');
      return;
    }

    // Draw paddle
    const paddleGradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    paddleGradient.addColorStop(0, '#06b6d4');
    paddleGradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Paddle glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06b6d4';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;

    // Active power-ups indicator on paddle
    if (activePowerUps.laser) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(paddle.x, paddle.y - 5, paddle.width, 3);
    }
    if (activePowerUps.shield) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(paddle.x - 5, paddle.y - 5, paddle.width + 10, paddle.height + 10);
    }

    // Update balls
    setBalls(prev => {
      const updatedBalls = prev.map(ball => {
        if (ball.stuck) {
          return {
            ...ball,
            x: paddle.x + paddle.width / 2,
            y: paddle.y - ball.radius - 2
          };
        }

        let newX = ball.x + ball.dx;
        let newY = ball.y + ball.dy;
        let newDx = ball.dx;
        let newDy = ball.dy;

        // Slow ball power-up
        const speedMultiplier = activePowerUps.slowBall ? 0.6 : 1;
        newX = ball.x + ball.dx * speedMultiplier;
        newY = ball.y + ball.dy * speedMultiplier;

        // Wall collision
        if (newX + ball.radius > CANVAS_WIDTH || newX - ball.radius < 0) {
          newDx = -newDx;
          createParticles(newX, newY, '#06b6d4', 5);
        }
        if (newY - ball.radius < 0) {
          newDy = -newDy;
          createParticles(newX, newY, '#06b6d4', 5);
        }

        // Paddle collision
        if (
          newY + ball.radius > paddle.y &&
          newY - ball.radius < paddle.y + paddle.height &&
          newX > paddle.x &&
          newX < paddle.x + paddle.width
        ) {
          const hitPos = (newX - paddle.x) / paddle.width;
          newDx = (hitPos - 0.5) * 10;
          newDy = -Math.abs(newDy);
          createParticles(newX, paddle.y, '#06b6d4', 10);
        }

        // Bottom collision (lose life)
        if (newY + ball.radius > CANVAS_HEIGHT) {
          if (!activePowerUps.shield) {
            return null; // Remove ball
          } else {
            newDy = -Math.abs(newDy);
            createParticles(newX, CANVAS_HEIGHT, '#8b5cf6', 15);
          }
        }

        // Brick collision
        setBricks(prevBricks => {
          const updatedBricks = [...prevBricks];
          let hit = false;

          for (let i = 0; i < updatedBricks.length; i++) {
            const brick = updatedBricks[i];
            if (!brick.visible) continue;

            if (
              newX + ball.radius > brick.x &&
              newX - ball.radius < brick.x + brick.width &&
              newY + ball.radius > brick.y &&
              newY - ball.radius < brick.y + brick.height
            ) {
              hit = true;
              
              if (activePowerUps.fireball) {
                updatedBricks[i] = { ...brick, visible: false };
              } else {
                updatedBricks[i] = { ...brick, hits: brick.hits - 1 };
                if (updatedBricks[i].hits <= 0) {
                  updatedBricks[i].visible = false;
                }
              }

              if (!updatedBricks[i].visible) {
                setScore(s => s + brick.points);
                setCombo(c => {
                  const newCombo = c + 1;
                  setMaxCombo(m => Math.max(m, newCombo));
                  return newCombo;
                });
                setBricksDestroyed(b => b + 1);
                createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 20);
                spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
              }

              // Determine collision side
              const ballCenterX = ball.x + ball.dx;
              const ballCenterY = ball.y + ball.dy;
              const brickCenterX = brick.x + brick.width / 2;
              const brickCenterY = brick.y + brick.height / 2;

              const diffX = Math.abs(ballCenterX - brickCenterX);
              const diffY = Math.abs(ballCenterY - brickCenterY);

              if (diffX > diffY) {
                newDx = -newDx;
              } else {
                newDy = -newDy;
              }

              break;
            }
          }

          if (!hit) {
            setCombo(0);
          }

          return updatedBricks;
        });

        return {
          ...ball,
          x: newX,
          y: newY,
          dx: newDx,
          dy: newDy
        };
      }).filter(ball => ball !== null);

      // Check if all balls are lost
      if (updatedBalls.length === 0) {
        if (!activePowerUps.shield) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              setHighScore(h => Math.max(h, score));
            } else {
              // Reset ball
              setTimeout(() => {
                setBalls([{
                  x: CANVAS_WIDTH / 2,
                  y: CANVAS_HEIGHT - 60,
                  dx: 4 + level * 0.5,
                  dy: -4 - level * 0.5,
                  radius: BALL_RADIUS,
                  stuck: true
                }]);
              }, 500);
            }
            return newLives;
          });
        }
      }

      return updatedBalls.length > 0 ? updatedBalls : prev;
    });

    // Update and draw power-ups
    setPowerUps(prev => {
      const updated = prev.map(powerUp => {
        const newY = powerUp.y + powerUp.vy;

        // Check paddle collision
        if (
          newY + powerUp.size > paddle.y &&
          newY < paddle.y + paddle.height &&
          powerUp.x + powerUp.size > paddle.x &&
          powerUp.x < paddle.x + paddle.width
        ) {
          activatePowerUp(powerUp.type);
          createParticles(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, POWER_UP_TYPES[powerUp.type].color, 15);
          return null;
        }

        // Remove if out of bounds
        if (newY > CANVAS_HEIGHT) {
          return null;
        }

        // Draw power-up
        ctx.fillStyle = POWER_UP_TYPES[powerUp.type].color;
        ctx.fillRect(powerUp.x, newY, powerUp.size, powerUp.size);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(POWER_UP_TYPES[powerUp.type].icon, powerUp.x + powerUp.size / 2, newY + powerUp.size / 2);

        return { ...powerUp, y: newY };
      }).filter(p => p !== null);

      return updated;
    });

    // Draw balls
    balls.forEach(ball => {
      const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
      if (activePowerUps.fireball) {
        ballGradient.addColorStop(0, '#fbbf24');
        ballGradient.addColorStop(1, '#ef4444');
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
      } else {
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(1, '#06b6d4');
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06b6d4';
      }
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball trail
      ctx.fillStyle = activePowerUps.fireball ? '#f97316' : '#06b6d4';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Update and draw particles
    setParticles(prev => {
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.2,
        life: particle.life - 1
      })).filter(p => p.life > 0);

      updated.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 60;
        ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        ctx.globalAlpha = 1;
      });

      return updated;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, paddle, bricks, activePowerUps, level, score]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Target className="text-cyan-400 animate-pulse" size={48} />
            Breakout Arkanoid
            <Flame className="text-orange-400 animate-pulse" size={48} />
          </h1>
          <p className="text-slate-300 text-lg">Tuğlaları kır, topu düşürme!</p>
        </div>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-cyan-500/30 text-center">
            <Target className="text-cyan-400 mx-auto mb-6 animate-bounce" size={80} />
            <h2 className="text-4xl font-bold text-white mb-4">Breakout</h2>
            <p className="text-slate-300 text-lg mb-8">
              Raketinizi hareket ettirin ve tüm tuğlaları kırın!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-white font-bold mb-2">Hedef</h3>
                <p className="text-sm text-gray-300">Tüm tuğlaları kırın</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-3xl mb-2">💫</div>
                <h3 className="text-white font-bold mb-2">Güçler</h3>
                <p className="text-sm text-gray-300">Özel yetenekler toplayın</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-white font-bold mb-2">Seviyeler</h3>
                <p className="text-sm text-gray-300">Zorluk giderek artar</p>
              </div>
            </div>

            {highScore > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <Trophy className="text-yellow-400 inline-block mr-2" size={24} />
                <span className="text-white font-bold">En Yüksek Skor: {highScore}</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Play size={28} />
              Oyuna Başla
            </button>

            <div className="mt-8 text-left max-w-md mx-auto">
              <h3 className="text-white font-bold mb-3">💡 Güçlendirmeler:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>📏 Geniş Raket</div>
                <div>⚾ Çoklu Top</div>
                <div>🔫 Lazer Silahı</div>
                <div>🛡️ Kalkan</div>
                <div>🐌 Yavaş Top</div>
                <div>🔥 Ateş Topu</div>
              </div>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Skor</p>
                  <p className="text-white font-bold text-xl">{score}</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-red-500/30 flex items-center gap-2">
                <Heart className="text-red-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Can</p>
                  <p className="text-white font-bold text-xl">{lives}</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-purple-500/30 flex items-center gap-2">
                <Crown className="text-purple-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Seviye</p>
                  <p className="text-white font-bold text-xl">{level}</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-orange-500/30 flex items-center gap-2">
                <Zap className="text-orange-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Combo</p>
                  <p className="text-white font-bold text-xl">{combo}</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-green-500/30 flex items-center gap-2">
                <Target className="text-green-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">Kırılan</p>
                  <p className="text-white font-bold text-xl">{bricksDestroyed}</p>
                </div>
              </div>
            </div>

            {/* Active Power-ups */}
            {Object.keys(activePowerUps).length > 0 && (
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center gap-3 flex-wrap">
                  <Shield className="text-purple-400" size={20} />
                  <span className="text-white font-medium">Aktif Güçler:</span>
                  {Object.entries(activePowerUps).map(([type, endTime]) => (
                    <div key={type} className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                      <span>{POWER_UP_TYPES[type].icon}</span>
                      <span className="text-xs text-white">
                        {Math.ceil((endTime - Date.now()) / 1000)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                className="w-full border-2 border-cyan-500/30 rounded-lg cursor-none"
              />
              
              <div className="mt-3 flex justify-center gap-3">
                <button
                  onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-2 text-white"
                >
                  {gameState === 'playing' ? <Pause size={20} /> : <Play size={20} />}
                  {gameState === 'playing' ? 'Duraklat' : 'Devam'}
                </button>
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-2 text-white"
                >
                  <RotateCcw size={20} />
                  Yeniden Başla
                </button>
              </div>
            </div>

            {gameState === 'paused' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <Pause className="text-yellow-400 inline-block mr-2" size={24} />
                <span className="text-white font-bold">Oyun Duraklatıldı</span>
              </div>
            )}
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-red-500/30 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-4xl font-bold text-white mb-4">Oyun Bitti!</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Final Skoru</p>
                <p className="text-cyan-400 font-bold text-3xl">{score}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Ulaşılan Seviye</p>
                <p className="text-purple-400 font-bold text-3xl">{level}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Max Combo</p>
                <p className="text-orange-400 font-bold text-3xl">{maxCombo}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Kırılan Tuğla</p>
                <p className="text-green-400 font-bold text-3xl">{bricksDestroyed}</p>
              </div>
            </div>

            {score > highScore && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <Trophy className="text-yellow-400 inline-block mr-2" size={32} />
                <span className="text-white font-bold text-xl">Yeni Rekor!</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <RotateCcw size={28} />
              Tekrar Oyna
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'victory' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-green-500/30 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-white mb-4">Seviye Tamamlandı!</h2>
            
            <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg p-6 mb-8">
              <p className="text-white text-2xl mb-2">Seviye {level} ✓</p>
              <p className="text-cyan-400 font-bold text-4xl mb-2">{score} Puan</p>
              <p className="text-yellow-400">🔥 {maxCombo}x Max Combo</p>
            </div>

            <button
              onClick={() => {
                nextLevel();
                setGameState('playing');
              }}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Crown size={28} />
              Sonraki Seviye
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakoutGame;