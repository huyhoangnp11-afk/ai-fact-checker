import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hook
import { useMemeGame, difficultySettings, getLevelFromXP } from '../hooks/useMemeGame';

// Components
import GameMenu from './MemeGame/GameMenu';
import GameHeader from './MemeGame/GameHeader';
import MemeCard from './MemeGame/MemeCard';
import WordGrid from './MemeGame/WordGrid';
import GameControls from './MemeGame/GameControls';
import GameOver from './MemeGame/GameOver';
import Leaderboard from './MemeGame/Leaderboard';

const MemeGame = () => {
    const navigate = useNavigate();
    const { width, height } = useWindowSize();
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const {
        // State
        currentRound, score, lives, selectedWords, options, gameState, timeLeft,
        showFeedback, streak, roundComplete, difficulty, particles,
        showConfetti, availablePowerUps, shieldActive, doublePoints, frozenTime,
        newAchievement, gameMode, lastMeme, coins, stats, currentMeme, totalRounds,

        // Actions
        setDifficulty, setGameMode, setGameState, startGame, continueGame, handleWordClick,
        usePowerUp, checkSavedGame
    } = useMemeGame();

    const handleShare = async () => {
        const text = `🎮 TOEIC Love Tracker - Meme Challenge\nScore: ${score}\nLevel: ${getLevelFromXP(stats.totalXP || 0)}\nStreak: ${stats.maxStreak}\n\nCan you beat me? #TOEICLoveTracker`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'TOEIC Meme Challenge Result',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(text);
            // We could show a toast here, but for now alert is simple enough for MVP or relying on button feedback
            alert("Đã copy kết quả vào clipboard!");
        }
    };

    return (
        <div className="game-wrapper" style={{ minHeight: '100vh', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Effects */}
            <div className="animated-bg" />
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft /> Back
                </motion.button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Leaderboard Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowLeaderboard(true)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: 'gold' }}
                    >
                        <Trophy size={20} />
                    </motion.button>
                </div>
            </nav>

            {/* Particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 1, scale: 0, x: p.x, y: p.y }}
                    animate={{ opacity: 0, scale: 2, y: p.y - 100 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        position: 'fixed', width: '10px', height: '10px', borderRadius: '50%',
                        background: p.color, pointerEvents: 'none', zIndex: 100
                    }}
                />
            ))}

            {/* Leaderboard Modal */}
            <AnimatePresence>
                {showLeaderboard && <Leaderboard stats={stats} close={() => setShowLeaderboard(false)} />}
            </AnimatePresence>

            {/* Game Content */}
            <AnimatePresence mode="wait">
                {gameState === 'menu' && (
                    <GameMenu
                        key="menu"
                        startGame={startGame}
                        continueGame={continueGame}
                        checkSavedGame={checkSavedGame}
                        stats={stats}
                        coins={coins}
                        gameMode={gameMode}
                        setGameMode={setGameMode}
                        difficulty={difficulty}
                        setDifficulty={setDifficulty}
                        memeDataLength={totalRounds}
                    />
                )}

                {gameState === 'playing' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="meme-game-container"
                    >
                        <GameHeader
                            lives={lives}
                            difficulty={difficulty}
                            difficultySettings={difficultySettings}
                            score={score}
                            doublePoints={doublePoints}
                            streak={streak}
                            frozenTime={frozenTime}
                            timeLeft={timeLeft}
                            shieldActive={shieldActive}
                        />

                        {currentMeme && currentMeme.correctWords ? (
                            <>
                                <MemeCard
                                    currentRound={currentRound}
                                    memeDataLength={totalRounds}
                                    difficulty={difficulty}
                                    currentMeme={currentMeme}
                                    selectedWords={selectedWords}
                                />

                                <GameControls
                                    availablePowerUps={availablePowerUps}
                                    usePowerUp={usePowerUp}
                                    coins={coins}
                                />

                                <WordGrid
                                    options={options}
                                    selectedWords={selectedWords}
                                    currentMeme={currentMeme}
                                    handleWordClick={handleWordClick}
                                />
                            </>
                        ) : (
                            // Fallback in case of data error handled in hook but render keeps going briefly
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                                Loading next round...
                            </div>
                        )}
                    </motion.div>
                )}

                {(gameState === 'won' || gameState === 'lost') && (
                    <GameOver
                        key="gameover"
                        gameState={gameState}
                        score={score}
                        stats={stats}
                        lastMeme={lastMeme || currentMeme}
                        startGame={startGame}
                        setGameState={setGameState}
                        shareResult={handleShare}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemeGame;
