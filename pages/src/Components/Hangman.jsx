import React, { useState, useEffect, useCallback, useRef } from "react";

// Gelişmiş API simülasyonu - daha fazla kategori ve kelime içeriyor
const mockApiWords = {
  animals: {
    easy: ["kedi", "köpek", "balık", "kuş", "fare", "tavşan", "kurbağa", "arı", "inek", "keçi"],
    medium: ["kaplan", "zürafa", "penguen", "aslan", "maymun", "timsah", "jaguar", "kanguru", "panda", "kartal"],
    hard: ["ornitorenk", "orangutan", "hamsterbalığı", "böcekçil", "pangolin", "narval", "armadillo", "tapir", "okapi", "lemur"]
  },
  foods: {
    easy: ["ekmek", "elma", "bal", "çorba", "pilav", "salata", "süt", "peynir", "börek", "meyve"],
    medium: ["makarna", "kebap", "baklava", "lahmacun", "dolma", "mantı", "kumpir", "pide", "künefe", "gözleme"],
    hard: ["menemen", "beşamel", "karnabahar", "soğanlama", "revani", "keşkül", "tarator", "barbunya", "zeytinyağlı", "aşure"]
  },
  movies: {
    easy: ["avatar", "titanic", "rocky", "batman", "rambo", "joker", "aslan", "hobbit", "matrix", "terminator"],
    medium: ["gladyatör", "braveheart", "casablanca", "amelie", "inception", "departed", "memento", "seven", "arrival", "prestige"],
    hard: ["yıldızlararası", "schindler", "dövüşkulübü", "kuzuların", "esaretin", "yeşilmile", "akıldışı", "parazit", "piyanist", "birdman"]
  },
  cities: {
    easy: ["ankara", "bursa", "adana", "izmir", "konya", "muğla", "aydın", "ordu", "hatay", "sivas"],
    medium: ["çanakkale", "eskişehir", "gaziantep", "kayseri", "trabzon", "balıkesir", "tekirdağ", "zonguldak", "kastamonu", "denizli"],
    hard: ["afyonkarahisar", "kahramanmaraş", "şanlıurfa", "diyarbakır", "gümüşhane", "kırklareli", "osmaniye", "nevşehir", "kütahya", "bingöl"]
  },
  names: {
    easy: ["ahmet", "zeynep", "mehmet", "ayşe", "selim", "selin", "deniz", "kaan", "murat", "arda"],
    medium: ["abdullah", "mehtap", "gizem", "yasemin", "bilal", "cemal", "hakan", "ilknur", "serkan", "kerem"],
    hard: ["abdülkadir", "muhammet", "aleyna", "selahattin", "münevver", "necmettin", "süleyman", "kemalettin", "abdurrahman", "şerafettin"]
  },
  sports: {
    easy: ["futbol", "tenis", "koşu", "golf", "yüzme", "kayak", "boks", "voleybol", "basketbol", "masa"],
    medium: ["badminton", "hentbol", "kriket", "beyzbol", "maraton", "binicilik", "okçuluk", "eskrim", "triatlon", "hokey"],
    hard: ["paraşütçülük", "oryantiring", "curling", "pentatlon", "halter", "senkronize", "wushu", "ragbi", "lacrosse", "squash"]
  },
  professions: {
    easy: ["doktor", "aşçı", "öğretmen", "polis", "bahçıvan", "terzi", "pilot", "ressam", "kasap", "marangoz"],
    medium: ["arkeolog", "jeolog", "pazarlamacı", "fotoğrafçı", "fizyoterapist", "antrenör", "tasarımcı", "diyetisyen", "muhasebeci", "veteriner"],
    hard: ["antropolog", "paleontolog", "epidemiyolog", "kardiyolog", "metalurjist", "meteorolog", "nöropsikolog", "biyoistatistikçi", "fitopatoloji", "aromatoloji"]
  }
};

// API'den kelime getirme fonksiyonu 
const fetchWords = async (category, difficulty) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const words = mockApiWords[category]?.[difficulty] || [];
        // Orijinal diziyi değiştirmeden kelime listesini karıştırma
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        resolve(shuffledWords);
      }, 300); // API çağrısı simülasyonu için 300ms gecikme
    });
  };

