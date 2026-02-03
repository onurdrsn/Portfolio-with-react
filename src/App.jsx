import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

// Navigation component with contact handler
function Navigation() {
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
                        <Link
                            to="/"
                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
                        >
                            {t('nav.home')}
                        </Link>
                        <Link
                            to="/42calculator"
                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
                        >
                            {t('nav.calculator')}
                        </Link>
                        <Link
                            to="/games"
                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
                        >
                            {t('nav.games')}
                        </Link>
                        <button
                            onClick={handleContactClick}
                            className="ml-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-violet-500/50"
                        >
                            {t('nav.contact')}
                        </button>
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function App() {
    return (
        <Router>
            <div className='bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 min-h-screen font-inter'>
                <Navigation />

                <Routes>
                    <Route path="/" element={<MainPage />} />
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
    );
}

// Ana sayfa bileşeni - mevcut portföy bileşenlerini içerir
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