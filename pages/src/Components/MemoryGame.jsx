import { useState, useEffect, useCallback } from 'react';
import { Clock, Trophy, PlayCircle, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';

// Ana bileşen
export default function MemoryGame() {
  // Oyun durumları
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Kart içeriği
  const cardItems = [
    { id: 1, emoji: "🐶", name: "Köpek" },
    { id: 2, emoji: "🐱", name: "Kedi" },
    { id: 3, emoji: "🐭", name: "Fare" },
    { id: 4, emoji: "🐹", name: "Hamster" },
    { id: 5, emoji: "🐰", name: "Tavşan" },
    { id: 6, emoji: "🦊", name: "Tilki" },
    { id: 7, emoji: "🐻", name: "Ayı" },
    { id: 8, emoji: "🐼", name: "Panda" },
    { id: 9, emoji: "🐨", name: "Koala" },
    { id: 10, emoji: "🦁", name: "Aslan" },
    { id: 11, emoji: "🐯", name: "Kaplan" },
    { id: 12, emoji: "🦄", name: "Unicorn" },
    { id: 13, emoji: "🦓", name: "Zebra" },
    { id: 14, emoji: "🦒", name: "Zürafa" },
    { id: 15, emoji: "🐘", name: "Fil" },
    { id: 16, emoji: "🦍", name: "Goril" },
    { id: 17, emoji: "🐊", name: "Timsah" },
    { id: 18, emoji: "🐢", name: "Kaplumbağa" }
  ];

  // Seviye ayarları
  const levelSettings = [
    { pairs: 6, timeLimit: 60 }, // Seviye 1
    { pairs: 8, timeLimit: 75 }, // Seviye 2
    { pairs: 10, timeLimit: 90 }, // Seviye 3
    { pairs: 12, timeLimit: 100 }, // Seviye 4
    { pairs: 15, timeLimit: 120 }, // Seviye 5
    { pairs: 18, timeLimit: 150 }  // Seviye 6
  ];

  // Kartları karıştırma fonksiyonu
  const shuffleCards = useCallback(() => {
    const currentLevel = Math.min(level - 1, levelSettings.length - 1);
    const pairsToUse = levelSettings[currentLevel].pairs;

    // Seviye için kart setini seç
    const selectedCards = [...cardItems].slice(0, pairsToUse);

    // Her karttan iki tane oluştur ve karıştır
    const cardPairs = [...selectedCards, ...selectedCards].map((card, index) => ({
      ...card,
      uniqueId: `${card.id}-${index}`,
      isFlipped: false,
      isMatched: false
    }));

    // Kartları karıştır
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setCards(cardPairs);
    setTimeLimit(levelSettings[currentLevel].timeLimit);
  }, [level]);

  // Oyunu başlatma
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGamePaused(false);
    setShowInstructions(false);
    setGameOver(false);
    setMoves(0);
    setScore(0);
    setGameTime(0);
    setMatchedPairs([]);
    setFlippedIndices([]);

    // Kartları karıştır
    shuffleCards();

    // Oyun başlangıcında tüm kartları göster
    setTimeout(() => {
      const allCardIndices = Array.from({ length: levelSettings[Math.min(level - 1, levelSettings.length - 1)].pairs * 2 }, (_, i) => i);
      setFlippedIndices(allCardIndices);

      // 3 saniye sonra kartları kapat
      setTimeout(() => {
        setFlippedIndices([]);
      }, 3000);
    }, 100);
  }, [shuffleCards, level, levelSettings]);

  // Sonraki seviyeye geç (skoru koru)
  const nextLevel = useCallback(() => {
    setLevel(prevLevel => prevLevel + 1);
    setGameStarted(true);
    setGamePaused(false);
    setGameOver(false);
    setMoves(0);
    setGameTime(0);
    setMatchedPairs([]);
    setFlippedIndices([]);
    // Skor korunuyor - sıfırlanmıyor!

    // Kartları karıştır (yeni seviye için)
    setTimeout(() => {
      shuffleCards();

      // Kartları göster
      setTimeout(() => {
        const allCardIndices = Array.from({ length: levelSettings[Math.min(level, levelSettings.length - 1)].pairs * 2 }, (_, i) => i);
        setFlippedIndices(allCardIndices);

        setTimeout(() => {
          setFlippedIndices([]);
        }, 3000);
      }, 100);
    }, 100);
  }, [shuffleCards, level, levelSettings]);

  // Oyunu sıfırlama
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGamePaused(false);
    setMoves(0);
    setScore(0);
    setGameTime(0);
    setMatchedPairs([]);
    setFlippedIndices([]);
    setGameOver(false);
    setCards([]);
  }, []);

  // Seviyeyi ayarlama
  const setGameLevel = useCallback((newLevel) => {
    setLevel(newLevel);
    resetGame();
  }, [resetGame]);

  // Sesi açma/kapama
  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // Oyunu duraklatma/devam ettirme
  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setGamePaused(!gamePaused);
    }
  }, [gameStarted, gamePaused, gameOver]);

  // Kart çevirme işlemi
  const handleCardClick = useCallback((index) => {
    if (
      !gameStarted ||
      gamePaused ||
      gameOver ||
      flippedIndices.length >= 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].id)
    ) {
      return;
    }

    // Ses efekti
    if (soundEnabled) {
      try {
        // Basit bir "tık" sesi efekti oluşturalım (AudioContext kullanarak)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 800; // frekans
        gainNode.gain.value = 0.1; // ses düzeyi

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        // Kısa süre sonra sesi durdur
        setTimeout(() => {
          oscillator.stop();
        }, 100);
      } catch (e) {
        console.error("Ses oynatma hatası:", e);
      }
    }

    // Yeni çevrilen kartlar dizisini oluştur
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);


    // Eğer iki kart çevrildiyse
    if (newFlippedIndices.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCardId = cards[firstIndex].id;
      const secondCardId = cards[secondIndex].id;

      // Hamle sayısını artır
      setMoves(moves + 1);

      // Eşleşme kontrolü
      if (firstCardId === secondCardId) {
        // Eşleşen kartları kaydet
        setMatchedPairs([...matchedPairs, firstCardId]);

        // Skor hesapla (hız bonusu ve seviye faktörü ile)
        const timeBonus = Math.max(0, 30 - Math.floor(gameTime / 10));
        const levelMultiplier = level;
        const newPoints = (100 + timeBonus) * levelMultiplier;
        setScore(prevScore => prevScore + newPoints);

        // Eşleşen kartları sıfırla (yeni çevirmeler için)
        setTimeout(() => {
          setFlippedIndices([]);
        }, 500);
      } else {
        // Eşleşmeyen kartları geri çevir (1 saniye sonra)
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards, matchedPairs, moves, gameStarted, gamePaused, score, level, gameTime, soundEnabled]);

  // Oyun süresini takip et
  useEffect(() => {
    let timer;
    if (gameStarted && !gamePaused && !gameOver) {
      // Oyun başlangıcında hemen süreyi başlatma (kartlar gösterildikten sonra başlat)
      const initialDelay = 2500; // Kartların gösterilme süresi + biraz fazlası (3500 yerine 2500)

      const startTimer = () => {
        timer = setInterval(() => {
          setGameTime(prevTime => {
            const newTime = prevTime + 1;
            // Süre doldu mu kontrolü
            if (newTime >= timeLimit) {
              setGameOver(true);
              clearInterval(timer);
              return timeLimit;
            }
            return newTime;
          });
        }, 1000);
      };

      // Oyun başlangıcında gecikme ile süreyi başlat
      const delayTimer = setTimeout(startTimer, initialDelay);

      return () => {
        clearTimeout(delayTimer);
        clearInterval(timer);
      };
    }
    return () => clearInterval(timer);
  }, [gameStarted, gamePaused, gameOver, timeLimit]);

  // Tüm kartlar eşleşti mi kontrolü
  useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === levelSettings[Math.min(level - 1, levelSettings.length - 1)].pairs && !gameOver) {
      // Oyun tamamlandı - seviye bitti
      setGamePaused(true); // Süreyi durdur

      // Yüksek skorları güncelle
      const newHighScore = {
        level: level,
        score: score,
        moves: moves,
        time: gameTime
      };

      setHighScores(prevScores => {
        const updatedScores = [...prevScores, newHighScore].sort((a, b) => b.score - a.score).slice(0, 5);
        return updatedScores;
      });

      // Seviye tamamlandı mesajı göster - otomatik geçiş YOK
      if (level < levelSettings.length) {
        // Kullanıcı "Seviye X" butonuna basacak
        setGameOver(true);
      } else {
        // Son seviye tamamlandı
        setGameOver(true);
      }
    }
  }, [matchedPairs, cards.length, level, score, moves, gameTime, gameOver, levelSettings]);

  // Geçen süreyi hesapla (kalan değil, geçen)
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;

  // Kart ızgara düzeni için CSS sınıfları
  const getGridClass = () => {
    const pairsCount = levelSettings[Math.min(level - 1, levelSettings.length - 1)].pairs * 2;

    if (pairsCount <= 12) return "grid-cols-4";
    if (pairsCount <= 20) return "grid-cols-5";
    if (pairsCount <= 30) return "grid-cols-6";
    return "grid-cols-6";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 p-4 text-white">
      {/* Başlık */}
      <h1 className="text-4xl font-bold mb-2 text-center text-yellow-300 drop-shadow-lg">Hafıza Oyunu</h1>

      {/* Kontrol Paneli */}
      <div className="w-full max-w-4xl bg-indigo-800/70 backdrop-blur-md p-4 rounded-lg shadow-xl mb-4 flex flex-wrap justify-between items-center">
        {/* Sol Bölüm - İstatistikler */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-indigo-700 p-2 rounded-lg">
            <Clock className="mr-2" size={20} />
            <span className="font-mono text-lg">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center bg-indigo-700 p-2 rounded-lg">
            <Trophy className="mr-2" size={20} />
            <span className="font-mono text-lg">{score}</span>
          </div>

          <div className="flex items-center bg-indigo-700 p-2 rounded-lg">
            <span className="mr-1">Hamle:</span>
            <span className="font-mono text-lg">{moves}</span>
          </div>

          <div className="flex items-center bg-indigo-700 p-2 rounded-lg">
            <span className="mr-1">Seviye:</span>
            <span className="font-mono text-lg">{level}</span>
          </div>
        </div>

        {/* Sağ Bölüm - Kontroller */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          {!gameStarted ? (
            <button
              onClick={startGame}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <PlayCircle className="mr-1" size={20} />
              Başlat
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex items-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {gamePaused ? <PlayCircle className="mr-1" size={20} /> : <Pause className="mr-1" size={20} />}
                {gamePaused ? 'Devam Et' : 'Duraklat'}
              </button>

              <button
                onClick={resetGame}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <RotateCcw className="mr-1" size={20} />
                Sıfırla
              </button>
            </>
          )}

          <button
            onClick={toggleSound}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Ayarlar Paneli */}
      {showSettings && (
        <div className="w-full max-w-4xl bg-indigo-800/70 backdrop-blur-md p-4 rounded-lg shadow-xl mb-4">
          <h2 className="text-xl font-bold mb-2">Ayarlar</h2>
          <div className="flex flex-wrap gap-2">
            <div className="mb-2">
              <p className="mb-1">Seviye Seçin:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setGameLevel(lvl)}
                    className={`py-1 px-3 rounded-md ${level === lvl ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Yüksek Skorlar */}
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Yüksek Skorlar</h3>
            {highScores.length > 0 ? (
              <div className="bg-indigo-900/70 p-2 rounded-lg max-h-40 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-indigo-700">
                      <th className="text-left pb-1">Sıra</th>
                      <th className="text-left pb-1">Seviye</th>
                      <th className="text-left pb-1">Skor</th>
                      <th className="text-left pb-1">Hamle</th>
                      <th className="text-left pb-1">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highScores.map((score, index) => (
                      <tr key={index} className="hover:bg-indigo-800/50">
                        <td className="py-1">{index + 1}</td>
                        <td className="py-1">{score.level}</td>
                        <td className="py-1 font-bold">{score.score}</td>
                        <td className="py-1">{score.moves}</td>
                        <td className="py-1">{Math.floor(score.time / 60)}:{(score.time % 60).toString().padStart(2, '0')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300">Henüz skor kaydedilmedi.</p>
            )}
          </div>
        </div>
      )}

      {/* Oyun Talimatları */}
      {showInstructions && !gameStarted && (
        <div className="w-full max-w-4xl bg-indigo-800/70 backdrop-blur-md p-4 rounded-lg shadow-xl mb-4">
          <h2 className="text-xl font-bold mb-2">Nasıl Oynanır?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Önce tüm kartların yüzleri kısa bir süreliğine gösterilecektir.</li>
            <li>Bu kartların yerlerini hatırlamaya çalışın!</li>
            <li>Amacınız tüm eşleşen kart çiftlerini bulmaktır.</li>
            <li>Bir seferde iki kart açabilirsiniz.</li>
            <li>Kartlar eşleşirse, açık kalırlar.</li>
            <li>Eşleşmezlerse, tekrar kapanırlar.</li>
            <li>Tüm çiftleri ne kadar hızlı bulursanız, o kadar yüksek puan alırsınız.</li>
            <li>Her seviyede kart sayısı ve zorluk artar.</li>
            <li>Süre dolmadan önce tüm çiftleri bulun!</li>
          </ul>
          <button
            onClick={startGame}
            className="mt-4 flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <PlayCircle className="mr-1" size={20} />
            Haydi Başlayalım!
          </button>
        </div>
      )}

      {/* Oyun Bitiş Ekranı */}
      {gameOver && (
        <div className="w-full max-w-4xl bg-indigo-800/70 backdrop-blur-md p-4 rounded-lg shadow-xl mb-4 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {matchedPairs.length === levelSettings[Math.min(level - 1, levelSettings.length - 1)].pairs
              ? '🎉 Tebrikler! Tüm eşleşmeleri buldunuz!'
              : '⏱️ Süre Doldu!'}
          </h2>
          <p className="text-xl mb-4">
            Skorunuz: <span className="font-bold text-yellow-300">{score}</span>
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <RotateCcw className="mr-1" size={20} />
              Yeniden Oyna
            </button>
            {level < levelSettings.length &&
              matchedPairs.length === levelSettings[Math.min(level - 1, levelSettings.length - 1)].pairs && (
                <button
                  onClick={nextLevel}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Seviye {level + 1} →
                </button>
              )}
          </div>
        </div>
      )}

      {/* Kart Izgarası */}
      {gameStarted && (
        <div className={`w-full max-w-4xl grid ${getGridClass()} gap-2 sm:gap-4`}>
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.id);

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(index)}
                className={`
                  cursor-pointer transition-all duration-300 h-20 sm:h-28
                  ${(gamePaused || gameOver) ? 'pointer-events-none' : ''}
                  ${isFlipped ? 'scale-105' : 'hover:scale-105'}
                `}
              >
                {isFlipped ? (
                  /* Kart Açık - Emoji Göster */
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg border-2 border-yellow-400 flex flex-col items-center justify-center shadow-lg animate-pulse">
                    <span className="text-3xl sm:text-5xl">{card.emoji}</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-900 mt-1">{card.name}</span>
                  </div>
                ) : (
                  /* Kart Kapalı - Soru İşareti Göster */
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg border-2 border-indigo-400 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-indigo-700 flex items-center justify-center">
                      <span className="text-indigo-300 font-bold text-xl">?</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Altbilgi */}
      <div className="mt-4 text-center text-sm text-indigo-300">
        <p>© 2025 Hafıza Oyunu | Tüm hakları saklıdır.</p>
      </div>

    </div>
  );
}