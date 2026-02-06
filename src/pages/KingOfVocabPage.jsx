import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Timer, Zap, Trophy, RotateCcw, Play, Star, Flame, Sparkles, Volume2 } from 'lucide-react';
import Confetti from 'react-confetti';
import useKingGame from '../hooks/useKingGame';
import useTTS from '../hooks/useTTS';

const KingOfVocabPage = () => {
    const {
        gameState,
        currentWord,
        scrambledLetters,
        userAnswer,
        timeLeft,
        score,
        streak,
        totalXP,
        level,
        xpToNextLevel,
        wordsCompleted,
        isGoldWord,
        difficulty,
        difficultyName,
        feedbackMessage,
        loading,
        lastEarnedXP,
        showXPPopup,
        showLevelUp,
        startGame,
        addLetter,
        removeLetter,
        nextRound,
        resetGame,
        setDifficulty
    } = useKingGame();

    // Screen shake state for timeout
    const [screenShake, setScreenShake] = useState(false);

    // TTS hook for pronunciation
    const { speak, isSupported: ttsSupported } = useTTS();

    // Handle timeout shake effect
    useEffect(() => {
        if (gameState === 'lost') {
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 500);
        }
    }, [gameState]);

    // Auto-speak when correct answer is given
    useEffect(() => {
        if (gameState === 'roundEnd' && currentWord && feedbackMessage?.includes('🎉')) {
            // Short delay for better UX
            const timer = setTimeout(() => speak(currentWord.word), 300);
            return () => clearTimeout(timer);
        }
    }, [gameState, currentWord, feedbackMessage, speak]);

    if (loading) {
        return (
            <div className="meme-game-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                >
                    👑
                </motion.div>
                <p>Đang tải Vua Ghép Chữ...</p>
            </div>
        );
    }

    // Menu Screen
    if (gameState === 'menu') {
        return (
            <div className="meme-game-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ padding: '2rem', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: '5rem', marginBottom: '1rem' }}
                    >
                        👑
                    </motion.div>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        VUA GHÉP CHỮ
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Ghép chữ nhanh như chớp, trở thành vua tiếng Anh!
                    </p>

                    {/* Stats Display */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '12px'
                    }}>
                        <div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700' }}
                            >
                                <Star size={18} style={{ marginRight: 4 }} />
                                Lv.{level}
                            </motion.div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Cấp độ</div>
                        </div>
                        <div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}
                            >
                                {totalXP}
                            </motion.div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Tổng XP</div>
                        </div>
                        <div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}
                            >
                                <Flame size={18} style={{ marginRight: 4 }} />
                                {streak}
                            </motion.div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Streak</div>
                        </div>
                    </div>

                    {/* Difficulty Selector */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.7 }}>Chọn độ khó:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4, 5].map(d => (
                                <motion.button
                                    key={d}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDifficulty(d)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: difficulty === d ? '2px solid #ffd700' : '1px solid rgba(0,0,0,0.1)',
                                        background: difficulty === d ? 'linear-gradient(135deg, #ffd700, #ff6b35)' : 'white',
                                        color: difficulty === d ? 'white' : 'inherit',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: difficulty === d ? 'bold' : 'normal',
                                        boxShadow: difficulty === d ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none'
                                    }}
                                >
                                    {['Tập Sự', 'Sơ Cấp', 'Trung Cấp', 'Cao Cấp', 'Vua'][d - 1]}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 auto',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                        }}
                    >
                        <Play size={24} />
                        BẮT ĐẦU
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Game Screen
    if (gameState === 'playing' || gameState === 'roundEnd') {
        const isCriticalTime = timeLeft <= 5;

        return (
            <motion.div
                className="meme-game-container"
                animate={screenShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
            >
                {/* Level Up Confetti */}
                {showLevelUp && (
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={200}
                        colors={['#ffd700', '#ff6b35', '#10b981', '#8b5cf6']}
                    />
                )}

                {/* Level Up Overlay */}
                <AnimatePresence>
                    {showLevelUp && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 100,
                                background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                                padding: '2rem 3rem',
                                borderRadius: '20px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                textAlign: 'center'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 1 }}
                                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
                            >
                                ⬆️
                            </motion.div>
                            <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>
                                LEVEL UP!
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.5rem 0 0' }}>
                                Level {level} đạt được!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Crown size={20} color="#ffd700" />
                        <span style={{ fontWeight: 'bold' }}>{difficultyName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Zap size={18} color="#10b981" />
                            <span style={{ fontWeight: 'bold' }}>{score} XP</span>
                        </div>

                        {/* XP Popup */}
                        <AnimatePresence>
                            {showXPPopup && (
                                <motion.div
                                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -30, scale: 1 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    +{lastEarnedXP} XP
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Flame size={18} color="#f59e0b" />
                            <span style={{ fontWeight: 'bold' }}>x{streak}</span>
                        </div>
                    </div>
                </div>

                {/* Timer with Pulse Effect */}
                <div style={{ marginBottom: '1rem' }}>
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}
                        animate={isCriticalTime ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        <Timer size={20} color={isCriticalTime ? '#ef4444' : 'var(--text-muted)'} />
                        <motion.span
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: isCriticalTime ? '#ef4444' : 'inherit'
                            }}
                            animate={isCriticalTime ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                        >
                            {timeLeft}s
                        </motion.span>
                    </motion.div>
                    <div style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        boxShadow: isCriticalTime ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
                    }}>
                        <motion.div
                            style={{
                                height: '100%',
                                background: isCriticalTime
                                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                    : 'linear-gradient(90deg, #ffd700, #ff6b35)',
                                borderRadius: '5px'
                            }}
                            animate={{
                                width: `${(timeLeft / 20) * 100}%`,
                                boxShadow: isCriticalTime ? ['0 0 10px #ef4444', '0 0 20px #ef4444', '0 0 10px #ef4444'] : 'none'
                            }}
                            transition={{
                                width: { duration: 0.3 },
                                boxShadow: { repeat: Infinity, duration: 0.5 }
                            }}
                        />
                    </div>
                </div>

                {/* Word Card */}
                <motion.div
                    className="glass-panel"
                    style={{
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        border: isGoldWord ? '3px solid #ffd700' : 'none',
                        background: isGoldWord
                            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.15))'
                            : undefined,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    animate={isGoldWord ? { boxShadow: ['0 0 20px rgba(255, 215, 0, 0.3)', '0 0 40px rgba(255, 215, 0, 0.5)', '0 0 20px rgba(255, 215, 0, 0.3)'] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    {/* Gold sparkle effect */}
                    {isGoldWord && (
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%)',
                                pointerEvents: 'none'
                            }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        />
                    )}

                    {isGoldWord && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                marginBottom: '0.75rem'
                            }}
                        >
                            <Sparkles size={14} />
                            TỪ VÀNG x3 XP!
                        </motion.div>
                    )}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Gợi ý: Nghĩa tiếng Việt
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
                        fontWeight: 'bold',
                        color: 'var(--primary)'
                    }}>
                        {currentWord?.meaning}
                    </h2>
                </motion.div>

                {/* Answer Slot */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    minHeight: '60px',
                    flexWrap: 'wrap'
                }}>
                    {currentWord && Array.from({ length: currentWord.word.length }).map((_, idx) => {
                        const letter = userAnswer[idx];
                        return (
                            <motion.div
                                key={idx}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{
                                    scale: letter ? [1, 1.15, 1] : 1,
                                    opacity: 1
                                }}
                                transition={{ duration: 0.2 }}
                                onClick={() => letter && removeLetter(letter)}
                                style={{
                                    width: '48px',
                                    height: '54px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: letter
                                        ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                                        : 'rgba(0,0,0,0.05)',
                                    color: letter ? 'white' : 'transparent',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    borderRadius: '10px',
                                    border: letter ? 'none' : '2px dashed rgba(0,0,0,0.2)',
                                    cursor: letter ? 'pointer' : 'default',
                                    boxShadow: letter ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                                }}
                            >
                                {letter?.letter || '_'}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Scrambled Letters */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem'
                }}>
                    <AnimatePresence>
                        {scrambledLetters.map((letterObj) => (
                            !letterObj.isUsed && (
                                <motion.button
                                    key={letterObj.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, rotate: 180 }}
                                    whileHover={{ scale: 1.15, y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addLetter(letterObj)}
                                    disabled={gameState !== 'playing'}
                                    style={{
                                        width: '54px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(180deg, #ffffff, #f5f5f5)',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(0,0,0,0.08)',
                                        cursor: gameState === 'playing' ? 'pointer' : 'default',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 -2px 0 rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {letterObj.letter}
                                </motion.button>
                            )
                        ))}
                    </AnimatePresence>
                </div>

                {/* Feedback Message */}
                <AnimatePresence>
                    {gameState === 'roundEnd' && feedbackMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                textAlign: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            <motion.p
                                style={{
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    color: '#10b981'
                                }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: 2, duration: 0.3 }}
                            >
                                {feedbackMessage}
                            </motion.p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={nextRound}
                                className="btn-primary"
                                style={{ marginTop: '1rem' }}
                            >
                                Tiếp tục →
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // Lost Screen
    if (gameState === 'lost') {
        return (
            <motion.div
                className="meme-game-container"
                initial={{ x: 0 }}
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    >
                        😭
                    </motion.div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                        {feedbackMessage || 'Thua rồi!'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Đáp án đúng: <strong style={{ color: 'var(--primary)' }}>{currentWord?.word}</strong>
                        {ttsSupported && (
                            <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => speak(currentWord?.word)}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                                title="Nghe phát âm"
                            >
                                <Volume2 size={14} />
                            </motion.button>
                        )}
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Điểm: <strong>{score} XP</strong> | Từ đã ghép: <strong>{wordsCompleted}</strong>
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RotateCcw size={18} />
                            Chơi lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                border: '1px solid var(--primary)',
                                background: 'transparent',
                                color: 'var(--primary)',
                                cursor: 'pointer'
                            }}
                        >
                            Menu
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return null;
};

export default KingOfVocabPage;
