import React, { useState, useEffect } from "react";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [size, setSize] = useState(3);
  const [difficulty, setDifficulty] = useState("easy");
  const [stats, setStats] = useState({ x: 0, o: 0, ties: 0 });
  const [history, setHistory] = useState([]);
  const [moveTime, setMoveTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [theme, setTheme] = useState("classic");
  const [showHistory, setShowHistory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Oyunun başlayıp başlamadığını takip etmek için

  // Oyunu sıfırla
  useEffect(() => {
    resetGame();
  }, [size]);

  // Zamanlayıcı - artık gameStarted'a bağlı
  useEffect(() => {
    if (timer) {
      clearInterval(timer);
    }

    if (!gameOver && gameStarted) {
      const newTimer = setInterval(() => {
        setMoveTime(prev => prev + 1);
      }, 1000);
      setTimer(newTimer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameOver, gameStarted]);

  // Oyunu sıfırlayan fonksiyon
  const resetGame = () => {
    setBoard(Array(size * size).fill(null));
    setGameOver(false);
    setWinner(null);
    setIsXNext(true);
    setMoveTime(0);
    setHistory([]);
    setGameStarted(false); // Oyun sıfırlandığında, başlamamış olarak işaretlenir
  };

  // Minimax algoritması ile AI hamlesi (Hard mode için)
  const minimax = (board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const winner = checkWinner(board);

    // Terminal durumları
    if (winner === 'O') return 10 - depth; // AI kazandı (daha hızlı kazanmayı tercih et)
    if (winner === 'X') return depth - 10; // İnsan kazandı
    if (board.every(cell => cell !== null)) return 0; // Beraberlik

    if (isMaximizing) {
      // AI'nin sırası (O)
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return bestScore;
    } else {
      // İnsanın sırası (X)
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return bestScore;
    }
  };

  // En iyi hamleyi bul (minimax kullanarak)
  const findBestAIMove = (board) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  // Gelişmiş AI mantığı
  const aiMove = (board) => {
    // Zor seviyede minimax algoritması kullan
    if (difficulty === "hard") {
      // 3x3 için minimax kullan (performans için)
      if (size === 3) {
        return findBestAIMove([...board]);
      }

      // 4x4 ve 5x5 için heuristik yaklaşım (minimax çok yavaş olur)
      // 1. Kazanma hamlesi varsa yap
      const winMove = findBestMove(board, "O");
      if (winMove !== -1) return winMove;

      // 2. Rakibin kazanma hamlesi varsa engelle
      const blockMove = findBestMove(board, "X");
      if (blockMove !== -1) return blockMove;

      // 3. Merkez boşsa al
      const center = Math.floor((size * size) / 2);
      if (board[center] === null) return center;

      // 4. Köşeler boşsa tercih et
      const corners = [0, size - 1, size * (size - 1), size * size - 1];
      const emptyCorners = corners.filter(index => board[index] === null);
      if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }
    }

    // Kolay seviye için rastgele hamle
    const emptySquares = board
      .map((val, index) => (val === null ? index : null))
      .filter(val => val !== null);

    if (emptySquares.length === 0) return -1;
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Kazanma kontrolü için en iyi hamleyi bulma
  const findBestMove = (board, player) => {
    // Yatay, dikey ve çapraz kontroller
    for (let i = 0; i < size; i++) {
      // Yatay kontrol
      const rowStart = i * size;
      const row = board.slice(rowStart, rowStart + size);
      const rowEmpty = row.findIndex((val, idx) => val === null);

      if (rowEmpty !== -1 && countInArray(row, player) === size - 1) {
        return rowStart + rowEmpty;
      }

      // Dikey kontrol
      const colValues = [];
      for (let j = 0; j < size; j++) {
        colValues.push(board[i + j * size]);
      }

      const colEmpty = colValues.findIndex(val => val === null);
      if (colEmpty !== -1 && countInArray(colValues, player) === size - 1) {
        return i + colEmpty * size;
      }
    }

    // Çapraz kontrol (soldan sağa)
    const diag1 = [];
    for (let i = 0; i < size; i++) {
      diag1.push(board[i * size + i]);
    }

    const diag1Empty = diag1.findIndex(val => val === null);
    if (diag1Empty !== -1 && countInArray(diag1, player) === size - 1) {
      return diag1Empty * size + diag1Empty;
    }

    // Çapraz kontrol (sağdan sola)
    const diag2 = [];
    for (let i = 0; i < size; i++) {
      diag2.push(board[i * size + (size - 1 - i)]);
    }

    const diag2Empty = diag2.findIndex(val => val === null);
    if (diag2Empty !== -1 && countInArray(diag2, player) === size - 1) {
      return diag2Empty * size + (size - 1 - diag2Empty);
    }

    return -1;
  };

  // Dizide belirli bir değerin kaç kez geçtiğini saymak için yardımcı fonksiyon
  const countInArray = (array, value) => {
    return array.filter(item => item === value).length;
  };

  // Kazananı kontrol eden fonksiyon
  const checkWinner = (board) => {
    // Yatay kontrol
    for (let i = 0; i < size; i++) {
      const rowStart = i * size;
      const rowEnd = rowStart + size;
      const row = board.slice(rowStart, rowEnd);

      if (row[0] && row.every(cell => cell === row[0])) {
        return row[0];
      }
    }

    // Dikey kontrol
    for (let i = 0; i < size; i++) {
      const col = [];
      for (let j = 0; j < size; j++) {
        col.push(board[i + j * size]);
      }

      if (col[0] && col.every(cell => cell === col[0])) {
        return col[0];
      }
    }

    // Çapraz kontrol (soldan sağa)
    const diag1 = [];
    for (let i = 0; i < size; i++) {
      diag1.push(board[i * size + i]);
    }

    if (diag1[0] && diag1.every(cell => cell === diag1[0])) {
      return diag1[0];
    }

    // Çapraz kontrol (sağdan sola)
    const diag2 = [];
    for (let i = 0; i < size; i++) {
      diag2.push(board[i * size + (size - 1 - i)]);
    }

    if (diag2[0] && diag2.every(cell => cell === diag2[0])) {
      return diag2[0];
    }

    return null;
  };

  // AI'nin hareketini gerçekleştir
  const aiTurn = (newBoard) => {
    setTimeout(() => {
      const aiIndex = aiMove(newBoard);
      if (aiIndex === -1) return; // Eğer yapılacak hamle kalmadıysa

      newBoard[aiIndex] = "O";

      // Hamleyi geçmişe ekle
      setHistory(prev => [...prev, {
        player: "O",
        position: aiIndex,
        board: [...newBoard],
        time: moveTime
      }]);

      setBoard([...newBoard]);
      setIsXNext(true);

      const winnerResult = checkWinner(newBoard);
      if (winnerResult) {
        handleGameEnd(winnerResult);
      } else if (newBoard.every(cell => cell !== null)) {
        handleGameEnd(null); // Beraberlik
      }
    }, 500);
  };

  // Oyun sonunu işle
  const handleGameEnd = (winnerResult) => {
    setGameOver(true);
    setWinner(winnerResult);

    // İstatistikleri güncelle
    setStats(prev => {
      if (winnerResult === "X") {
        return { ...prev, x: prev.x + 1 };
      } else if (winnerResult === "O") {
        return { ...prev, o: prev.o + 1 };
      } else {
        return { ...prev, ties: prev.ties + 1 };
      }
    });

    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Kareye tıklama
  const handleClick = (index) => {
    if (board[index] || gameOver) return;

    // Eğer oyun henüz başlamamışsa, ilk tıklamada başlat
    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    // Hamleyi geçmişe ekle
    setHistory(prev => [...prev, {
      player: isXNext ? "X" : "O",
      position: index,
      board: [...newBoard],
      time: moveTime
    }]);

    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winnerResult = checkWinner(newBoard);
    if (winnerResult) {
      handleGameEnd(winnerResult);
    } else if (newBoard.every(cell => cell !== null)) {
      handleGameEnd(null); // Beraberlik
    } else if (isXNext && difficulty !== "none") {
      // AI sırası
      aiTurn(newBoard);
    }
  };

  // Kare render fonksiyonu
  const renderSquare = (index) => {
    const value = board[index];
    let cellClass = "w-16 h-16 md:w-20 md:h-20 text-3xl font-bold flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out";

    // Temaya göre hücre stilini ayarla
    if (theme === "classic") {
      cellClass += " bg-gray-700 hover:bg-gray-600 border-2 border-gray-500";
    } else if (theme === "neon") {
      cellClass += " bg-gray-900 hover:bg-gray-800 border-2 border-purple-500 text-neon";
    } else if (theme === "minimal") {
      cellClass += " bg-gray-100 hover:bg-gray-200 text-gray-800";
    }

    // X ve O için stiller
    const xClass = theme === "neon" ? "text-cyan-400" : (theme === "minimal" ? "text-blue-600" : "text-blue-400");
    const oClass = theme === "neon" ? "text-pink-400" : (theme === "minimal" ? "text-red-600" : "text-red-400");

    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        className={cellClass}
      >
        {value === "X" && <span className={xClass}>X</span>}
        {value === "O" && <span className={oClass}>O</span>}
      </button>
    );
  };

  // Yeni oyun başlatma
  const startNewGame = () => {
    resetGame();
  };

  // Zorluk seviyesi değiştirme
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    resetGame();
  };

  // Oyun alanı boyutu değiştirme
  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
  };

  // Tema değiştirme
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // İstatistikleri sıfırlama
  const resetStats = () => {
    setStats({ x: 0, o: 0, ties: 0 });
  };

  // Oyun modu seçimi (AI veya 2 oyunculu)
  const handleModeChange = (e) => {
    setDifficulty(e.target.value);
    resetGame();
  };

  // Oyun durumu mesajı
  const getStatusMessage = () => {
    if (gameOver) {
      if (winner) {
        return `${winner} kazandı!`;
      }
      return "Beraberlik!";
    }

    if (!gameStarted) {
      return "İlk hamleyi yaparak oyunu başlat";
    }

    return `Sıradaki: ${isXNext ? "X" : "O"}`;
  };

  // Oyun geçmişini göster
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Ana tema sınıfları
  const getThemeClasses = () => {
    if (theme === "classic") {
      return "bg-gray-800 text-white";
    } else if (theme === "neon") {
      return "bg-black text-purple-300";
    } else {
      return "bg-white text-gray-800";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${getThemeClasses()}`}>
      <h1 className="text-4xl font-bold mb-4">Tic Tac Toe</h1>

      {/* Ayarlar Paneli */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-xl">
        <div className="flex flex-col">
          <label className="mb-1 text-sm">Oyun Modu</label>
          <select
            value={difficulty}
            onChange={handleModeChange}
            className="bg-opacity-20 bg-gray-700 p-2 rounded-lg"
          >
            <option value="none">İki Oyunculu</option>
            <option value="easy">Kolay AI</option>
            <option value="hard">Zor AI</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm">Boyut</label>
          <select
            value={size}
            onChange={handleSizeChange}
            className="bg-opacity-20 bg-gray-700 p-2 rounded-lg"
          >
            <option value="3">3x3</option>
            <option value="4">4x4</option>
            <option value="5">5x5</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm">Tema</label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="bg-opacity-20 bg-gray-700 p-2 rounded-lg"
          >
            <option value="classic">Klasik</option>
            <option value="neon">Neon</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      {/* Oyun Durumu */}
      <div className={`flex justify-between items-center w-full max-w-xl mb-4 p-3 rounded-lg ${theme === "neon" ? "bg-gray-900 border border-purple-500" : "bg-opacity-20 bg-gray-700"}`}>
        <div className="flex items-center">
          <div className="mr-4">
            <span className="text-lg font-semibold">{getStatusMessage()}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">⏱️</span>
            <span>{moveTime}s</span>
          </div>
        </div>
        <button
          onClick={startNewGame}
          className={`p-2 rounded-full ${theme === "neon" ? "bg-purple-800 text-purple-200 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-500"}`}
        >
          🔄
        </button>
      </div>

      {/* Oyun Tahtası */}
      <div
        className={`grid gap-1 mb-6 p-2 rounded-lg ${theme === "neon" ? "bg-gray-900 border border-purple-500" : (theme === "minimal" ? "shadow-lg bg-gray-50" : "bg-gray-700")}`}
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {Array.from({ length: size * size }).map((_, index) => renderSquare(index))}
      </div>

      {/* İstatistikler */}
      <div className={`w-full max-w-xl grid grid-cols-3 gap-2 mb-6 p-4 rounded-lg ${theme === "neon" ? "bg-gray-900 border border-purple-500" : "bg-opacity-20 bg-gray-700"}`}>
        <div className="flex flex-col items-center">
          <span className="text-sm">X Kazandı</span>
          <span className={`text-xl font-bold ${theme === "neon" ? "text-cyan-400" : "text-blue-400"}`}>{stats.x}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm">Beraberlik</span>
          <span className="text-xl font-bold">{stats.ties}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm">O Kazandı</span>
          <span className={`text-xl font-bold ${theme === "neon" ? "text-pink-400" : "text-red-400"}`}>{stats.o}</span>
        </div>
      </div>

      {/* Geçmiş ve Kontroller */}
      <div className="w-full max-w-xl flex justify-between">
        <button
          onClick={toggleHistory}
          className={`px-4 py-2 rounded-lg ${theme === "neon" ? "bg-purple-800 hover:bg-purple-700" : (theme === "minimal" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-blue-600 hover:bg-blue-500")}`}
        >
          {showHistory ? "Geçmişi Gizle" : "Geçmişi Göster"}
        </button>

        <button
          onClick={resetStats}
          className={`px-4 py-2 rounded-lg ${theme === "neon" ? "bg-gray-800 hover:bg-gray-700" : (theme === "minimal" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-600 hover:bg-gray-500")}`}
        >
          İstatistikleri Sıfırla
        </button>
      </div>

      {/* Hamle Geçmişi */}
      {showHistory && (
        <div className={`w-full max-w-xl mt-6 p-4 rounded-lg overflow-auto max-h-60 ${theme === "neon" ? "bg-gray-900 border border-purple-500" : "bg-opacity-20 bg-gray-700"}`}>
          <h3 className="font-bold mb-2">Hamle Geçmişi</h3>
          <ul>
            {history.map((move, idx) => (
              <li key={idx} className="mb-1 flex justify-between">
                <span>{idx + 1}. {move.player} oyuncusu ({Math.floor(move.position / size)},{move.position % size}) pozisyonuna oynadı</span>
                <span>{move.time}s</span>
              </li>
            ))}
            {history.length === 0 && <li>Henüz hamle yapılmadı</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;