// İpucu mantığı için kullanılacak ipuçları
const categoryHints = {
  animals: "Bu bir hayvan türüdür.",
  foods: "Bu bir yiyecek türüdür.",
  movies: "Bu bir film adıdır.",
  cities: "Bu bir şehir adıdır.",
  names: "Bu bir kişi adıdır.",
  sports: "Bu bir spor dalıdır.",
  professions: "Bu bir meslek türüdür."
};

// Zorluk derecesine göre ipucu sayısı
const difficultyHints = {
  easy: 3,
  medium: 2,
  hard: 1
};

// SVG animasyonları için çizim parçaları
const HangmanDrawing = ({ wrongGuesses, gameOver, won }) => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    if (wrongGuesses > 0) {
      setAnimated(true);
      const timer = setTimeout(() => setAnimated(false), 500);
      return () => clearTimeout(timer);
    }
  }, [wrongGuesses]);

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className={`hangman-drawing ${animated ? 'animate-pulse' : ''}`}>
      {/* Darağacı çizimi - her zaman göster */}
      <line x1="40" y1="190" x2="160" y2="190" stroke="white" strokeWidth="3" /> {/* Taban */}
      <line x1="60" y1="20" x2="60" y2="190" stroke="white" strokeWidth="3" /> {/* Direk */}
      <line x1="60" y1="20" x2="120" y2="20" stroke="white" strokeWidth="3" /> {/* Üst çubuk */}
      <line x1="120" y1="20" x2="120" y2="40" stroke="white" strokeWidth="3" /> {/* İp */}
      
      {/* Kafa (1 hata) */}
      {wrongGuesses >= 1 && (
        <circle cx="120" cy="60" r="20" stroke="white" strokeWidth="3" fill={gameOver && !won ? "rgba(255,0,0,0.2)" : "none"} />
      )}
      
      {/* Gövde (2 hata) */}
      {wrongGuesses >= 2 && (
        <line x1="120" y1="80" x2="120" y2="130" stroke="white" strokeWidth="3" />
      )}
      
      {/* Sol kol (3 hata) */}
      {wrongGuesses >= 3 && (
        <line x1="120" y1="90" x2="90" y2="110" stroke="white" strokeWidth="3" />
      )}
      
      {/* Sağ kol (4 hata) */}
      {wrongGuesses >= 4 && (
        <line x1="120" y1="90" x2="150" y2="110" stroke="white" strokeWidth="3" />
      )}
      
      {/* Sol bacak (5 hata) */}
      {wrongGuesses >= 5 && (
        <line x1="120" y1="130" x2="100" y2="170" stroke="white" strokeWidth="3" />
      )}
      
      {/* Sağ bacak (6 hata - tam asılmış) */}
      {wrongGuesses >= 6 && (
        <line x1="120" y1="130" x2="140" y2="170" stroke="white" strokeWidth="3" />
      )}
      
      {/* Yüz ifadeleri (kazanma/kaybetme durumuna göre) */}
      {gameOver && !won && (
        <>
          {/* Üzgün yüz (X gözler) */}
          <line x1="110" y1="55" x2="115" y2="65" stroke="red" strokeWidth="2" />
          <line x1="115" y1="55" x2="110" y2="65" stroke="red" strokeWidth="2" />
          <line x1="125" y1="55" x2="130" y2="65" stroke="red" strokeWidth="2" />
          <line x1="130" y1="55" x2="125" y2="65" stroke="red" strokeWidth="2" />
          {/* Ağız */}
          <path d="M110,70 Q120,60 130,70" stroke="red" strokeWidth="2" fill="none" />
        </>
      )}
      
      {/* Mutlu yüz (kazanma durumu) */}
      {gameOver && won && (
        <>
          {/* Gözler */}
          <circle cx="110" cy="55" r="3" fill="green" />
          <circle cx="130" cy="55" r="3" fill="green" />
          {/* Gülümseyen ağız */}
          <path d="M110,70 Q120,80 130,70" stroke="green" strokeWidth="2" fill="none" />
        </>
      )}
    </svg>
  );
};

