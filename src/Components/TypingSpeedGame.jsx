import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Timer, Target, Trophy, Zap, TrendingUp, Award, RefreshCw, Settings, Play, Pause } from 'lucide-react';

const TypingSpeedGame = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, finished
    const [mode, setMode] = useState('words'); // words, sentences, code, numbers
    const [difficulty, setDifficulty] = useState('medium');
    const [timeLimit, setTimeLimit] = useState(60);
    const [currentText, setCurrentText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [totalChars, setTotalChars] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [incorrectChars, setIncorrectChars] = useState(0);
    const [wordsCompleted, setWordsCompleted] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [bestScores, setBestScores] = useState({});
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [rawWpm, setRawWpm] = useState(0);
    const [mistakes, setMistakes] = useState([]);

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const [libraryForMode, setLibraryForMode] = useState(null);
    const [isLibLoading, setIsLibLoading] = useState(false);
  
    useEffect(() => {
        let active = true;
        setIsLibLoading(true);
        import(`@/TypingSpeedContent/${mode}.js`)
            .then(mod => { if (active) setLibraryForMode(mod.default); })
            .catch(err => { console.error('İçerik yüklenemedi:', err); if (active) setLibraryForMode(null); })
            .finally(() => { if (active) setIsLibLoading(false); });
        return () => { active = false; };
    }, [mode]);

    const generateText = () => {
        if (!libraryForMode) return '';
        const pool = libraryForMode[difficulty];
        let text = '';

        if (mode === 'words' || mode === 'numbers') {
            const count = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 70;
            const items = [];
            for (let i = 0; i < count; i++) {
            items.push(pool[Math.floor(Math.random() * pool.length)]);
            }
            text = items.join(' ');
        } else {
            const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
            const items = [];
            for (let i = 0; i < count; i++) {
            items.push(pool[Math.floor(Math.random() * pool.length)]);
            }
            text = items.join(' ');
        }
        return text;
    };


    const themes = {
    words: { color: 'purple', icon: '📝', name: 'Kelimeler' },
    sentences: { color: 'blue', icon: '📖', name: 'Cümleler' },
    code: { color: 'green', icon: '💻', name: 'Kod' },
    numbers: { color: 'orange', icon: '🔢', name: 'Sayılar' }
    };

    // const generateText = () => {
    //     const library = textLibrary[mode][difficulty];
    //     let text = '';
        
    //     if (mode === 'words' || mode === 'numbers') {
    //     const wordCount = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 70;
    //     const words = [];
    //     for (let i = 0; i < wordCount; i++) {
    //         words.push(library[Math.floor(Math.random() * library.length)]);
    //     }
    //     text = words.join(' ');
    //     } else {
    //     const sentenceCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
    //     const sentences = [];
    //     for (let i = 0; i < sentenceCount; i++) {
    //         sentences.push(library[Math.floor(Math.random() * library.length)]);
    //     }
    //     text = sentences.join(' ');
    //     }
        
    //     return text;
    // };

    const startGame = () => {
        if (!libraryForMode) return;
        const text = generateText();
        setCurrentText(text);
        setUserInput('');
        setTimeLeft(timeLimit);
        setWpm(0);
        setRawWpm(0);
        setAccuracy(100);
        setTotalChars(0);
        setCorrectChars(0);
        setIncorrectChars(0);
        setWordsCompleted(0);
        setCurrentWordIndex(0);
        setCombo(0);
        setMaxCombo(0);
        setMistakes([]);
        setGameState('playing');
        setIsPaused(false);
        startTimeRef.current = Date.now();
        
        setTimeout(() => {
        inputRef.current?.focus();
        }, 100);
    };

    const calculateStats = () => {
        const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
        const wordsTyped = userInput.trim().split(/\s+/).length;
        const charsTyped = userInput.length;
        
        const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;
        const calculatedRawWpm = Math.round(charsTyped / 5 / timeElapsed) || 0;
        const calculatedAccuracy = totalChars > 0 
        ? Math.round((correctChars / totalChars) * 100) 
        : 100;
        
        setWpm(calculatedWpm);
        setRawWpm(calculatedRawWpm);
        setAccuracy(calculatedAccuracy);
    };

    const handleInputChange = (e) => {
        if (gameState !== 'playing' || isPaused) return;
        
        const value = e.target.value;
        const currentChar = currentText[userInput.length];
        const typedChar = value[value.length - 1];
        
        if (value.length > userInput.length) {
        // Character added
        setTotalChars(prev => prev + 1);
        
        if (typedChar === currentChar) {
            setCorrectChars(prev => prev + 1);
            setCombo(prev => {
            const newCombo = prev + 1;
            setMaxCombo(max => Math.max(max, newCombo));
            return newCombo;
            });
        } else {
            setIncorrectChars(prev => prev + 1);
            setCombo(0);
            setMistakes(prev => [...prev, { char: currentChar, typed: typedChar, index: userInput.length }]);
        }
        
        // Check for word completion
        if (typedChar === ' ' && currentChar === ' ') {
            setWordsCompleted(prev => prev + 1);
            setCurrentWordIndex(prev => prev + 1);
        }
        }
        
        setUserInput(value);
        
        if (value === currentText) {
        finishGame();
        }
    };

    const finishGame = () => {
        clearInterval(timerRef.current);
        calculateStats();
        setGameState('finished');
        
        // Save best score
        const key = `${mode}-${difficulty}`;
        const currentScore = {
        wpm,
        accuracy,
        date: new Date().toISOString()
        };
        
        const existingBest = bestScores[key];
        if (!existingBest || wpm > existingBest.wpm) {
        setBestScores(prev => ({ ...prev, [key]: currentScore }));
        }
    };

    useEffect(() => {
        if (gameState === 'playing' && !isPaused) {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
            if (prev <= 1) {
                finishGame();
                return 0;
            }
            return prev - 1;
            });
            calculateStats();
        }, 1000);
        }
        
        return () => clearInterval(timerRef.current);
    }, [gameState, isPaused]);

    const getCharClass = (index) => {
        if (index < userInput.length) {
        return userInput[index] === currentText[index] ? 'text-green-400' : 'text-red-400 bg-red-400/20';
        }
        if (index === userInput.length) {
        return 'bg-cyan-400/30 animate-pulse';
        }
        return 'text-gray-400';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Keyboard className="text-cyan-400" size={48} />
                Hız Yazma Oyunu
                <Zap className="text-yellow-400" size={48} />
            </h1>
            <p className="text-slate-300 text-lg">Yazma hızınızı test edin ve geliştirin!</p>
            </div>

            {/* Menu Screen */}
            {gameState === 'menu' && (
            <div className="space-y-6">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-cyan-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Oyun Modu Seçin</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Object.entries(themes).map(([key, theme]) => (
                    <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                        mode === key
                            ? `border-${theme.color}-400 bg-${theme.color}-500/20 scale-105`
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        <div className="text-5xl mb-3">{theme.icon}</div>
                        <h3 className="text-white font-bold text-lg">{theme.name}</h3>
                    </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                    <label className="text-white font-medium mb-2 block">Zorluk</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-cyan-400 outline-none"
                    >
                        <option value="easy">Kolay</option>
                        <option value="medium">Orta</option>
                        <option value="hard">Zor</option>
                    </select>
                    </div>

                    <div>
                    <label className="text-white font-medium mb-2 block">Süre</label>
                    <select
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-cyan-400 outline-none"
                    >
                        <option value={30}>30 saniye</option>
                        <option value={60}>60 saniye</option>
                        <option value={120}>2 dakika</option>
                        <option value={180}>3 dakika</option>
                    </select>
                    </div>

                    <div className="flex items-end">
                    <button
                        onClick={startGame}
                        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Play size={24} />
                        Başla
                    </button>
                    </div>
                </div>

                {/* Best Scores */}
                <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    En İyi Skorlarınız
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(themes).map(([key]) => {
                        const best = bestScores[`${key}-${difficulty}`];
                        return (
                        <div key={key} className="bg-black/30 rounded p-3 text-center">
                            <div className="text-2xl mb-1">{themes[key].icon}</div>
                            <p className="text-xs text-gray-400 mb-1">{themes[key].name}</p>
                            {best ? (
                            <>
                                <p className="text-cyan-400 font-bold">{best.wpm} WPM</p>
                                <p className="text-green-400 text-xs">{best.accuracy}% doğru</p>
                            </>
                            ) : (
                            <p className="text-gray-500 text-sm">-</p>
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-3">
                    <Target className="text-purple-400" size={32} />
                    <h3 className="text-white font-bold text-lg">WPM Nedir?</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                    Words Per Minute - Dakikada kaç kelime yazabildiğinizi ölçer. 
                    Profesyonel daktilocular 70-80 WPM civarında yazabilir.
                    </p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="text-green-400" size={32} />
                    <h3 className="text-white font-bold text-lg">Nasıl Geliştirilir?</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                    Düzenli pratik yapın, parmak pozisyonlarına dikkat edin ve 
                    klavyeye bakmadan yazmayı öğrenin. Her gün 15 dakika yeterli!
                    </p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30">
                    <div className="flex items-center gap-3 mb-3">
                    <Award className="text-cyan-400" size={32} />
                    <h3 className="text-white font-bold text-lg">Hedefler</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                    Başlangıç: 20-30 WPM | İyi: 40-50 WPM | 
                    Çok İyi: 60-70 WPM | Profesyonel: 80+ WPM
                    </p>
                </div>
                </div>
            </div>
            )}

            {/* Playing Screen */}
            {gameState === 'playing' && (
            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                    <Timer className="text-cyan-400" size={20} />
                    <span className="text-gray-300 text-sm">Süre</span>
                    </div>
                    <p className="text-white font-bold text-2xl">{formatTime(timeLeft)}</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-purple-400" size={20} />
                    <span className="text-gray-300 text-sm">WPM</span>
                    </div>
                    <p className="text-white font-bold text-2xl">{wpm}</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                    <Target className="text-green-400" size={20} />
                    <span className="text-gray-300 text-sm">Doğruluk</span>
                    </div>
                    <p className="text-white font-bold text-2xl">{accuracy}%</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-yellow-400" size={20} />
                    <span className="text-gray-300 text-sm">Combo</span>
                    </div>
                    <p className="text-white font-bold text-2xl">{combo}</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                    <Keyboard className="text-blue-400" size={20} />
                    <span className="text-gray-300 text-sm">Kelime</span>
                    </div>
                    <p className="text-white font-bold text-2xl">{wordsCompleted}</p>
                </div>
                </div>

                {/* Text Display */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-cyan-500/30">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-3xl">{themes[mode].icon}</span>
                        {themes[mode].name} - {difficulty === 'easy' ? 'Kolay' : difficulty === 'medium' ? 'Orta' : 'Zor'}
                    </h3>
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-2 text-white"
                    >
                        {isPaused ? <Play size={20} /> : <Pause size={20} />}
                        {isPaused ? 'Devam' : 'Duraklat'}
                    </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 mb-4 font-mono text-xl leading-relaxed">
                    {currentText.split('').map((char, index) => (
                        <span
                        key={index}
                        className={`${getCharClass(index)} transition-colors`}
                        >
                        {char}
                        </span>
                    ))}
                    </div>

                    <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={isPaused}
                    className="w-full bg-white/10 text-white rounded-lg p-4 border-2 border-cyan-400 outline-none font-mono text-lg focus:border-cyan-300 disabled:opacity-50"
                    placeholder={isPaused ? "Oyun duraklatıldı..." : "Yazmaya başlayın..."}
                    autoComplete="off"
                    spellCheck={false}
                    />
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(userInput.length / currentText.length) * 100}%` }}
                    />
                </div>
                <p className="text-center text-gray-400 text-sm mt-2">
                    {userInput.length} / {currentText.length} karakter ({Math.round((userInput.length / currentText.length) * 100)}%)
                </p>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-purple-400" />
                    Anlık İstatistikler
                    </h3>
                    <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Raw WPM:</span>
                        <span className="text-white font-bold">{rawWpm}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Doğru Karakter:</span>
                        <span className="text-green-400 font-bold">{correctChars}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Yanlış Karakter:</span>
                        <span className="text-red-400 font-bold">{incorrectChars}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Max Combo:</span>
                        <span className="text-yellow-400 font-bold">{maxCombo}</span>
                    </div>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-red-500/30">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Target className="text-red-400" />
                    Son Hatalar ({mistakes.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                    {mistakes.slice(-5).reverse().map((mistake, index) => (
                        <div key={index} className="bg-red-500/10 rounded p-2 text-sm">
                        <span className="text-gray-400">Beklenen: </span>
                        <span className="text-green-400 font-mono font-bold">'{mistake.char}'</span>
                        <span className="text-gray-400"> → Yazılan: </span>
                        <span className="text-red-400 font-mono font-bold">'{mistake.typed}'</span>
                        </div>
                    ))}
                    {mistakes.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Henüz hata yok! 🎉</p>
                    )}
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Finished Screen */}
            {gameState === 'finished' && (
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-cyan-500/30">
                <div className="text-center mb-8">
                <Trophy className="text-yellow-400 mx-auto mb-4 animate-bounce" size={80} />
                <h2 className="text-4xl font-bold text-white mb-2">Tebrikler!</h2>
                <p className="text-gray-300 text-lg">Yazma testiniz tamamlandı</p>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="text-purple-400" />
                    Hız Sonuçları
                    </h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Net WPM:</span>
                        <span className="text-white font-bold text-3xl">{wpm}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Raw WPM:</span>
                        <span className="text-purple-400 font-bold text-2xl">{rawWpm}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Kelime Sayısı:</span>
                        <span className="text-cyan-400 font-bold text-xl">{wordsCompleted}</span>
                    </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl p-6 border border-green-500/30">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="text-green-400" />
                    Doğruluk Sonuçları
                    </h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Doğruluk:</span>
                        <span className="text-white font-bold text-3xl">{accuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Doğru:</span>
                        <span className="text-green-400 font-bold text-xl">{correctChars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Yanlış:</span>
                        <span className="text-red-400 font-bold text-xl">{incorrectChars}</span>
                    </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    Combo & Başarılar
                    </h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Max Combo:</span>
                        <span className="text-yellow-400 font-bold text-2xl">{maxCombo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Toplam Karakter:</span>
                        <span className="text-orange-400 font-bold text-xl">{totalChars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Hata Oranı:</span>
                        <span className="text-pink-400 font-bold text-xl">
                        {totalChars > 0 ? ((incorrectChars / totalChars) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="text-blue-400" />
                    Performans Değerlendirme
                    </h3>
                    <div className="space-y-3">
                    <div className="text-center py-4">
                        {wpm >= 80 ? (
                        <>
                            <div className="text-5xl mb-2">🏆</div>
                            <p className="text-yellow-400 font-bold text-xl">Profesyonel!</p>
                            <p className="text-gray-300 text-sm">Harika bir performans!</p>
                        </>
                        ) : wpm >= 60 ? (
                        <>
                            <div className="text-5xl mb-2">⭐</div>
                            <p className="text-green-400 font-bold text-xl">Çok İyi!</p>
                            <p className="text-gray-300 text-sm">Ortalamanın üzerinde!</p>
                        </>
                        ) : wpm >= 40 ? (
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
                </div>
                </div>

                {/* Most Common Mistakes */}
                {mistakes.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                    <h3 className="text-white font-bold mb-4">📊 Hata Analizi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mistakes.slice(0, 8).map((mistake, index) => (
                        <div key={index} className="bg-red-500/10 rounded p-3 text-center">
                        <p className="text-gray-400 text-xs mb-1">Beklenen → Yazılan</p>
                        <p className="font-mono">
                            <span className="text-green-400 font-bold">'{mistake.char}'</span>
                            <span className="text-gray-500 mx-1">→</span>
                            <span className="text-red-400 font-bold">'{mistake.typed}'</span>
                        </p>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                <button
                    onClick={startGame}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                >
                    <RefreshCw size={24} />
                    Tekrar Dene
                </button>
                <button
                    onClick={() => setGameState('menu')}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-lg transition-all flex items-center gap-2"
                >
                    <Settings size={24} />
                    Ayarlara Dön
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
    );
    };

export default TypingSpeedGame;