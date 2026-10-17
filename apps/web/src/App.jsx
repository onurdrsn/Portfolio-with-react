import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UiVersionProvider, useUiVersion } from './contexts/UiVersionContext';
import LinuxDesktop from './Components/LinuxDesktop';
import CyberDeckHUD from './Components/CyberDeckHUD';
import Version4Home from './Components/Version4/Version4Home';

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
        <nav aria-label="Main Navigation" className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-ink-line">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/assets/logo.svg"
                            alt="Onur Dursun Logo"
                            className="w-8 h-8 rounded object-contain group-hover:opacity-80 transition-opacity"
                        />
                        <span className="font-semibold text-paper tracking-tight text-sm sm:text-base">Onur Dursun</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1 border border-ink-line bg-ink-raised p-1 rounded-md text-xs font-medium">
                        <Link to="/" className={`px-3 py-1.5 rounded transition-colors ${location.pathname === '/' ? 'bg-paper text-ink font-semibold' : 'text-paper-muted hover:text-paper hover:bg-ink-hover'}`}>{t('nav.home') || 'Ana Sayfa'}</Link>
                        <a href="/#projects" className="px-3 py-1.5 text-paper-muted hover:text-paper hover:bg-ink-hover rounded transition-colors">{t('nav.projects') || 'Projeler'}</a>
                        <a href="/#experience" className="px-3 py-1.5 text-paper-muted hover:text-paper hover:bg-ink-hover rounded transition-colors">{t('nav.experience') || 'Deneyim'}</a>
                        <Link to="/blog" className={`px-3 py-1.5 rounded transition-colors ${location.pathname.startsWith('/blog') ? 'bg-paper text-ink font-semibold' : 'text-paper-muted hover:text-paper hover:bg-ink-hover'}`}>Blog</Link>
                        <Link to="/games" className={`px-3 py-1.5 rounded transition-colors ${location.pathname.startsWith('/games') ? 'bg-paper text-ink font-semibold' : 'text-paper-muted hover:text-paper hover:bg-ink-hover'}`}>{t('nav.games') || 'Oyunlar'}</Link>
                        {user?.isAdmin && (
                            <Link to="/admin" className="px-3 py-1.5 font-code text-signal border border-signal/30 rounded transition-colors">{t('nav.admin') || 'Admin'}</Link>
                        )}
                    </div>

                    {/* Right Action Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={handleContactClick} className="px-4 py-2 bg-paper text-ink hover:bg-white text-xs font-semibold rounded-md transition-colors cursor-pointer">{t('nav.contact') || 'İletişim'}</button>
                        <LanguageSelector />
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSelector />
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-expanded={mobileOpen}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            className="p-2 text-paper-muted hover:text-paper bg-ink-raised border border-ink-line rounded-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-ink-raised border-b border-ink-line px-5 py-4 space-y-2 animate-fadeIn">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-paper hover:bg-ink">{t('nav.home') || 'Ana Sayfa'}</Link>
                    <a href="/#projects" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-paper hover:bg-ink">{t('nav.projects') || 'Projeler'}</a>
                    <a href="/#experience" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-paper hover:bg-ink">{t('nav.experience') || 'Deneyim'}</a>
                    <Link to="/blog" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-paper hover:bg-ink">Blog</Link>
                    <Link to="/games" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-paper hover:bg-ink">{t('nav.games') || 'Oyunlar'}</Link>
                    {user?.isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-code text-signal">{t('nav.admin') || 'Admin Paneli'}</Link>
                    )}
                    <button onClick={handleContactClick} className="w-full text-center px-4 py-2.5 bg-paper text-ink font-semibold rounded-md text-sm cursor-pointer mt-2">{t('nav.contact') || 'İletişim'}</button>
                </div>
            )}
        </nav>
    );
}

// Blog Navigation (For /blog, /login, /register, /admin)
function BlogNavigation() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const location = useLocation();
    const isBlogPost = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';

    return (
        <nav aria-label="Blog Navigation" className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-ink-line">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Back Link & Editorial Blog Brand */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {isBlogPost ? (
                            <Link to="/blog" className="text-xs sm:text-sm font-medium text-paper-muted hover:text-paper transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-ink-raised border border-ink-line hover:border-paper/40">
                                <span aria-hidden="true">←</span> {t('nav.backToBlog') ? t('nav.backToBlog').replace(/^←\s*/, '') : 'Blog Listesi'}
                            </Link>
                        ) : (
                            <Link to="/" className="text-xs sm:text-sm font-medium text-paper-muted hover:text-paper transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-ink-raised border border-ink-line hover:border-paper/40">
                                <span aria-hidden="true">←</span> {t('nav.backToPortfolio') ? t('nav.backToPortfolio').replace(/^←\s*/, '') : 'Portfolio'}
                            </Link>
                        )}
                        <div className="h-4 w-px bg-ink-line hidden sm:block"></div>
                        <Link to="/blog" className="flex items-center gap-2 group">
                            <span className="text-base sm:text-lg font-semibold text-paper tracking-tight">
                                Journal <span className="font-code text-xs text-signal font-normal">/ Blog</span>
                            </span>
                        </Link>
                    </div>

                    {/* Auth & Localization Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-code text-paper-muted hidden md:inline-block">
                                    {t('nav.welcomeUser', { username: user.username }) || `@${user.username}`}
                                </span>
                                {user.isAdmin && (
                                    <Link to="/admin" className="px-3 py-1.5 text-signal hover:text-paper bg-signal/10 hover:bg-signal/20 rounded border border-signal/30 transition-colors text-xs font-code">
                                        {t('nav.admin') || 'Admin'}
                                    </Link>
                                )}
                                <button onClick={logout} className="px-3 py-1.5 text-paper-muted hover:text-red-400 bg-ink-raised hover:bg-red-500/10 rounded border border-ink-line hover:border-red-500/30 transition-colors text-xs font-medium cursor-pointer">
                                    {t('nav.logout') || 'Çıkış'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-3 py-1.5 text-paper-muted hover:text-paper hover:bg-ink-raised rounded transition-colors text-xs font-medium">
                                    {t('nav.login') || 'Giriş Yap'}
                                </Link>
                                <Link to="/register" className="px-3 py-1.5 bg-paper text-ink hover:bg-white rounded transition-colors text-xs font-semibold">
                                    {t('nav.register') || 'Kayıt Ol'}
                                </Link>
                            </div>
                        )}
                        <div className="ml-1 pl-2 border-l border-ink-line">
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
                    <div className='bg-ink text-paper min-h-screen font-inter relative'>
                        {/* A11y WCAG 2.4.1 Primary Skip Link: First focusable element */}
                        <a
                            href="#main-content"
                            className="v4-skip-link fixed z-[99999] top-3 left-3 bg-paper text-ink px-4 py-2 rounded font-code text-xs font-bold border border-ink-line shadow-2xl transition-all"
                        >
                            İçeriğe Geç / Skip to Content
                        </a>
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
    if (uiVersion === 'v4') {
        return <Version4Home />;
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