// Konfeti animasyonu komponenti
const Confetti = ({ active }) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Konfeti parçacıkları oluştur
    const initialParticles = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 5 + 3,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      speed: Math.random() * 3 + 1,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.1 - 0.05,
      rotationAngle: 0
    }));
    
    setParticles(initialParticles);
    
    const animate = () => {
      if (!active) return;
      
      ctx.clearRect(0, 0, width, height);
      
      setParticles(prev => prev.map(p => {
        p.y += p.speed;
        p.x += Math.sin(p.angle) * 0.5;
        p.rotationAngle += p.rotation;
        
        if (p.y > height) {
          p.y = -p.size;
          p.x = Math.random() * width;
        }
        
        // Konfeti parçasını çiz
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotationAngle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        
        return p;
      }));
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [active]);
  
  if (!active) return null;
  
  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

// Puanlama ve seviye sistemi
const calculateScore = (difficulty, timeLeft, wrongGuesses, wordLength, hintsUsed) => {
  // Zorluk derecesine göre baz puan
  const difficultyBase = { easy: 100, medium: 200, hard: 300 };
  
  // Kelime uzunluğu bonus
  const lengthBonus = wordLength * 10;
  
  // Zaman bonusu
  const timeBonus = timeLeft * 2;
  
  // Yanlış tahmin ceza puanı
  const wrongGuessPenalty = wrongGuesses * 20;
  
  // İpucu kullanım cezası
  const hintPenalty = hintsUsed * 30;
  
  return Math.max(0, difficultyBase[difficulty] + lengthBonus + timeBonus - wrongGuessPenalty - hintPenalty);
};

