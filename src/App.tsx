import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import keyIcon from './assets/key.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

const API = '';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface ScoreRecord {
  score: number;
  result: 'win' | 'loss' | 'tie';
  played_at: string;
}

function Game() {
  const { user, logout, saveScore } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    setBoxes(
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        isOpen: false,
        hasTreasure: i === treasureBoxIndex,
      }))
    );
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/api/scores/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {
      // ignore
    }
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    const box = boxes.find((b) => b.id === boxId);
    new Audio(box?.hasTreasure === false ? evilLaughSound : chestOpenSound).play();

    setBoxes((prev) => {
      const updated = prev.map((b) => {
        if (b.id === boxId && !b.isOpen) {
          setScore((s) => (b.hasTreasure ? s + 100 : s - 50));
          return { ...b, isOpen: true };
        }
        return b;
      });
      const treasureFound = updated.some((b) => b.isOpen && b.hasTreasure);
      const allOpened = updated.every((b) => b.isOpen);
      if (treasureFound || allOpened) setGameEnded(true);
      return updated;
    });
  };

  useEffect(() => {
    if (!gameEnded || scoreSaved) return;
    setScoreSaved(true);
    const result: 'win' | 'loss' | 'tie' = score > 0 ? 'win' : score < 0 ? 'loss' : 'tie';
    if (user) saveScore(score, result).then(() => fetchHistory());
  }, [gameEnded]);

  const resultLabel = score > 0 ? 'Win' : score === 0 ? 'Tie' : 'Loss';
  const resultColor =
    score > 0 ? 'text-green-600' : score === 0 ? 'text-amber-500' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 relative">
      {/* Top-right auth bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {user ? (
          <>
            <span className="text-sm text-amber-800 bg-amber-100 border border-amber-200 rounded-full px-3 py-1">
              👤 {user.username}
            </span>
            <button
              onClick={logout}
              className="text-sm text-amber-600 hover:text-amber-900 bg-white border border-amber-200 rounded-full px-3 py-1 transition-colors hover:bg-amber-50"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-full px-4 py-1.5 transition-colors shadow-sm"
          >
            Login
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-amber-900 mb-3">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
          <p className="text-amber-700 mb-1">Click on the treasure chests to discover what's inside!</p>
          <p className="text-amber-500 text-sm">💰 Treasure: +$100 &nbsp;|&nbsp; 💀 Skeleton: -$50</p>
        </div>

        {/* Score */}
        <div className="mb-10">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/80 border-2 border-amber-300 rounded-2xl shadow-md">
            <span className="text-amber-700 font-medium">Score</span>
            <span className={`text-3xl font-bold ${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${score}
            </span>
          </div>
        </div>

        {/* Chests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {boxes.map((box) => (
            <motion.div
              key={box.id}
              className="flex flex-col items-center"
              style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 8 8, pointer` }}
              whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
              whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
              onClick={() => openBox(box.id)}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: box.isOpen ? 180 : 0, scale: box.isOpen ? 1.1 : 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="relative"
              >
                <img
                  src={
                    box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest
                  }
                  alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!') : 'Treasure Chest'}
                  className="w-44 h-44 object-contain drop-shadow-lg"
                />
                {box.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2"
                  >
                    {box.hasTreasure ? (
                      <div className="text-2xl animate-bounce">✨💰✨</div>
                    ) : (
                      <div className="text-2xl animate-pulse">💀👻💀</div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              <div className="mt-3 text-center h-10 flex items-center">
                {box.isOpen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className={`text-base font-semibold px-3 py-1 rounded-lg ${
                      box.hasTreasure
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {box.hasTreasure ? '+$100' : '-$50'}
                  </motion.div>
                ) : (
                  <span className="text-amber-500 text-sm">Click to open!</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game Over panel */}
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/90 border-2 border-amber-300 rounded-2xl shadow-lg p-6 text-center mb-4">
              <h2 className="text-xl font-semibold text-amber-800 mb-1">Game Over</h2>
              <div className={`text-5xl font-bold my-3 ${resultColor}`}>{resultLabel}</div>
              <p className="text-amber-700">
                Final Score:{' '}
                <span className={`font-bold ${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${score}
                </span>
              </p>
              <p className="text-sm text-amber-500 mt-1">
                {boxes.some((b) => b.isOpen && b.hasTreasure)
                  ? 'Treasure found! Well done! 🎉'
                  : 'Better luck next time! 💀'}
              </p>

              {user ? (
                <p className="text-xs text-green-600 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                  ✅ Score saved to your account
                </p>
              ) : (
                <p className="text-xs text-amber-400 mt-3">
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="underline hover:text-amber-600"
                  >
                    Login
                  </button>{' '}
                  to save your scores
                </p>
              )}
            </div>

            <Button
              onClick={initializeGame}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-base rounded-xl"
            >
              Play Again
            </Button>

            {/* Score history */}
            {user && history.length > 0 && (
              <div className="mt-4 bg-white/80 rounded-xl border border-amber-200 p-4">
                <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
                  Your Recent Games
                </h3>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm py-1.5 px-2 rounded-lg hover:bg-amber-50"
                    >
                      <span
                        className={`font-medium ${
                          h.result === 'win'
                            ? 'text-green-600'
                            : h.result === 'loss'
                            ? 'text-red-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {h.result === 'win' ? '🏆' : h.result === 'loss' ? '💀' : '➖'}{' '}
                        <span className="capitalize">{h.result}</span>
                      </span>
                      <span className={`font-semibold ${h.score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${h.score}
                      </span>
                      <span className="text-amber-400 text-xs">
                        {new Date(h.played_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Game />
    </AuthProvider>
  );
}
