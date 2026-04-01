import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
import LanguageSelector from './Components/LanguageSelector';

// Main Navigation (For Portfolio and Games)
function MainNavigation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const handleContactClick = (e) => {
        e.preventDefault();
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
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div>
                        <Link to="/" className="flex items-center group">
                            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-purple-300 transition-all duration-300">
                                Onur Dursun
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-1">
                        <Link to="/" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium">{t('nav.home')}</Link>
                        <Link to="/blog" className="px-4 py-2 text-violet-300 hover:text-violet-200 hover:bg-violet-900/50 rounded-lg transition-all duration-200 font-medium">Blog</Link>
                        {/* <Link to="/42calculator" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium">{t('nav.calculator')}</Link> */}
                        <Link to="/games" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium">{t('nav.games')}</Link>
                        <button onClick={handleContactClick} className="ml-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-violet-500/50">{t('nav.contact')}</button>
                        <LanguageSelector />
                    </div>
                </div>
            </div>
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
    const location = useLocation();
    const isBlogRoute = location.pathname.startsWith('/blog') ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/admin';

    return isBlogRoute ? <BlogNavigation /> : <MainNavigation />;
}

export default function App() {
    return (
        <AuthProvider>
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
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

const MainPage = () => {
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