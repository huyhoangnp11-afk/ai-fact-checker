import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Crown, Flame, Play } from 'lucide-react';
import { getTitleFromLevel, getLevelFromXP, getXPProgress, xpLevels, gameModes, difficultySettings } from '../../hooks/useMemeGame';
import DailyMood from './DailyMood';

const GameMenu = ({
    startGame,
    continueGame,
    checkSavedGame,
    stats,
    coins,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    memeDataLength
}) => {
    const hasSavedGame = useMemo(() => checkSavedGame(), [checkSavedGame]);
    const [showDailyMood, setShowDailyMood] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="meme-game-container"
            style={{ textAlign: 'center' }}
        >
            <AnimatePresence>
                {showDailyMood && <DailyMood close={() => setShowDailyMood(false)} />}
            </AnimatePresence>

            <motion.div
                className="glass-panel menu-panel"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                style={{ padding: 'clamp(1rem, 4vw, 2rem)', marginBottom: '1rem' }}
            >
                {/* Header with Player Level */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>Level {getLevelFromXP(stats.totalXP || 0)}</div>
                        <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>{getTitleFromLevel(getLevelFromXP(stats.totalXP || 0))}</div>
                    </div>

                    {/* Daily Mood Trigger */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDailyMood(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'clamp(2.5rem, 10vw, 4rem)' }}
                        title="Xem thông điệp hôm nay"
                    >
                        🔮
                    </motion.button>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🪙</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{coins}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', fontSize: '0.8rem', opacity: 0.8 }}>
                            <span>🔥 {stats.dailyStreak || 0}</span>
                            <span>•</span>
                            <span title={(stats.dailyStreak || 0) < 3 ? "Pet: Trứng (Cần streak 3)" : (stats.dailyStreak || 0) < 10 ? "Pet: Gà con (Cần streak 10)" : "Pet: Rồng lửa"}>
                                {(stats.dailyStreak || 0) < 3 ? '🥚' : (stats.dailyStreak || 0) < 10 ? '🐣' : '🐉'}
                            </span>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Meme Vocabulary</h2>
                <p style={{ opacity: 0.7, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Nhìn emoji, đoán từ vựng!</p>

                {/* Continue Button */}
                {hasSavedGame && (
                    <motion.button
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={continueGame}
                        style={{
                            width: '100%',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                            padding: '1rem',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        <Play size={24} fill="currentColor" /> Tiếp tục chơi
                    </motion.button>
                )}

                {/* XP Progress Bar */}
                <div style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                        <span>XP: {stats.totalXP || 0}</span>
                        <span>Next: {xpLevels[getLevelFromXP(stats.totalXP || 0)] || 'MAX'}</span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getXPProgress(stats.totalXP || 0)}%` }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                </div>

                {/* Game Mode Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Chế độ chơi:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {gameModes.map(mode => (
                            <motion.button
                                key={mode.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setGameMode(mode.id)}
                                style={{
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '10px',
                                    border: '2px solid',
                                    borderColor: gameMode === mode.id ? mode.color : 'rgba(255,255,255,0.1)',
                                    background: gameMode === mode.id ? `${mode.color}33` : 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '1.3rem' }}>{mode.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: gameMode === mode.id ? 'bold' : 'normal', fontSize: '0.9rem' }}>{mode.name}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{mode.desc}</div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <Crown size={20} color="gold" />
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.highScore}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>High Score</div>
                    </div>
                    <div>
                        <Flame size={20} color="#ef4444" />
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.maxStreak}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Max Streak</div>
                    </div>
                    <div>
                        <Trophy size={20} color="#f59e0b" />
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.gamesWon}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Wins</div>
                    </div>
                    <div>
                        <Star size={20} color="#8b5cf6" />
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.totalCorrect || 0}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Words</div>
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: 'clamp(0.8rem, 3vw, 1rem)' }}>Độ khó:</p>
                    <div className="difficulty-selector" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {Object.keys(difficultySettings).map(diff => {
                            const totalLevels = memeDataLength || 0;
                            return (
                                <motion.button
                                    key={diff}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDifficulty(diff)}
                                    style={{
                                        padding: 'clamp(0.35rem, 1.5vw, 0.5rem) clamp(0.6rem, 2.5vw, 1rem)',
                                        borderRadius: '10px',
                                        border: '1px solid',
                                        borderColor: difficulty === diff ?
                                            (diff === 'easy' ? '#10b981' : diff === 'normal' ? '#3b82f6' : diff === 'hard' ? '#f59e0b' : '#ef4444')
                                            : 'rgba(255,255,255,0.2)',
                                        background: difficulty === diff ?
                                            (diff === 'easy' ? '#10b98133' : diff === 'normal' ? '#3b82f633' : diff === 'hard' ? '#f59e0b33' : '#ef444433')
                                            : 'transparent',
                                        color: difficulty === diff ?
                                            (diff === 'easy' ? '#10b981' : diff === 'normal' ? '#60a5fa' : diff === 'hard' ? '#fbbf24' : '#f87171')
                                            : 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer',
                                        fontWeight: difficulty === diff ? 'bold' : 'normal',
                                        flex: '1 1 auto',
                                        minWidth: '70px',
                                        fontSize: 'clamp(0.8rem, 3vw, 0.9rem)'
                                    }}
                                >
                                    {diff.toUpperCase()}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <motion.button
                    className="btn-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={startGame}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                    }}
                >
                    {hasSavedGame ? '🔄 Chơi lại từ đầu' : '🚀 Bắt đầu ngay'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default GameMenu;
