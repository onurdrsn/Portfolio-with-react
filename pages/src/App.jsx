import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UiVersionProvider, useUiVersion } from './contexts/UiVersionContext';
import LinuxDesktop from './Components/LinuxDesktop';
import CyberDeckHUD from './Components/CyberDeckHUD';

// Pages
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

// Components
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import Intro from "./Components/Intro";
import Portfolio from "./Components/Portfolio";
import Timeline from "./Components/Timeline";
import EventCalculator from "./Components/42Calculator";
import Games from "./Components/Games";
import Minesweeper from "./Components/Minesweeper";
import TicTacToe from "./Components/TicTacToe";
import Hangman from './Components/Hangman';
import MemoryGame from './Components/MemoryGame';
import RouterGame from './Components/RouterGame';
import TowerDefense from './Components/TowerDefense';
import TypingSpeedGame from './Components/TypingSpeedGame';
import FlappyBird from './Components/FlappyBird';
import BreakoutGame from './Components/Breakout';
import StoryPuzzle from './Components/StoryPuzzle';
import NeonDuel from './Components/NeonDuel';
import CyberStrike3D from './Components/CyberStrike3D';
import SpaceAce3D from './Components/SpaceAce3D';
import LanguageSelector from './Components/LanguageSelector';

// Main Navigation (For Portfolio and Games)
function MainNavigation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleContactClick = (e) => {
        e.preventDefault();
        setMobileOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/80 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/assets/logo.svg"
                            alt="Onur Dursun Logo Icon"
                            className="w-9 h-9 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="font-bold text-white tracking-tight text-sm sm:text-base group-hover:text-violet-300 transition-colors">Onur Dursun</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800/80">
                        <Link to="/" className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${location.pathname === '/' ? 'bg-violet-600/30 text-white border border-violet-500/30 shadow' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>{t('nav.home') || 'Ana Sayfa'}</Link>
                        <a href="/#projects" className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all">Projeler</a>
                        <a href="/#experience" className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all">Deneyim</a>
                        <Link to="/blog" className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${location.pathname.startsWith('/blog') ? 'bg-violet-600/30 text-white border border-violet-500/30' : 'text-violet-300 hover:text-violet-200 hover:bg-violet-950/40'}`}>Blog</Link>
                        <Link to="/games" className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${location.pathname.startsWith('/games') ? 'bg-violet-600/30 text-white border border-violet-500/30' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>{t('nav.games') || 'Oyunlar'}</Link>
                        {user?.isAdmin && (
                            <Link to="/admin" className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 transition-all">Admin</Link>
                        )}
                    </div>

                    {/* Right Action Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={handleContactClick} className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95">{t('nav.contact') || 'İletişim'}</button>
                        <LanguageSelector />
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSelector />
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-300 hover:text-white bg-gray-900 border border-gray-800 rounded-xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-950 border-b border-gray-800 px-4 py-4 space-y-2 animate-fadeIn">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-200 hover:bg-gray-900">{t('nav.home') || 'Ana Sayfa'}</Link>
                    <a href="/#projects" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-200 hover:bg-gray-900">Projeler</a>
                    <a href="/#experience" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-200 hover:bg-gray-900">Deneyim</a>
                    <Link to="/blog" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-violet-300 hover:bg-gray-900">Blog</Link>
                    <Link to="/games" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-200 hover:bg-gray-900">{t('nav.games') || 'Oyunlar'}</Link>
                    {user?.isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-300 bg-amber-500/10">Admin Paneli</Link>
                    )}
                    <button onClick={handleContactClick} className="w-full text-left px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow">{t('nav.contact') || 'İletişim'}</button>
                </div>
            )}
        </nav>
    );
}

// Blog Navigation (For /blog, /login, /register, /admin)
function BlogNavigation() {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            <span>←</span> Portfolio
                        </Link>
                        <div className="h-4 w-px bg-gray-700"></div>
                        <Link to="/blog" className="flex items-center group">
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-indigo-300 transition-all duration-300">
                                Blog
                            </span>
                        </Link>
                    </div>

                    {/* Auth Area */}
                    <div className="flex items-center space-x-2">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 hidden sm:inline-block">Hoş geldin, <span className="text-white">@{user.username}</span></span>
                                {user.isAdmin && (
                                    <Link to="/admin" className="px-4 py-1.5 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg border border-violet-500/20 transition-all duration-200 text-sm font-medium">
                                        Admin Paneli
                                    </Link>
                                )}
                                <button onClick={logout} className="px-4 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-sm">
                                    Çıkış
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-4 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 text-sm font-medium">
                                    Giriş Yap
                                </Link>
                                <Link to="/register" className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-violet-600/20">
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}
                        <div className="ml-2 pl-2 border-l border-gray-800">
                            <LanguageSelector />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

import { Toaster } from 'react-hot-toast';

// Router for picking the correct Navbar
function AppNavigation() {
    const { uiVersion } = useUiVersion();
    const location = useLocation();

    const isBlogRoute = location.pathname.startsWith('/blog') ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/admin';

    // Hide standard v1 navbar when v2 (Linux Desktop) or v3 (CyberDeck HUD) is active on non-blog/non-admin routes
    if ((uiVersion === 'v2' || uiVersion === 'v3') && !isBlogRoute) {
        return null;
    }

    return isBlogRoute ? <BlogNavigation /> : <MainNavigation />;
}

export default function App() {
    return (
        <AuthProvider>
            <UiVersionProvider>
                <Router>
                    <div className='bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 min-h-screen font-inter'>
                        <AppNavigation />
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: { background: '#111827', color: '#fff', border: '1px solid #374151', padding: '16px' },
                                success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } }
                            }}
                        />

                        <Routes>
                            {/* Main */}
                            <Route path="/" element={<MainPage />} />

                            {/* Blog */}
                            <Route path="/blog" element={<BlogList />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />

                            {/* Auth */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Admin */}
                            <Route path="/admin" element={<AdminPanel />} />

                            {/* Tools */}
                            <Route path="/42calculator" element={<EventCalculator />} />
                            <Route path="/games" element={<Games />} />
                            <Route path="/games/minesweeper" element={<Minesweeper />} />
                            <Route path="/games/tictactoe" element={<TicTacToe />} />
                            <Route path="/games/hangman" element={<Hangman />} />
                            <Route path="/games/memory" element={<MemoryGame />} />
                            <Route path="/games/router" element={<RouterGame />} />
                            <Route path="/games/towerdefense" element={<TowerDefense />} />
                            <Route path="/games/typingspeed" element={<TypingSpeedGame />} />
                            <Route path="/games/flappybird" element={<FlappyBird />} />
                            <Route path="/games/breakout" element={<BreakoutGame />} />
                            <Route path="/games/storypuzzle" element={<StoryPuzzle />} />
                            <Route path="/games/neon-duel" element={<NeonDuel />} />
                            <Route path="/games/cyber-strike-3d" element={<CyberStrike3D />} />
                            <Route path="/games/space-ace-3d" element={<SpaceAce3D />} />
                        </Routes>
                    </div>
                </Router>
            </UiVersionProvider>
        </AuthProvider>
    );
}

const MainPage = () => {
    const { uiVersion } = useUiVersion();

    if (uiVersion === 'v2') {
        return <LinuxDesktop />;
    }
    if (uiVersion === 'v3') {
        return <CyberDeckHUD />;
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <Intro />
            <Portfolio />
            <Timeline />
            <Contact />
            <Footer />
        </div>
    );
};