// Ana oyun komponenti
const Hangman = () => {
  const MAX_ATTEMPTS = 6;
  const INITIAL_TIME = 300; // 5 dakika
  
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState("animals");
  const [secretWord, setSecretWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [keyboardFocus, setKeyboardFocus] = useState(true);
  const [categories, setCategories] = useState(Object.keys(mockApiWords));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [totalHints, setTotalHints] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [theme, setTheme] = useState("dark"); // dark veya light
  const [animation, setAnimation] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastLetterGuessed, setLastLetterGuessed] = useState("");
  const [lastGuessCorrect, setLastGuessCorrect] = useState(null);
  const [revealedLetters, setRevealedLetters] = useState([]);
  
  // Sesler için referanslar
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const loseSoundRef = useRef(null);
  
  // Seviye yükseltme mantığı
  useEffect(() => {
    const levelThresholds = [0, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000];
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (totalScore >= levelThresholds[i]) {
        setUserLevel(i + 1);
        break;
      }
    }
  }, [totalScore]);

  // Kategori değişince oyunu yeniden başlat
  useEffect(() => {
    if (secretWord) {
      startNewGame();
    }
  }, [difficulty, category]);

  // İlk yükleme
  useEffect(() => {
    startNewGame();
  }, []);

  // Geri sayım zamanlayıcısı
  useEffect(() => {
    if (gameOver || !secretWord) return;
  
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [gameOver, secretWord]);

  // Fiziksel klavye tuşları için event handler
  const handleKeyDown = useCallback((event) => {
    if (gameOver || !secretWord) return;
    
    const key = event.key.toLowerCase();
    // Türkçe alfabe karakteri kontrolü
    if ("abcçdefgğhıijklmnoöprsştuüvyz".includes(key)) {
      handleGuess(key);
    }
  }, [gameOver, guessedLetters, secretWord]);

  // Klavye event listener'ını aktif et
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const startNewGame = async () => {
    setLoading(true);
    setError("");
    setCurrentHint("");
    setHintsUsed(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
    setShowConfetti(false);
    setLastLetterGuessed("");
    setLastGuessCorrect(null);
    setRevealedLetters([]);
    
    try {
      // API'den kategoriye ve zorluk seviyesine göre kelime listesi al
      const wordsList = await fetchWords(category, difficulty);
      
      if (!wordsList || wordsList.length === 0) {
        setError(`Bu kategori ve zorluk seviyesinde kelime bulunamadı: ${category} - ${difficulty}`);
        setLoading(false);
        return;
      }
      
      // Rastgele bir kelime seç
      const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      setSecretWord(randomWord.toLocaleLowerCase("tr-TR"));
      setTimeLeft(INITIAL_TIME);
      setKeyboardFocus(true);
      setTotalHints(difficultyHints[difficulty]);
    } catch (err) {
      setError("Kelimeler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Kelime yükleme hatası:", err);
    }
    
    setLoading(false);
  };

  const handleGuess = (letter) => {
    if (gameOver || guessedLetters.includes(letter) || !secretWord) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    setLastLetterGuessed(letter);

    if (!secretWord.includes(letter)) {
      // Yanlış tahmin
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      setLastGuessCorrect(false);
      
      // Ses çal
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
      }
      
      if (newWrong >= MAX_ATTEMPTS) {
        endGame(false);
      }
    } else {
      // Doğru tahmin
      setLastGuessCorrect(true);
      
      // Ses çal
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
      }
      
      // Tüm harfler bulundu mu kontrol et
      const allLettersGuessed = secretWord
        .split("")
        .every((char) => newGuessed.includes(char));
      
      if (allLettersGuessed) {
        endGame(true);
      }
    }
  };

  const endGame = (isWin) => {
    setGameOver(true);
    setWon(isWin);
    
    // Oyun istatistiklerini güncelle
    setGamesPlayed(prev => prev + 1);
    
    if (isWin) {
      // Kazanma durumu
      setGamesWon(prev => prev + 1);
      setStreakCount(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streakCount + 1));
      setShowConfetti(true);
      
      // Kazanma sesi çal
      if (winSoundRef.current) {
        winSoundRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
      }
      
      // Puanı hesapla ve ekle
      const gameScore = calculateScore(
        difficulty, 
        timeLeft, 
        wrongGuesses, 
        secretWord.length,
        hintsUsed
      );
      
      setScore(gameScore);
      setTotalScore(prev => prev + gameScore);
    } else {
      // Kaybetme durumu
      setStreakCount(0);
      
      // Kaybetme sesi çal
      if (loseSoundRef.current) {
        loseSoundRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
      }
    }
  };

  // İpucu gösterme fonksiyonu
  const showHint = () => {
    if (hintsUsed >= totalHints || gameOver || !secretWord) return;
    
    // Temel kategori ipucu
    let hint = categoryHints[category] || "Bu kelimeyi tahmin edin.";
    
    // İpucu tipini belirle (kelime uzunluğu, ilk harf, rastgele harf)
    const hintTypes = [
      // 1. İpucu tipi: Kelime uzunluğu
      () => `Kelime ${secretWord.length} harften oluşuyor.`,
      
      // 2. İpucu tipi: İlk harf
      () => {
        const firstLetter = secretWord[0];
        if (!revealedLetters.includes(firstLetter)) {
          setRevealedLetters(prev => [...prev, firstLetter]);
          if (!guessedLetters.includes(firstLetter)) {
            setGuessedLetters(prev => [...prev, firstLetter]);
          }
        }
        return `Kelimenin ilk harfi "${firstLetter}" harfidir.`;
      },
      
      // 3. İpucu tipi: Rastgele bir harf
      () => {
        // Henüz tahmin edilmemiş harfleri bul
        const unrevealedLetters = secretWord
          .split('')
          .filter((char, idx) => 
            !revealedLetters.includes(char) && 
            secretWord.indexOf(char) === idx
          );
        
        if (unrevealedLetters.length > 0) {
          // Rastgele bir harf seç
          const randomChar = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
          const positions = [];
          
          // Harfin konumlarını bul
          [...secretWord].forEach((char, idx) => {
            if (char === randomChar) positions.push(idx + 1);
          });
          
          // Harfi açık harflere ekle
          setRevealedLetters(prev => [...prev, randomChar]);
          
          // Eğer tahmin edilmediyse tahmin listesine ekle
          if (!guessedLetters.includes(randomChar)) {
            setGuessedLetters(prev => [...prev, randomChar]);
          }
          
          return `Kelimede "${randomChar}" harfi ${positions.join(', ')}. konumlarda bulunuyor.`;
        } else {
          return "Tüm ipuçları kullanıldı.";
        }
      }
    ];
    
    // İpucu seçimi - sırayla git
    hint = hintTypes[hintsUsed]();
    
    setCurrentHint(hint);
    setHintsUsed(prev => prev + 1);
  };

  const renderWord = () => {
    if (!secretWord) return null;
    
    return secretWord
      .split("")
      .map((char, i) => {
        const isGuessed = guessedLetters.includes(char);
        const isLastGuessed = char === lastLetterGuessed && isGuessed;
        const isRevealed = revealedLetters.includes(char);
        
        let letterClass = "mx-1 text-2xl inline-block w-8 text-center border-b-2 border-gray-500 pb-1";
        
        if (isGuessed) {
          letterClass += isLastGuessed ? " text-yellow-300 animate-bounce" : " text-white";
        }
        
        if (isRevealed && !isGuessed) {
          letterClass += " text-blue-300";
        }
        
        if (gameOver && !isGuessed) {
          letterClass += " text-red-500";
        }
        
        return (
          <span key={i} className={letterClass}>
            {isGuessed || (gameOver && !won) ? char : "_"}
          </span>
        );
      });
  };

  const renderKeyboard = () => {
    const alphabet = "abcçdefgğhıijklmnoöprsştuüvyz".split("");
    
    // Klavyeyi iki satıra böl
    const firstRow = alphabet.slice(0, 14);
    const secondRow = alphabet.slice(14);
    
    const renderKey = (char) => {
      const isGuessed = guessedLetters.includes(char);
      const isCorrect = secretWord && secretWord.includes(char) && isGuessed;
      const isLastGuessed = char === lastLetterGuessed;
      
      let buttonClass = "m-1 p-2 w-10 h-10 text-white rounded-lg shadow-md transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500";
      
      if (isGuessed) {
        buttonClass += isCorrect 
          ? " bg-green-600 hover:bg-green-700" 
          : " bg-red-600 hover:bg-red-700";
          
        if (isLastGuessed) {
          buttonClass += " animate-pulse";
        }
      } else {
        buttonClass += " bg-gray-700 hover:bg-gray-600";
      }
      
      return (
        <button
          key={char}
          onClick={() => handleGuess(char)}
          disabled={isGuessed || gameOver || !secretWord}
          className={buttonClass}
        >
          {char}
        </button>
      );
    };
    
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap justify-center mb-2">
          {firstRow.map(renderKey)}
        </div>
        <div className="flex flex-wrap justify-center">
          {secondRow.map(renderKey)}
        </div>
      </div>
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Kategori adlarını daha kullanıcı dostu formata çevirme
  const formatCategoryName = (categoryName) => {
    const categoryMap = {
      "animals": "Hayvanlar",
      "foods": "Yiyecekler",
      "movies": "Filmler",
      "cities": "Şehirler",
      "names": "İsimler",
      "sports": "Sporlar",
      "professions": "Meslekler"
    };
    
    return categoryMap[categoryName] || categoryName;
  };

  // Zorluk seviyesi bilgilerini gösterme
  const renderDifficultyInfo = () => {
    const difficultyInfo = {
      easy: { color: "green", text: "Kolay" },
      medium: { color: "yellow", text: "Orta" },
      hard: { color: "red", text: "Zor" }
    };
    
    return (
      <div className={`text-${difficultyInfo[difficulty].color}-400 text-sm mb-2 flex items-center`}>
        <div className={`w-3 h-3 rounded-full bg-${difficultyInfo[difficulty].color}-500 mr-2`}></div>
        {difficultyInfo[difficulty].text} Seviye
      </div>
    );
  };

  // Seviye çubuğu gösterimi
  const renderLevelProgress = () => {
    const levelThresholds = [0, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000];
    const currentLevelScore = levelThresholds[userLevel - 1];
    const nextLevelScore = levelThresholds[userLevel] || levelThresholds[levelThresholds.length - 1];
    const progress = ((totalScore - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;
    
    return (
      <div className="mt-4 w-full">
        <div className="flex justify-between text-xs mb-1">
          <span>Seviye {userLevel}</span>
          <span>{totalScore} / {nextLevelScore} XP</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Rozet sistemi
  const renderBadges = () => {
    const badges = [
      { id: "firstWin", name: "İlk Zafer", icon: "🏆", unlocked: gamesWon >= 1 },
      { id: "streak3", name: "3 Galibiyet Serisi", icon: "🔥", unlocked: bestStreak >= 3 },
      { id: "streak5", name: "5 Galibiyet Serisi", icon: "⚡", unlocked: bestStreak >= 5 },
      { id: "master", name: "Kelime Ustası", icon: "🧠", unlocked: gamesWon >= 10 },
      { id: "lightning", name: "Hızlı Çözüm", icon: "⏱️", unlocked: gamesWon >= 1 && score > 400 },
      { id: "hardmode", name: "Zor Mod Galibiyeti", icon: "🌟", unlocked: gamesWon >= 1 && difficulty === "hard" }
    ];
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Rozetler</h3>
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => (
            <div 
              key={badge.id}
              className={`p-2 rounded-full ${badge.unlocked ? 'bg-yellow-600' : 'bg-gray-700'} 
                          w-10 h-10 flex items-center justify-center cursor-help
                          transition-all hover:scale-110`}
              title={badge.name}
            >
              <span className="text-lg">{badge.icon}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} px-4`}
      tabIndex={0} 
      onFocus={() => setKeyboardFocus(true)}
      onBlur={() => setKeyboardFocus(false)}
    >
      {/* Konfeti animasyonu */}
      <Confetti active={showConfetti && animation} />
      
      {/* Sesler */}
      <audio ref={correctSoundRef} src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWmxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/jOMAAAAAlGkCANBIALBwWDBwI+CFQDAEIsDonLvnJwnH/ILnHHCIOQc45xzjnJwnOOcEIQhOc5xzjnHOck45yQhCEJz////jnJOOckIQhCc5////5yTjnJCEIQnOOcc45xzkhCEIQnOcc45JxzjnHOOQhCE5xzjnHOOcc45yEIQnOOcc45JxzjnHIQhCEJznHOOcc45xzjnHOOc5JyTjnHOOcc45xzjnHOSck5JyTjnHOOcc45xzjnJOOck5JxzjnHOOcc45xzknJOSck45xzjnHOOcc45yTknJOScc45xzjnHOOcc5JyTknJOOcc45xzjnHOOck5JyTjnHOOcc45xzjnJOSck5JxzjnHOOcc45xzknJOSck45xzjnHOOccAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="/>
      <audio ref={wrongSoundRef} src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAABQAACMwAICAgICAgICAgICAgQEBAQEBAQEBAQEBAgICAgICAgICAgICAwMDAwMDAwMDAwMDg4ODg4ODg4ODg4OD///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAKmAZlRSQQAM14mL0LKKnmYvQkUI4iIYvOcc5x/c5JznJOc5yTnOOcJznJCcIQnOSE5znJCEIQhCEIQjGMYx/GMYxjH40cYihmKGMjicNQzGMYxjGMYJ3/AAx+mDO4+QbO//JjGYzO5/+czm//Z9///5jGYxjGMYxjGMxkiIiIiIiEQhEIRERERERERERERERERCIQiEIiIiIiIiIiIiIiGYoYyOJxSKRSKRmMxmM1+MxmMxiaLNZrNZrNd33fd3feZrNZrNZrNaDj4OPd3d3SuKGMjicUikUikZjMZjMxmMxmM1ms1ms1+/fu7u7u7uu67ru/eZrNZrNZrNZrQcfBx7u7u6VxQxkcTikUikUjMZjMZmYzGYzGazWazX7u7vvf3vf3d3XdZrNZrNZrNZrNBx8HHu7u7pXFDGRxOKRSKRSMxmMxmYzGbzWazX7+/v7+/v7+/v76zWczWazWazWazTBx8HHu7u7pXFDGRxOKRSKRSMxmMxmYzGbzWazX7+/v7+/v7+/v76zWczWazWazWbzQUJBnu7u7pXFDGRxOKRSKRSMxmMxmZiIiIRCIREREYxjGMY//vu+77ve0xjGMYiIiIiIQgaBnu7u7"/>
      <audio ref={winSoundRef} src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABowANTU1NTU1NTU1NUBAQEBAQEBAQGtra2tra2tra2uVlZWVlZWVlZXAwMDAwMDAwMDq6urq6urq6ur/////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..."/>
      <audio ref={loseSoundRef} src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAACAAADpAAFhYWFhYWFhYwMDAwMDAwMDBKSkpKSkpKSkpkZGRkZGRkZGR+fn5+fn5+fn6YmJiYmJiYmJiysrKysrKysrLMzMzMzMzMzMzm5ubm5ubm5ub///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..."/>
        
      {/* Oyun başlığı */}
      <div className="flex items-center mb-6">
        <h1 className="text-4xl font-bold mr-4">Adam Asmaca</h1>
        <div className="flex items-center">
          <span className="text-lg font-semibold mr-2">Seviye {userLevel}</span>
          <div className="flex">
            {Array.from({length: userLevel}).map((_, idx) => (
              <span key={idx} className="text-yellow-500 text-lg">★</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Ana oyun kartı */}
      <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full max-w-3xl`}>
        {/* Üst bilgi bölümü */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-lg font-bold mr-2">Kategori:</span>
              <span>{formatCategoryName(category)}</span>
            </div>
            {renderDifficultyInfo()}
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`text-xl font-bold mb-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
              Süre: {formatTime(timeLeft)}
            </div>
            <div className="flex items-center">
              <span className="mr-2">İpucu:</span>
              <span className="font-bold">{hintsUsed}/{totalHints}</span>
            </div>
          </div>
        </div>
        
        {/* Çizim ve kelime alanı */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0">
            <HangmanDrawing 
              wrongGuesses={wrongGuesses} 
              gameOver={gameOver} 
              won={won} 
            />
          </div>
          
          <div className="flex-1 text-center">
            <div className="mb-4 min-h-[40px]">
              {currentHint && (
                <div className="p-2 bg-blue-900 bg-opacity-30 rounded-lg inline-block">
                  <span className="text-blue-300">İpucu: </span>
                  <span>{currentHint}</span>
                </div>
              )}
            </div>
            
            <div className="mb-6 min-h-[40px]">
              {renderWord()}
            </div>
            
            {/* Oyun sonuç mesajları */}
            {gameOver && (
              <div className={`text-2xl font-bold mb-4 ${won ? 'text-green-500' : 'text-red-500'}`}>
                {won ? 'Tebrikler! Kazandınız!' : 'Kaybettiniz!'}
                {!won && <div className="text-lg mt-2">Doğru cevap: <span className="uppercase">{secretWord}</span></div>}
              </div>
            )}
            
            {/* Puan gösterimi */}
            {gameOver && won && (
              <div className="mb-4">
                <div className="text-yellow-400 text-2xl font-bold animate-bounce">
                  +{score} Puan!
                </div>
                <div className="text-sm opacity-70 mt-1">
                  Toplam: {totalScore} puan
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Klavye bölümü */}
        <div className="mb-6">
          {renderKeyboard()}
        </div>
        
        {/* Butonlar */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={showHint}
            disabled={hintsUsed >= totalHints || gameOver || !secretWord}
            className={`px-4 py-2 rounded-lg ${
              hintsUsed >= totalHints || gameOver
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            İpucu Göster ({totalHints - hintsUsed})
          </button>
          
          <button
            onClick={startNewGame}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            {gameOver ? 'Yeni Oyun' : 'Yeniden Başlat'}
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            İstatistikler
          </button>
          
          <button
            onClick={() => setShowRules(!showRules)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Kurallar
          </button>
        </div>
        
        {/* Ayarlar bölümü */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-bold mb-3">Oyun Ayarları</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatCategoryName(cat)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Zorluk Seviyesi</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="easy">Kolay</option>
                <option value="medium">Orta</option>
                <option value="hard">Zor</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Tema</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="dark">Karanlık</option>
                <option value="light">Aydınlık</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Animasyonlar</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={animation}
                  onChange={() => setAnimation(!animation)}
                  className="mr-2 h-5 w-5"
                />
                <span>Animasyonları Göster</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seviye çubuğu */}
      {renderLevelProgress()}
      
      {/* İstatistikler modal penceresi */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Oyun İstatistikleri</h2>
              <button 
                onClick={() => setShowStats(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✖
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">{gamesPlayed}</div>
                <div className="text-sm text-gray-400">Toplam Oyun</div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">{gamesWon}</div>
                <div className="text-sm text-gray-400">Kazanılan</div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">
                  {gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-400">Kazanma Oranı</div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">{totalScore}</div>
                <div className="text-sm text-gray-400">Toplam Puan</div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">{streakCount}</div>
                <div className="text-sm text-gray-400">Şu anki Seri</div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <div className="text-3xl font-bold">{bestStreak}</div>
                <div className="text-sm text-gray-400">En İyi Seri</div>
              </div>
            </div>
            
            {renderBadges()}
            
            <button
              onClick={() => setShowStats(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      
      {/* Kurallar modal penceresi */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-w-md w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Oyun Kuralları</h2>
              <button 
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✖
              </button>
            </div>
            
            <div className="space-y-4">
              <p>
                Adam Asmaca oyunu, bilgisayarın rastgele seçtiği bir kelimeyi tahmin etmeye çalıştığınız bir oyundur.
              </p>
              
              <div>
                <h3 className="font-bold mb-1">Nasıl Oynanır:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Her oyunda belirli bir kategoriden gizli bir kelime seçilir.</li>
                  <li>Ekrandaki harflere tıklayarak veya klavyenizi kullanarak harf tahmininde bulunun.</li>
                  <li>Doğru tahminler kelimede gösterilir, yanlış tahminler ise adamın asılmasına neden olur.</li>
                  <li>6 yanlış tahmin hakkınız var - bundan sonra oyunu kaybedersiniz.</li>
                  <li>İpuçları için "İpucu Göster" düğmesini kullanabilirsiniz, ancak her ipucu puanınızdan düşer.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Puanlama:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Zorluk seviyesi, kalan süre, kelimenin uzunluğu puanınızı artırır.</li>
                  <li>Yanlış tahminler ve kullanılan ipuçları puanınızdan düşer.</li>
                  <li>Oyunu ne kadar hızlı çözerseniz, o kadar çok puan kazanırsınız.</li>
                  <li>Seviyeniz yükseldikçe yeni rozetlere erişim kazanırsınız.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Zorluk Seviyeleri:</h3>
                <ul className="list-disc pl-5">
                  <li><span className="text-green-500 font-bold">Kolay</span>: Daha basit ve yaygın kelimeler, 3 ipucu hakkı.</li>
                  <li><span className="text-yellow-500 font-bold">Orta</span>: Orta zorlukta kelimeler, 2 ipucu hakkı.</li>
                  <li><span className="text-red-500 font-bold">Zor</span>: Nadir ve uzun kelimeler, 1 ipucu hakkı.</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => setShowRules(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
      
      {/* Yükleme ve hata bildirimleri */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-lg shadow-lg z-40">
          {error}
        </div>
      )}
      
      {/* Ekran klavyesi için odak yakalama */}
      <div 
        className="hidden" 
        tabIndex={-1} 
        ref={(el) => el && keyboardFocus && el.focus()}
      />
      
      {/* Footer */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>© {new Date().getFullYear()} Adam Asmaca Oyunu - Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}

  export default Hangman;
  