import { Link } from "react-router-dom";

function Games() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-8">🎮 Oyunlar</h2>
      <div className="grid gap-6 max-w-3xl mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Link
          to="/games/minesweeper"
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-md transition duration-300"
        >
          <div className="text-4xl mb-2">🧨</div>
          <h3 className="text-lg font-semibold">Mayın Tarlası</h3>
        </Link>

        {/* Tic Tac Toe Linki */}
        <Link
          to="/games/tictactoe"
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-md transition duration-300"
        >
          <div className="text-4xl mb-2">❌⭕</div>
          <h3 className="text-lg font-semibold">Tic Tac Toe</h3>
        </Link>

        <Link
          to="/games/hangman"
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-md transition duration-300"
        >
          <div className="text-4xl mb-2">🧍‍♂️</div>
          <h3 className="text-lg font-semibold">Adam Asmaca</h3>
        </Link>

        <Link
          to="/games/memorygame"
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-md transition duration-300"
        >
          <div className="text-4xl mb-2">🧍‍♂️</div>
          <h3 className="text-lg font-semibold">Hafıza Oyunu</h3>
        </Link>

      </div>

      <div className="text-center mt-10">
        <Link
          to="/"
          className="text-blue-400 hover:underline text-sm inline-block"
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

export default Games;
