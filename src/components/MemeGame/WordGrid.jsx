import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WordGrid = ({ options, selectedWords, currentMeme, handleWordClick }) => {
    return (
        <div className="word-options-grid">
            <AnimatePresence>
                {options.map((word, index) => {
                    const isSelected = selectedWords.includes(word);
                    const isCorrect = currentMeme.correctWords?.includes(word);
                    const meaning = currentMeme.meanings?.[word];

                    return (
                        <motion.button
                            key={word}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={(e) => handleWordClick(word, e)}
                            disabled={isSelected}
                            className="glass-panel"
                            whileHover={!isSelected ? { scale: 1.05, y: -2 } : {}}
                            whileTap={!isSelected ? { scale: 0.95 } : {}}
                            style={{
                                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.4rem, 1.5vw, 0.6rem)',
                                cursor: isSelected ? 'default' : 'pointer',
                                border: 'none',
                                background: isSelected
                                    ? (isCorrect ? 'linear-gradient(135deg, #10b98144, #10b98166)' : 'linear-gradient(135deg, #ef444444, #ef444466)')
                                    : undefined,
                                color: isSelected ? (isCorrect ? '#10b981' : '#ef4444') : 'inherit',
                                fontWeight: isSelected ? 'bold' : 'normal',
                                textTransform: 'capitalize',
                                minHeight: '44px'
                            }}
                        >
                            <div style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)' }}>
                                {isSelected && isCorrect && '✓ '}{word}
                            </div>
                            {isSelected && meaning && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{
                                        fontSize: '0.75rem',
                                        marginTop: '0.35rem',
                                        opacity: 0.85,
                                        fontWeight: 'normal',
                                        textTransform: 'none',
                                        borderTop: '1px solid rgba(255,255,255,0.2)',
                                        paddingTop: '0.35rem'
                                    }}
                                >
                                    {isCorrect ? '📗' : '📕'} {meaning}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default WordGrid;
