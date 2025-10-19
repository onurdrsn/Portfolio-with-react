import { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Trophy, HelpCircle } from 'lucide-react';

// Ana Oyun Bileşeni
export default function WhackAMole() {
  // Oyun durumu state'leri
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('normal');
  const [muted, setMuted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gameStats, setGameStats] = useState({
    normalHits: 0,
    bonusHits: 0,
    misses: 0,
    accuracy: 0,
  });
  
  // Oyun ayarları
  const difficultySettings = {
    easy: { interval: 1200, duration: 1200, bonusChance: 0.1 },
    normal: { interval: 900, duration: 900, bonusChance: 0.15 },
    hard: { interval: 600, duration: 600, bonusChance: 0.2 },
    extreme: { interval: 400, duration: 400, bonusChance: 0.25 },
  };
  
  // Delikler ve aktif delikler için state
  const holes = Array(9).fill(null).map((_, i) => i);
  const [activeHoles, setActiveHoles] = useState([]);
  const [bonusHoles, setBonusHoles] = useState([]);
  const [hitAnimations, setHitAnimations] = useState({});
  
  // Referanslar
  const gameAreaRef = useRef(null);
  const timerRef = useRef(null);
  const moleTimerRef = useRef(null);
  const popSoundRef = useRef(null);
  const hitSoundRef = useRef(null);
  const bonusSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const endSoundRef = useRef(null);
  
  // Oyunu başlat
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setActiveHoles([]);
    setBonusHoles([]);
    setHitAnimations({});
    setGameStats({
      normalHits: 0,
      bonusHits: 0,
      misses: 0,
      accuracy: 0,
    });
    
    // Müziği başlat
    if (musicOn && !muted && bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play();
    }
  };
  
  // Oyunu bitir
  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
    }
    
    // İstatistikleri güncelle
    const total = gameStats.normalHits + gameStats.bonusHits + gameStats.misses;
    const accuracy = total > 0 ? Math.round(((gameStats.normalHits + gameStats.bonusHits) / total) * 100) : 0;
    
    setGameStats(prev => ({
      ...prev,
      accuracy
    }));
    
    setShowStats(true);
    
    // Müziği durdur ve bitiş sesini oynat
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    
    if (!muted && endSoundRef.current) {
      endSoundRef.current.currentTime = 0;
      endSoundRef.current.play();
    }
    
    // Zamanlayıcıları temizle
    clearInterval(timerRef.current);
    clearInterval(moleTimerRef.current);
  };
  
  // Rastgele bir deliğe köstebek ekle
  const addRandomMole = () => {
    const { bonusChance } = difficultySettings[difficulty];
    
    // Mevcut köstebekleri filtrele
    const availableHoles = holes.filter(
      hole => !activeHoles.includes(hole) && !bonusHoles.includes(hole)
    );
    
    if (availableHoles.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableHoles.length);
      const newHole = availableHoles[randomIndex];
      
      // Bonus köstebek eklemek için şans kontrolü
      if (Math.random() < bonusChance) {
        setBonusHoles(prev => [...prev, newHole]);
        
        // Bonus süresinden sonra yok et
        setTimeout(() => {
          setBonusHoles(prev => prev.filter(hole => hole !== newHole));
        }, difficultySettings[difficulty].duration * 1.2);
      } else {
        setActiveHoles(prev => [...prev, newHole]);
        
        // Süre sonunda yok et
        setTimeout(() => {
          setActiveHoles(prev => prev.filter(hole => hole !== newHole));
        }, difficultySettings[difficulty].duration);
      }
    }
  };
  
  // Köstebeğe vurma işlemi
  const whackMole = (index, isBonus) => {
    if (!isPlaying) return;
    
    if (activeHoles.includes(index) || (isBonus && bonusHoles.includes(index))) {
      // Animasyon başlat
      setHitAnimations(prev => ({...prev, [index]: true}));
      
      // Animasyonu kaldır
      setTimeout(() => {
        setHitAnimations(prev => {
          const newAnimations = {...prev};
          delete newAnimations[index];
          return newAnimations;
        });
      }, 300);
      
      if (isBonus) {
        // Bonus köstebeğe vurma
        setBonusHoles(prev => prev.filter(hole => hole !== index));
        setScore(prev => prev + 5);
        setGameStats(prev => ({...prev, bonusHits: prev.bonusHits + 1}));
        
        // Bonus ses efekti
        if (!muted && bonusSoundRef.current) {
          bonusSoundRef.current.currentTime = 0;
          bonusSoundRef.current.play();
        }
      } else {
        // Normal köstebeğe vurma
        setActiveHoles(prev => prev.filter(hole => hole !== index));
        setScore(prev => prev + 1);
        setGameStats(prev => ({...prev, normalHits: prev.normalHits + 1}));
        
        // Vurma ses efekti
        if (!muted && hitSoundRef.current) {
          hitSoundRef.current.currentTime = 0;
          hitSoundRef.current.play();
        }
      }
    } else {
      // Boşa vurma (ıskalama)
      setGameStats(prev => ({...prev, misses: prev.misses + 1}));
    }
  };
  
  // Zamanlayıcıyı çalıştır
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Oyun bitti
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);
  
  // Köstebek zamanlayıcısını çalıştır
  useEffect(() => {
    if (isPlaying) {
      // İlk köstebeği hemen ekle
      addRandomMole();
      
      // Zorluk seviyesine göre köstebek intervali ayarla
      moleTimerRef.current = setInterval(addRandomMole, difficultySettings[difficulty].interval);
    }
    
    return () => clearInterval(moleTimerRef.current);
  }, [isPlaying, difficulty]);
  
  // Ses durumunu yönet
  const toggleMute = () => {
    setMuted(!muted);
    if (!muted) {
      if (bgMusicRef.current) bgMusicRef.current.pause();
    } else {
      if (musicOn && isPlaying && bgMusicRef.current) bgMusicRef.current.play();
    }
  };
  
  // Müzik durumunu yönet
  const toggleMusic = () => {
    setMusicOn(!musicOn);
    if (!musicOn && isPlaying && !muted && bgMusicRef.current) {
      bgMusicRef.current.play();
    } else if (musicOn && bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-green-800 to-green-600 text-white p-4">
      {/* Ses dosyaları */}
      <audio ref={popSoundRef} src="https://assets.codepen.io/21542/pop.mp3" preload="auto"></audio>
      <audio ref={hitSoundRef} src="https://assets.codepen.io/21542/squish.mp3" preload="auto"></audio>
      <audio ref={bonusSoundRef} src="https://assets.codepen.io/21542/bonus.mp3" preload="auto"></audio>
      <audio ref={bgMusicRef} src="https://assets.codepen.io/21542/bgm.mp3" preload="auto" loop></audio>
      <audio ref={endSoundRef} src="https://assets.codepen.io/21542/gameover.mp3" preload="auto"></audio>
      
      {/* Oyun başlığı */}
      <h1 className="text-4xl font-bold mb-4 text-yellow-300 drop-shadow-lg">Whack-a-Mole</h1>
      
      {/* Kontroller ve puan tablosu */}
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={toggleMute} 
            className="bg-blue-600 p-2 rounded-full hover:bg-blue-700"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={toggleMusic} 
            className={`p-2 rounded-full ${musicOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Music size={20} />
          </button>
          <button 
            onClick={() => setShowHelp(true)} 
            className="bg-blue-600 p-2 rounded-full hover:bg-blue-700"
          >
            <HelpCircle size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Trophy className="text-yellow-400" size={24} />
          <span className="font-bold">{highScore}</span>
        </div>
      </div>
      
      {/* Oyun durumu göstergeleri */}
      <div className="flex justify-between w-full max-w-md mb-4">
        <div className="text-xl font-bold">
          Puan: {score}
        </div>
        <div className="text-xl font-bold">
          Süre: {timeLeft}
        </div>
      </div>
      
      {/* Zorluk seviyesi seçimi */}
      {!isPlaying && (
        <div className="flex flex-col items-center mb-4 w-full max-w-md">
          <h2 className="text-lg mb-2">Zorluk Seviyesi</h2>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button 
              onClick={() => setDifficulty('easy')} 
              className={`py-2 px-4 rounded ${difficulty === 'easy' ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              Kolay
            </button>
            <button 
              onClick={() => setDifficulty('normal')} 
              className={`py-2 px-4 rounded ${difficulty === 'normal' ? 'bg-yellow-500' : 'bg-gray-600'}`}
            >
              Normal
            </button>
            <button 
              onClick={() => setDifficulty('hard')} 
              className={`py-2 px-4 rounded ${difficulty === 'hard' ? 'bg-orange-500' : 'bg-gray-600'}`}
            >
              Zor
            </button>
            <button 
              onClick={() => setDifficulty('extreme')} 
              className={`py-2 px-4 rounded ${difficulty === 'extreme' ? 'bg-red-500' : 'bg-gray-600'}`}
            >
              Ekstrem
            </button>
          </div>
        </div>
      )}
      
      {/* Oyun alanı */}
      <div 
        ref={gameAreaRef}
        className="grid grid-cols-3 gap-4 w-full max-w-md mb-6"
      >
        {holes.map((_, index) => (
          <div 
            key={index} 
            className="relative aspect-square bg-yellow-800 rounded-full overflow-hidden border-4 border-yellow-900"
          >
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Normal köstebek */}
            {activeHoles.includes(index) && (
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-transform duration-200 cursor-pointer ${hitAnimations[index] ? 'translate-y-full' : 'transform-none animate-mole-appear'}`}
                onClick={() => whackMole(index, false)}
              >
                <div className="relative w-full pb-[100%]">
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div className="w-4/5 h-4/5 bg-gray-700 rounded-t-full flex flex-col items-center">
                      {/* Köstebek yüzü */}
                      <div className="w-full h-3/5 bg-gray-700 rounded-t-full relative">
                        <div className="absolute w-1/4 aspect-square bg-black rounded-full left-1/4 top-1/4"></div>
                        <div className="absolute w-1/4 aspect-square bg-black rounded-full right-1/4 top-1/4"></div>
                        <div className="absolute w-1/3 h-1/5 bg-pink-300 rounded-full left-1/3 bottom-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bonus köstebek */}
            {bonusHoles.includes(index) && (
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-transform duration-200 cursor-pointer ${hitAnimations[index] ? 'translate-y-full' : 'transform-none animate-mole-appear animate-pulse'}`}
                onClick={() => whackMole(index, true)}
              >
                <div className="relative w-full pb-[100%]">
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div className="w-4/5 h-4/5 bg-yellow-500 rounded-t-full flex flex-col items-center">
                      {/* Bonus köstebek yüzü */}
                      <div className="w-full h-3/5 bg-yellow-500 rounded-t-full relative">
                        <div className="absolute w-1/4 aspect-square bg-black rounded-full left-1/4 top-1/4"></div>
                        <div className="absolute w-1/4 aspect-square bg-black rounded-full right-1/4 top-1/4"></div>
                        <div className="absolute w-1/3 h-1/5 bg-red-500 rounded-full left-1/3 bottom-1/4"></div>
                        <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-yellow-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Başlat/Yeniden Oyna butonu */}
      {!isPlaying && (
        <button 
          onClick={startGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transform transition hover:scale-105"
        >
          {score > 0 ? 'Yeniden Oyna' : 'Oyunu Başlat'}
        </button>
      )}
      
      {/* Yardım modali */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Deliklerden çıkan köstebeklere tıklayarak onları vurun</li>
              <li>Normal köstebek = 1 puan</li>
              <li>Altın köstebek = 5 puan (bonus!)</li>
              <li>Daha yüksek zorluk seviyelerinde köstebekler daha hızlı hareket eder</li>
              <li>Süre dolmadan önce olabildiğince çok köstebek vurmaya çalışın</li>
            </ul>
            <button 
              onClick={() => setShowHelp(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
      
      {/* Oyun sonu istatistikleri */}
      {showStats && !isPlaying && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Oyun Bitti!</h2>
            <div className="space-y-2 mb-4">
              <p className="text-xl font-bold">Toplam Puan: {score}</p>
              <p>En Yüksek Puan: {highScore}</p>
              <div className="h-px bg-gray-300 my-3"></div>
              <p>Normal Vuruş: {gameStats.normalHits}</p>
              <p>Bonus Vuruş: {gameStats.bonusHits}</p>
              <p>Iskalama: {gameStats.misses}</p>
              <p>İsabet Oranı: {gameStats.accuracy}%</p>
            </div>
            <button 
              onClick={() => {
                setShowStats(false);
                startGame();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-2"
            >
              Yeniden Oyna
            </button>
            <button 
              onClick={() => setShowStats(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes moleAppear {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-mole-appear {
          animation: moleAppear 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}