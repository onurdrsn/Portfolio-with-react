import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { 
  BrainCircuit, 
  HelpCircle, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  Eye,
  Info,
  Flame,
  Bot,
  Zap,
  Loader2,
  Search,
  X,
  Grid,
  Play,
  Lock
} from 'lucide-react';

import { STORIES, normalizePuzzleText, evaluateStoryQuestion } from './storyPuzzlesData';
export { STORIES, normalizePuzzleText, evaluateStoryQuestion };

const WORKER_URL = import.meta.env.VITE_API_URL || 'https://portfolio-worker.onurd.com.tr';

export const SURRENDER_LOCKOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getSurrenderedMap = () => {
  try {
    const raw = localStorage.getItem('story_puzzle_surrenders_v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveSurrenderedMap = (map) => {
  try {
    localStorage.setItem('story_puzzle_surrenders_v1', JSON.stringify(map));
  } catch {}
};

export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Deterministic daily story index calculator (No cronjob)
const getDailyStoryIndex = (total) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
};

export default function StoryPuzzle() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'tr';
  const isTr = currentLang.startsWith('tr');

  const [storyPool, setStoryPool] = useState(STORIES);
  const dailyIndex = getDailyStoryIndex(storyPool.length);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(dailyIndex);
  
  // Modals & Drawers
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('Tümü');

  const [useCloudflareAi, setUseCloudflareAi] = useState(false);
  const [generatingAiStory, setGeneratingAiStory] = useState(false);

  const story = storyPool[selectedStoryIndex] || STORIES[0];

  const [questionInput, setQuestionInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [isThinking, setIsThinking] = useState(false); // Typing indicator state
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // 24-hour Surrender Lockout State
  const [surrenderTimestamp, setSurrenderTimestamp] = useState(null);
  const [remainingSurrenderSec, setRemainingSurrenderSec] = useState(0);

  const isSurrendered = !isSolved && !!surrenderTimestamp && remainingSurrenderSec > 0;

  const chatEndRef = useRef(null);

  // Sync surrender status whenever selected story changes
  useEffect(() => {
    if (!story?.id) return;
    const surrenders = getSurrenderedMap();
    const ts = surrenders[story.id];
    if (ts) {
      const diffMs = (ts + SURRENDER_LOCKOUT_MS) - Date.now();
      if (diffMs > 0) {
        setSurrenderTimestamp(ts);
        setRemainingSurrenderSec(Math.ceil(diffMs / 1000));
        setShowFullAnswer(true);
        return;
      } else {
        // 24 hours passed, clean up expired lockout
        delete surrenders[story.id];
        saveSurrenderedMap(surrenders);
      }
    }
    setSurrenderTimestamp(null);
    setRemainingSurrenderSec(0);
  }, [story?.id]);

  // Live 24-hour countdown ticker when surrendered
  useEffect(() => {
    if (!surrenderTimestamp) return;

    const tick = () => {
      const diffMs = (surrenderTimestamp + SURRENDER_LOCKOUT_MS) - Date.now();
      if (diffMs <= 0) {
        // Expired! Reactivate story for solving/questioning
        setSurrenderTimestamp(null);
        setRemainingSurrenderSec(0);
        const surrenders = getSurrenderedMap();
        if (story?.id) {
          delete surrenders[story.id];
          saveSurrenderedMap(surrenders);
        }
      } else {
        setRemainingSurrenderSec(Math.ceil(diffMs / 1000));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [surrenderTimestamp, story?.id]);

  // Daily Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow - now;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat log
  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLogs, isThinking]);

  const handleSelectStory = (index) => {
    setSelectedStoryIndex(index);
    setLibraryModalOpen(false);
    setChatLogs([]);
    setHintsRevealed(0);
    setGuessInput('');
    setGuessFeedback(null);
    setIsSolved(false);

    const nextStory = storyPool[index];
    if (nextStory?.id) {
      const surrenders = getSurrenderedMap();
      const ts = surrenders[nextStory.id];
      if (ts) {
        const diffMs = (ts + SURRENDER_LOCKOUT_MS) - Date.now();
        if (diffMs > 0) {
          setSurrenderTimestamp(ts);
          setRemainingSurrenderSec(Math.ceil(diffMs / 1000));
          setShowFullAnswer(true);
          return;
        }
      }
    }
    setSurrenderTimestamp(null);
    setRemainingSurrenderSec(0);
    setShowFullAnswer(false);
  };

  const handleSurrender = () => {
    if (isSolved || isSurrendered) return;

    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm(
          isTr
            ? 'Teslim olmak istediğinize emin misiniz? Olay arka planı açılacak ancak 24 saat boyunca bu hikayeye soru yazamayacak ve çözemeyeceksiniz.'
            : 'Are you sure you want to surrender? The solution will be revealed, but this puzzle will be locked for 24 hours.'
        )
      : true;

    if (!confirmed) return;

    const now = Date.now();
    const surrenders = getSurrenderedMap();
    if (story?.id) {
      surrenders[story.id] = now;
      saveSurrenderedMap(surrenders);
    }
    setSurrenderTimestamp(now);
    setRemainingSurrenderSec(Math.ceil(SURRENDER_LOCKOUT_MS / 1000));
    setShowFullAnswer(true);
  };

  // Generate new story with Cloudflare Workers AI
  const handleGenerateAiStory = async () => {
    setGeneratingAiStory(true);
    try {
      const res = await axios.post(`${WORKER_URL}/api/ai/story-generate`);
      if (res.data?.story) {
        const newAiStory = {
          id: `cf-ai-${Date.now()}`,
          ...res.data.story,
          difficultyColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
          rules: [],
          irrelevantKeywords: []
        };
        setStoryPool(prev => [newAiStory, ...prev]);
        setSelectedStoryIndex(0);
        setLibraryModalOpen(false);
        setChatLogs([]);
        setHintsRevealed(0);
        setIsSolved(false);
        setShowFullAnswer(false);
        setUseCloudflareAi(true);
      }
    } catch (err) {
      console.error('Failed to generate story with Workers AI:', err);
    } finally {
      setGeneratingAiStory(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (isSurrendered) return;
    const query = questionInput.trim();
    if (!query || isThinking) return;

    // Instantly append User's Question to Chat Log
    const userLog = {
      id: Date.now(),
      type: 'user',
      question: query
    };
    setChatLogs(prev => [...prev, userLog]);
    setQuestionInput('');
    setIsThinking(true); // Show 3-dot typing animation

    if (useCloudflareAi) {
      // Cloudflare Workers AI Evaluation
      try {
        const res = await axios.post(`${WORKER_URL}/api/ai/story-evaluate`, {
          story,
          question: query
        });

        const data = res.data;
        
        // STRICT ANSWER FORMATTING (No Spoilers on HAYIR or EVET!)
        let finalAnswer = data.answer || 'EVET';
        let finalExplanation = '';

        if (data.status === 'warning' || finalAnswer.includes('UYARI') || finalAnswer.includes('WARNING')) {
          finalAnswer = isTr ? '⚠️ UYARI: Soru Şekli Geçersiz' : '⚠️ WARNING: Invalid Format';
          finalExplanation = isTr 
            ? 'Lütfen sadece "Evet" veya "Hayır" cevabı verilebilecek sorular sorun!' 
            : 'Please ask questions that can only be answered with Yes or No!';
        } else if (finalAnswer.includes('HAYIR') || finalAnswer.includes('NO')) {
          finalAnswer = isTr ? 'HAYIR' : 'NO';
          finalExplanation = ''; // NEVER output extra text on HAYIR!
        } else if (finalAnswer.includes('EVET') || finalAnswer.includes('YES')) {
          finalAnswer = isTr ? 'EVET' : 'YES';
          finalExplanation = ''; // NEVER output extra text on EVET!
        } else if (finalAnswer.includes('Önemsiz') || finalAnswer.includes('Alakasız') || finalAnswer.includes('Irrelevant')) {
          finalAnswer = isTr ? 'Önemsiz' : 'Irrelevant';
          finalExplanation = '';
        }

        setTimeout(() => {
          setChatLogs(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              type: 'ai',
              status: data.status || 'valid',
              answer: finalAnswer,
              explanation: finalExplanation
            }
          ]);
          setIsThinking(false);
        }, 600);

      } catch (err) {
        console.error('Cloudflare Workers AI evaluation failed, falling back to local engine:', err);
        evaluateLocally(query);
      }
    } else {
      // Local Engine Evaluation with simulated thinking delay
      setTimeout(() => {
        evaluateLocally(query);
      }, 700);
    }
  };

  const evaluateLocally = (query) => {
    const result = evaluateStoryQuestion(story, query, isTr);
    setChatLogs(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'ai',
        status: result.status,
        answer: result.answer,
        explanation: result.explanation
      }
    ]);
    setIsThinking(false);
  };

  const handleRevealHint = () => {
    const hintsList = isTr ? story.hintsTr : story.hintsEn;
    if (hintsRevealed < hintsList.length) {
      setHintsRevealed(prev => prev + 1);
    }
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (isSurrendered) return;
    if (!guessInput.trim()) return;

    const lowerGuess = guessInput.toLowerCase();
    const matchedCount = (story.keyFacts || []).filter(fact => lowerGuess.includes(fact)).length;
    const matchRatio = matchedCount / (story.keyFacts?.length || 1);

    if (matchRatio >= 0.35 || matchedCount >= 2) {
      setIsSolved(true);
      setShowFullAnswer(true);
      setGuessModalOpen(false);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      setGuessFeedback({
        success: true,
        message: isTr ? 'Tebrikler! Hikayenin ana kurgusunu doğru şekilde çözdünüz!' : 'Congratulations! You successfully solved the main plot!'
      });
    } else {
      setGuessFeedback({
        success: false,
        message: isTr ? 'Henüz tam olarak doğru değil. Birkaç önemli detayı gözden geçirin ve soru sormaya devam edin!' : 'Not quite right yet. Re-evaluate key facts and keep asking questions!'
      });
    }
  };

  // Filtered stories for the Library Explorer
  const filteredStories = storyPool.filter(s => {
    const matchesSearch = (isTr ? s.titleTr : s.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (isTr ? s.promptTr : s.promptEn).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'Tümü' || s.difficulty.includes(difficultyFilter);
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Bar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl">
          <Link to="/games" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors text-sm">
            ← {t('games.backToHome') || 'Oyunlara Dön'}
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 border border-violet-500/30 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {isTr ? 'Olay Örgüsü Bulmacası' : 'Story Puzzle (Lateral Thinking)'}
              </h1>
              <p className="text-[11px] text-gray-400">Gizemli Olayı Çöz • Evet / Hayır Dedektif Oyunu</p>
            </div>
          </div>

          {/* Cloudflare AI Mode Toggle & AI Generator Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCloudflareAi(!useCloudflareAi)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                useCloudflareAi 
                  ? 'bg-violet-600/30 text-violet-300 border-violet-500 shadow-lg shadow-violet-900/30' 
                  : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:text-gray-200'
              }`}
              title="Cloudflare Workers AI (Llama 3) ile soru değerlendir"
            >
              <Bot className="w-4 h-4 text-violet-400" />
              <span className="hidden md:inline">{useCloudflareAi ? 'Cloudflare AI Modu: Açık' : 'Cloudflare AI Modu'}</span>
            </button>

            <button
              onClick={handleGenerateAiStory}
              disabled={generatingAiStory}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center gap-1.5 disabled:opacity-50"
            >
              {generatingAiStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Üretiliyor...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Yapay Zeka Olayı Üret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Top Bar: Daily Featured Story & Library Explorer Trigger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Daily Auto Story Hero Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-violet-950/60 via-gray-900 to-slate-900 p-5 rounded-2xl border border-violet-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                  {isTr ? 'Günün Olayı' : 'Daily Mystery'}
                </span>
                <span className="text-xs font-mono text-gray-400 bg-gray-950/60 px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  {isTr ? 'Kalan Süre:' : 'Time Left:'} <span className="text-white font-bold">{timeLeft}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span>{STORIES[dailyIndex]?.titleTr}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STORIES[dailyIndex]?.difficultyColor}`}>
                  {STORIES[dailyIndex]?.difficulty}
                </span>
              </h2>
              <p className="text-xs text-gray-300 italic line-clamp-2">
                "{STORIES[dailyIndex]?.promptTr}"
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => handleSelectStory(dailyIndex)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-900/30 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isTr ? 'Günün Olayını Oyna' : 'Play Daily Mystery'}
              </button>
            </div>
          </div>

          {/* Premium Library Explorer Trigger Button */}
          <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-violet-400" />
                {isTr ? 'Hikaye Kütüphanesi' : 'Story Library'}
              </span>
              <h3 className="text-base font-bold text-white">
                {storyPool.length} {isTr ? 'Özel Mantık Bulmacası' : 'Puzzles'}
              </h3>
              <p className="text-xs text-gray-400">
                {isTr ? 'Kütüphaneyi açıp dilediğiniz olayı seçin veya filtreleyin.' : 'Browse full library and pick any mystery.'}
              </p>
            </div>

            <button
              onClick={() => setLibraryModalOpen(true)}
              className="w-full mt-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-violet-300 font-bold text-xs rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2 group"
            >
              <BookOpen className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              {isTr ? 'Kütüphaneyi Aç & Keşfet' : 'Open Story Library'}
            </button>
          </div>

        </div>

        {/* Main Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Mystery Scenario Card & Hints */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> {isTr ? 'Aktif Olay Sonu' : 'Active Mystery'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${story.difficultyColor}`}>
                  {story.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-3">
                {isTr ? story.titleTr : story.titleEn}
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80 italic">
                "{isTr ? story.promptTr : story.promptEn}"
              </p>

              {/* Solved Status, Surrendered Lock, or Guess Button */}
              {isSolved ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isTr ? 'Olay Çözüldü!' : 'Puzzle Solved!'}</span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    {isTr ? 'Tebrikler, hikayeyi başarıyla buldunuz!' : 'Great job uncovering the mystery!'}
                  </p>
                </div>
              ) : isSurrendered ? (
                <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                    <Lock className="w-4 h-4" />
                    <span>{isTr ? 'Teslim Olundu - Çözülemez' : 'Surrendered - Locked'}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    {isTr ? 'Teslim olduğunuz için bu hikayeyi çözemezsiniz. 24 saat sonra aktifleşecektir.' : 'You surrendered. This story cannot be solved and will reactivate in 24 hours.'}
                  </p>
                  <div className="flex items-center justify-center gap-1 font-mono font-bold text-xs text-amber-300 bg-amber-900/40 py-1 px-2.5 rounded-lg border border-amber-500/20 w-fit mx-auto mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isTr ? `Kalan Kilit: ${formatDuration(remainingSurrenderSec)}` : `Lock: ${formatDuration(remainingSurrenderSec)}`}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setGuessModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  {isTr ? 'Hikayeyi Tahmin Et / Çöz' : 'Solve / Guess Story'}
                </button>
              )}

              {/* Reveal Full Answer / Surrender Action */}
              {isSolved ? (
                <button
                  onClick={() => setShowFullAnswer(!showFullAnswer)}
                  className="w-full mt-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showFullAnswer 
                    ? (isTr ? 'Cevabı Gizle' : 'Hide Answer')
                    : (isTr ? 'Tam Hikayeyi Göster' : 'Reveal Full Story')}
                </button>
              ) : isSurrendered ? (
                <div className="w-full mt-3 py-2 text-xs font-semibold text-amber-300/90 flex items-center justify-center gap-1.5 bg-amber-950/20 rounded-xl border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTr ? 'Olay Hep Gösteriliyor (24s Kilitli)' : 'Backstory Always Revealed (24h Lock)'}</span>
                </div>
              ) : (
                <button
                  onClick={handleSurrender}
                  className="w-full mt-3 py-2 text-xs font-semibold text-gray-400 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isTr ? 'Tam Hikayeyi Göster (Teslim Ol)' : 'Reveal Full Story (Surrender)'}</span>
                </button>
              )}

              {/* Full Answer Reveal Box - Always shown when surrendered or solved or manually revealed */}
              {(showFullAnswer || isSurrendered || isSolved) && (
                <div className="mt-4 p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-2 text-xs text-purple-200 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 block">
                      {isTr ? '📖 Gerçek Hikaye Arka Planı (Olay):' : '📖 Full Story Backstory:'}
                    </span>
                    {isSurrendered && (
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(remainingSurrenderSec)}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">{isTr ? story.fullStoryTr : story.fullStoryEn}</p>
                </div>
              )}
            </div>

            {/* Hints Panel */}
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-4 h-4" /> {isTr ? 'İpuçları' : 'Hints'}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {hintsRevealed} / {(isTr ? story.hintsTr : story.hintsEn).length}
                </span>
              </div>

              <div className="space-y-2.5">
                {(isTr ? story.hintsTr : story.hintsEn).slice(0, hintsRevealed).map((hint, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                    <span className="font-bold text-amber-400">{idx + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}

                {hintsRevealed < (isTr ? story.hintsTr : story.hintsEn).length && (
                  <button
                    onClick={handleRevealHint}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isTr ? 'Yeni İpucu Aç' : 'Unlock Next Hint'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Q&A Chat & Input Console */}
          <div className="lg:col-span-2 flex flex-col bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl h-[600px] overflow-hidden">
            
            {/* Console Header */}
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${useCloudflareAi ? 'bg-violet-400 animate-ping' : 'bg-emerald-400 animate-ping'}`}></div>
                <span className="text-sm font-semibold text-gray-200">
                  {useCloudflareAi ? 'Cloudflare Workers AI Konsolu' : 'Yapay Zeka Soru - Cevap Konsolu'}
                </span>
              </div>
              <span className="text-xs text-gray-400 italic">
                {isTr ? 'Sadece "EVET" veya "HAYIR" verilir (Detay verilmez)' : 'Only "YES" or "NO" given'}
              </span>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatLogs.length === 0 && !isThinking ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                  <HelpCircle className="w-12 h-12 text-gray-700 stroke-[1.5]" />
                  <p className="text-sm">
                    {isTr 
                      ? 'Olay örgüsünü bulmak için soru sormaya başlayın!' 
                      : 'Ask questions to uncover the mystery backstory!'}
                  </p>
                  <div className="text-xs bg-gray-950/80 px-4 py-3 rounded-xl border border-gray-800 max-w-md text-left text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-300">💡 Soru Sorma Kuralları:</p>
                    <p>• "Bir kaza mı oldu?" → <span className="text-emerald-400 font-bold">EVET</span></p>
                    <p>• "Adam doğuştan mı kördü?" → <span className="text-red-400 font-bold">HAYIR</span></p>
                    <p>• "Saat kaçta oldu?" → <span className="text-amber-400 font-bold">Önemsiz</span></p>
                    <p>• "Adam nerede?" → <span className="text-amber-300">⚠️ UCU AÇIK SORU UYARISI</span></p>
                  </div>
                </div>
              ) : (
                <>
                  {chatLogs.map(log => (
                    <div key={log.id} className="space-y-2 animate-fadeIn">
                      {log.type === 'user' ? (
                        /* User Question */
                        <div className="flex justify-end">
                          <div className="bg-violet-600/30 border border-violet-500/30 text-violet-100 text-sm px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                            {log.question}
                          </div>
                        </div>
                      ) : (
                        /* AI Response - STRICT FORMAT (NO EXTRA TEXT ON HAYIR OR EVET) */
                        <div className="flex justify-start">
                          <div className={`text-sm px-5 py-3 rounded-2xl rounded-tl-none max-w-[85%] border shadow-md flex flex-col gap-1 ${
                            log.status === 'warning'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                              : log.status === 'irrelevant'
                              ? 'bg-gray-800/70 border-gray-700 text-gray-300'
                              : log.answer.includes('EVET') || log.answer.includes('YES')
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-red-500/20 border-red-500/40 text-red-200'
                          }`}>
                            <div className="flex items-center gap-2 font-black tracking-wide text-lg">
                              {log.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                              <span>{log.answer}</span>
                            </div>
                            {log.explanation && (
                              <p className="text-xs opacity-90 leading-relaxed font-normal">
                                {log.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 3-Dot Bouncing Typing Indicator Animation */}
                  {isThinking && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-gray-800/80 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Surrender Lockout Banner */}
            {isSurrendered && (
              <div className="mx-4 mb-2 p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">
                    {isTr
                      ? 'Teslim olundu! Olay açıldı, soru sorma ve tahmin etme 24 saat kilitlendi.'
                      : 'Surrendered! Backstory revealed, questioning and solving locked for 24h.'}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-400 shrink-0 ml-2 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/30">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(remainingSurrenderSec)}</span>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleAskQuestion} className="p-4 border-t border-gray-800 bg-gray-950/60 flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={isThinking || isSurrendered}
                placeholder={
                  isSurrendered
                    ? (isTr
                        ? `🔒 Teslim oldunuz: Soru sorma 24 saat kilitli (${formatDuration(remainingSurrenderSec)})`
                        : `🔒 Surrendered: Questioning locked for 24h (${formatDuration(remainingSurrenderSec)})`)
                    : (isTr
                        ? 'Evet/Hayır cevabı verilebilecek bir soru sorun...'
                        : 'Ask a yes/no question...')
                }
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || isThinking || isSurrendered}
                className="px-5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/30 flex items-center justify-center cursor-pointer"
              >
                {isSurrendered ? <Lock className="w-4 h-4 text-gray-400" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Premium Story Library Explorer Modal */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-950/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  {isTr ? 'Hikaye Kütüphanesi & Olay Havuzu' : 'Story Library & Mystery Pool'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isTr ? 'Tüm gizemli olayları keşfedin, zorluk derecesine göre filtreleyin.' : 'Explore all mysteries, filter by difficulty.'}
                </p>
              </div>

              <button 
                onClick={() => setLibraryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 bg-gray-950/40 border-b border-gray-800/60 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTr ? 'Hikaye veya anahtar kelime ara...' : 'Search mystery story...'}
                  className="w-full bg-gray-900 border border-gray-800 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto">
                {['Tümü', 'Kolay', 'Orta', 'Zor'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      difficultyFilter === diff
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid Story Cards */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {filteredStories.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-gray-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-sm">{isTr ? 'Aramanıza uyan hikaye bulunamadı.' : 'No stories found matching your search.'}</p>
                </div>
              ) : (
                filteredStories.map((s, idx) => {
                  const originalIndex = storyPool.findIndex(st => st.id === s.id);
                  const isDaily = originalIndex === dailyIndex;
                  const isSelected = originalIndex === selectedStoryIndex;
                  const surrendersMap = getSurrenderedMap();
                  const storySurrenderTs = surrendersMap[s.id];
                  const isStorySurrendered = Boolean(storySurrenderTs && (Date.now() - storySurrenderTs < SURRENDER_LOCKOUT_MS));

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStory(originalIndex)}
                      className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500 shadow-xl shadow-violet-900/20'
                          : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/80 hover:-translate-y-1'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isDaily && (
                              <span className="text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-amber-400" />
                                {isTr ? 'Günün Olayı' : 'Daily'}
                              </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${s.difficultyColor}`}>
                              {s.difficulty}
                            </span>
                            {isStorySurrendered && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                {isTr ? 'Teslim Olundu' : 'Surrendered'}
                              </span>
                            )}
                          </div>
                          
                          {isSelected && (
                            <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                              {isTr ? 'Seçili' : 'Active'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                          {isTr ? s.titleTr : s.titleEn}
                        </h4>

                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                          "{isTr ? s.promptTr : s.promptEn}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">
                          {s.keyFacts?.length || 0} {isTr ? 'Anahtar İpucu' : 'Key Clues'}
                        </span>

                        <span className="text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {isTr ? 'Oyna' : 'Play'} →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/60 flex justify-between items-center text-xs text-gray-400">
              <span>Toplam {storyPool.length} Olay Bulunuyor</span>
              <button
                onClick={() => setLibraryModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl"
              >
                {isTr ? 'Kapat' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Guess Solution Modal */}
      {guessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                {isTr ? 'Olay Hikayesini Tahmin Et' : 'Guess The Mystery Story'}
              </h3>
              <button 
                onClick={() => setGuessModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {isTr 
                ? 'Olayın arka planında ne olduğunu açıklayın (ör. uçak kazası, kör adam, fedakarlık vs.):' 
                : 'Explain what happened in the backstory (e.g. plane crash, sacrifice, etc.):'}
            </p>

            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <textarea
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                rows={4}
                placeholder={isTr ? 'Hikaye tahmininizi detaylıca yazın...' : 'Write your full story guess...'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-violet-500 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none"
              />

              {guessFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  guessFeedback.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {guessFeedback.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGuessModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  {isTr ? 'Kapat' : 'Close'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-900/30"
                >
                  {isTr ? 'Tahmini Gönder' : 'Submit Guess'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
