import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Flame, Timer, Sparkles } from 'lucide-react';

const GameHeader = ({
    lives,
    difficulty,
    difficultySettings,
    score,
    doublePoints,
    streak,
    frozenTime,
    timeLeft,
    shieldActive
}) => {
    return (
        <div className="game-stats-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Lives */}
                <div className="glass-panel" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {[...Array(difficultySettings[difficulty].lives)].map((_, i) => (
                        <motion.div key={i} animate={{ scale: i < lives ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                            <Heart size={18} fill={i < lives ? '#ef4444' : 'transparent'} color={i < lives ? '#ef4444' : '#666'} />
                        </motion.div>
                    ))}
                    {shieldActive && <span style={{ marginLeft: '0.25rem' }}>🛡️</span>}
                </div>

                {/* Score */}
                <div className="glass-panel" style={{ padding: 'clamp(0.35rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} color="gold" />
                    <motion.span key={score} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ fontWeight: 'bold', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
                        {score}
                    </motion.span>
                    {doublePoints && <span style={{ color: '#f59e0b' }}>x2</span>}
                </div>

                {/* Streak/Combo */}
                <AnimatePresence>
                    {streak > 0 && (
                        <motion.div
                            className="glass-panel"
                            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: `linear-gradient(135deg, rgba(${Math.min(255, streak * 30)}, ${Math.max(0, 150 - streak * 10)}, 0, 0.3), rgba(${Math.min(255, streak * 40)}, ${Math.max(0, 100 - streak * 10)}, 0, 0.3))` }}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                        >
                            <Flame size={18} color={streak >= 5 ? '#ff4500' : '#f59e0b'} />
                            <span style={{ fontWeight: 'bold', color: streak >= 5 ? '#ff4500' : '#f59e0b' }}>x{streak}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Timer */}
            <motion.div
                className="glass-panel"
                style={{
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: frozenTime
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.3))'
                        : timeLeft <= 10
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.3))'
                            : undefined
                }}
                animate={timeLeft <= 5 && !frozenTime ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
            >
                {frozenTime ? <Sparkles size={20} color="#3b82f6" /> : <Timer size={20} color={timeLeft <= 10 ? '#ef4444' : 'currentColor'} />}
                <span style={{ fontWeight: 'bold', color: timeLeft <= 10 && !frozenTime ? '#ef4444' : frozenTime ? '#3b82f6' : 'inherit', minWidth: '2ch' }}>
                    {frozenTime ? '❄️' : timeLeft}
                </span>
            </motion.div>
        </div>
    );
};

export default GameHeader;
