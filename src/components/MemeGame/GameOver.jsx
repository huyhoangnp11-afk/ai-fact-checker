import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Menu, Star, Share2 } from 'lucide-react';

const mienTayPhrases = [
    { text: "Hết nước chấm!", emoji: "🥣" },
    { text: "Quá dữ thần ơi!", emoji: "😱" },
    { text: "Đỉnh của chóp!", emoji: "⛰️" },
    { text: "Mười điểm!", emoji: "🔟" },
    { text: "Xuất sắc!", emoji: "🌟" },
    { text: "Uy tín luôn!", emoji: "👍" },
]; // Add more if needed

const GameOver = ({ gameState, score, stats, lastMeme, startGame, setGameState, shareResult }) => {
    const isWin = gameState === 'won';

    return (
        <div className="meme-game-container">
            <motion.div
                className="glass-panel"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}
            >
                <motion.div
                    animate={{ rotate: isWin ? [0, 10, -10, 0] : 0, scale: isWin ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                >
                    {isWin ? '🏆' : '😢'}
                </motion.div>

                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: isWin ? '#fbbf24' : '#ef4444' }}>
                    {isWin ? 'CHIẾN THẮNG!' : 'GAME OVER'}
                </h2>

                <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                    {isWin ? 'Bạn là thánh từ vựng meme!' : 'Đừng nản chí, thử lại nào!'}
                </p>

                {!isWin && lastMeme && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Đáp án đúng là:</div>
                        <div style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{lastMeme.emoji}</div>
                        <div style={{ fontWeight: 'bold' }}>{lastMeme.theme}</div>
                        <div style={{ fontStyle: 'italic', opacity: 0.8 }}>{lastMeme.themeVi}</div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>{score}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>High Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.highScore}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <motion.button
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                    >
                        <RefreshCw size={20} /> Chơi Lại
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGameState('menu')}
                        style={{
                            padding: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px', color: 'white', cursor: 'pointer'
                        }}
                    >
                        <Menu size={20} /> Về Menu
                    </motion.button>

                    {isWin && (
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={shareResult}
                            style={{
                                padding: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px', color: '#60a5fa', cursor: 'pointer'
                            }}
                        >
                            <Share2 size={20} /> Chia sẻ kết quả
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GameOver;
