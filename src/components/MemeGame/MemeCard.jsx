import React from 'react';
import { motion } from 'framer-motion';

const MemeCard = ({ currentRound, memeDataLength, difficulty, currentMeme, selectedWords }) => {
    return (
        <motion.div
            className="glass-panel"
            key={currentRound}
            initial={{ x: 100, opacity: 0, rotateY: 90 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}
        >
            <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                Vòng {currentRound + 1}/{memeDataLength} • {difficulty.toUpperCase()}
            </div>

            <motion.div
                className="meme-emoji-display"
                style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                {currentMeme.emoji}
            </motion.div>

            <h3 style={{ fontSize: 'clamp(1rem, 4vw, 1.3rem)', marginBottom: '0.25rem' }}>{currentMeme.theme}</h3>
            <p style={{ opacity: 0.7, marginBottom: '0.75rem', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)' }}>{currentMeme.themeVi} - Chọn 5 từ!</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            width: '35px', height: '6px', borderRadius: '3px',
                            background: i < selectedWords.length ? 'linear-gradient(90deg, var(--color-success), #10b981)' : 'rgba(255,255,255,0.2)'
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default MemeCard;
