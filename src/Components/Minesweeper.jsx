import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti"; // 🎉

const difficulties = {
  tiny: { size: 4, mines: 2 },
  easy: { size: 8, mines: 10 },
  medium: { size: 12, mines: 20 },
  hard: { size: 16, mines: 40 },
};

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState("easy");
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);

  const { size, mines } = difficulties[difficulty];

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    if (started && !gameOver && !gameWon) {
      timer.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer.current);
  }, [started, gameOver, gameWon]);

  useEffect(() => {
    if (gameWon) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      new Audio("/win.wav").play();
    }
    if (gameOver) {
      new Audio("/explosion.wav").play();
    }
  }, [gameWon, gameOver]);

  const createEmptyBoard = () =>
    Array(size).fill().map(() =>
      Array(size).fill({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      })
    );

    const placeMines = (board, skipR, skipC) => {
      let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      let placed = 0;
      while (placed < mines) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        // İlk tıklama hücresine mayın eklememek için kontrol
        if (!newBoard[r][c].isMine && (r !== skipR || c !== skipC)) {
          newBoard[r][c].isMine = true;
          placed++;
        }
      }
      return calculateNeighborMines(newBoard);
    };
    

  const calculateNeighborMines = (board) =>
    board.map((row, r) =>
      row.map((cell, c) => {
        if (cell.isMine) return cell;
        let count = 0;
        directions.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc].isMine) {
            count++;
          }
        });
        return { ...cell, neighborMines: count };
      })
    );

    const handleClick = (r, c) => {
      if (gameOver || gameWon) return;
    
      const cell = board[r][c];
    
      // Oyun ilk kez başlatılıyor, mayınları yerleştir
      if (!started) {
        const emptyBoard = createEmptyBoard();
        const withMines = placeMines(emptyBoard, r, c); // İlk tıklama için açılış hücresine mayın yerleştirilmez
        withMines[r][c].isRevealed = true;
        if (withMines[r][c].neighborMines === 0) revealEmpty(withMines, r, c);
        setBoard(withMines);
        setStarted(true);
        return;
      }
    
      if (cell.isFlagged || cell.isRevealed) return;
    
      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      if (newBoard[r][c].isMine) {
        newBoard[r][c].isRevealed = true;
        setBoard(newBoard);
        setGameOver(true);
        clearInterval(timer.current);
        return;
      }
    
      newBoard[r][c].isRevealed = true;
      if (newBoard[r][c].neighborMines === 0) {
        revealEmpty(newBoard, r, c);
      }
    
      setBoard(newBoard);
      checkWin(newBoard);
    };    

  const revealEmpty = (board, r, c) => {
    directions.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (
        nr >= 0 && nc >= 0 &&
        nr < size && nc < size &&
        !board[nr][nc].isRevealed &&
        !board[nr][nc].isFlagged
      ) {
        board[nr][nc].isRevealed = true;
        if (board[nr][nc].neighborMines === 0) {
          revealEmpty(board, nr, nc);
        }
      }
    });
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
  
    // Eğer oyun bitmişse, bayrak eklenemez
    if (gameOver || gameWon || board[r][c].isRevealed) return;
  
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const newFlags = flags + (newBoard[r][c].isFlagged ? -1 : 1);
  
    // Eğer bayrak sayısı maximuma ulaşmışsa, oyun bitmeli
    if (newFlags > mines) {
      setGameOver(true);
      new Audio("/explosion.mp3").play();
      return;
    }
  
    // Bayrak ekleme
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
    setFlags(newFlags);  // Bayrak sayısını güncelle
  
    // Yanlış yere bayrak eklendi mi? (mayın olmayan bir hücreye bayrak eklenirse oyun biter)
    if (newBoard[r][c].isFlagged && !newBoard[r][c].isMine) {
      setGameOver(true);
      new Audio("/explosion.mp3").play();
      return;
    }
  
    // Oyun kazandı mı kontrol et
    checkWin(newBoard);
    setBoard(newBoard);
  };  
  
  const checkWin = (board) => {
    const unrevealed = board.flat().filter((c) => !c.isRevealed);
    const minesOnly = unrevealed.every((c) => c.isMine);
    if (minesOnly && unrevealed.length === mines) {
      setGameWon(true);
      clearInterval(timer.current);
    }
  };

  const resetGame = () => {
    clearInterval(timer.current);
    setTime(0);
    setFlags(0);
    setStarted(false);
    setGameOver(false);
    setGameWon(false);
    setBoard(createEmptyBoard());
  };

  const renderCell = (cell, r, c) => {
    const base = "w-8 h-8 md:w-10 md:h-10 border border-gray-600 flex items-center justify-center text-xs md:text-sm font-bold";
    const revealed = cell.isRevealed
      ? cell.isMine
        ? "bg-red-600 text-white"
        : "bg-gray-200 text-gray-800"
      : "bg-gray-800 hover:bg-gray-700 cursor-pointer";

    return (
      <div
        key={`${r}-${c}`}
        className={`${base} ${revealed}`}
        onClick={() => handleClick(r, c)}
        onContextMenu={(e) => handleRightClick(e, r, c)}
      >
        {cell.isRevealed && cell.isMine && "💣"}
        {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
        {!cell.isRevealed && cell.isFlagged && "🚩"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6 px-2 relative overflow-hidden">
      {gameOver && <div className="explosion"></div>}

      <div className="w-full max-w-screen-md">
        <Link to="/games" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Oyunlara Dön
        </Link>
        <h1 className="text-2xl font-bold mb-4 text-center">💣 Mayın Tarlası</h1>

        <div className="flex justify-between mb-2 items-center gap-2 flex-wrap">
          <select
            className="bg-gray-700 text-white px-2 py-1 rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="tiny">Mini (4x4)</option>
            <option value="easy">Kolay (8x8)</option>
            <option value="medium">Orta (12x12)</option>
            <option value="hard">Zor (16x16)</option>
          </select>
          <div className="flex gap-4 text-sm">
            <span>⏱️ Süre: {time}s</span>
            <span>🚩 Bayraklar: {flags} / {mines}</span>
          </div>
          <button
            onClick={() => {
              if (started && !gameOver && !gameWon) {
                clearInterval(timer.current);
                setStarted(false);
              } else if (!gameOver && !gameWon) {
                setStarted(true);
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
          >
            {started ? "Durdur" : "Devam Et"}
          </button>

          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
          >
            Yeniden Başlat
          </button>
        </div>

        {gameOver && <div className="text-red-400 text-center font-semibold mt-2">💥 Oyun Bitti!</div>}
        {gameWon && <div className="text-green-400 text-center font-semibold mt-2">🎉 Kazandınız!</div>}

        <div
          className={`grid gap-0.5 mt-3 mx-auto`}
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: "fit-content",
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => renderCell(cell, r, c))
          )}
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;
