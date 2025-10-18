// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Mevcut bileşenleri içe aktar
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

export default function App() {
    // const [theme, setTheme] = useState(null);

    // useEffect(() => {
    //     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //         setTheme("dark");
    //     } else {
    //         setTheme("light");
    //     }
    // }, []);

    // const handleThemeChange = () => {
    //     setTheme(theme === "light" ? "dark" : "light");
    // }

    // useEffect(() => {
    //     if (theme === "dark") {
    //         document.documentElement.classList.add("dark");
    //     } else {
    //         document.documentElement.classList.remove("dark");
    //     }
    // }, [theme]);

    // const sun = (
    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //         <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
    //     </svg>
    // );

    // const moon = (
    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //         <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
    //     </svg>
    // );

    return (
        <Router>
            {/* <button type='button' onClick={handleThemeChange} className='fixed p-2 z-10 right-20 top-4 bg-violet-300 dark:bg-orange-300 text-lg rounded-md'>
                {theme === "dark" ? sun : moon}
            </button> */}
            <div className='bg-gray-900 text-gray-200 min-h-screen font-inter'>
                <nav className="shadow-md">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex justify-between">
                            <div className="flex space-x-4">
                                <div>
                                    <Link to="/" className="flex items-center py-5 px-2 text-violet-600 dark:text-blue-400 hover:text-violet-500 dark:hover:text-blue-300">
                                        <span className="font-bold">Portfolio</span>
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Link to="/" className="py-5 px-3 dark:text-gray-300 hover:text-violet-500 dark:hover:text-blue-400">Ana Sayfa</Link>
                                    <Link to="/42calculator" className="py-5 px-3 dark:text-gray-300 hover:text-violet-500 dark:hover:text-blue-400">42 Calculator</Link>
                                    <Link to="/games">Oyunları Görüntüle</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

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
                </Routes>
            </div>
        </Router>
    );
}

// Ana sayfa bileşeni - mevcut portföy bileşenlerini içerir
const MainPage = () => {
    return (
        <div className='max-w-5xl w-11/12 mx-auto'>
            <Intro />
            <Portfolio />
            <Timeline />
            <Contact />
            <Footer />
        </div>
    );
};