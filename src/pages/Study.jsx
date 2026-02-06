import React, { useState, useEffect } from 'react';
import Flashcard from '../components/Flashcard';
import { useVocabulary } from '../context/VocabularyContext';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, BookOpen, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Study = () => {
    const { vocabData, loading, error } = useVocabulary();

    // Load saved progress from localStorage
    const [currentIndex, setCurrentIndex] = useState(() => {
        const saved = localStorage.getItem('studyProgress');
        if (saved) {
            const data = JSON.parse(saved);
            return data.currentIndex || 0;
        }
        return 0;
    });

    // Track learned words
    const [learnedWords, setLearnedWords] = useState(() => {
        const saved = localStorage.getItem('studyProgress');
        if (saved) {
            const data = JSON.parse(saved);
            return data.learnedWords || [];
        }
        return [];
    });

    // Study stats
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('studyStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalStudied: 0,
            totalReviewed: 0,
            lastStudyDate: null,
            studyStreak: 0
        };
    });

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        if (vocabData.length === 0) return;

        localStorage.setItem('studyProgress', JSON.stringify({
            currentIndex,
            learnedWords,
            lastUpdated: new Date().toISOString()
        }));
    }, [currentIndex, learnedWords, vocabData.length]);

    // Save stats
    useEffect(() => {
        localStorage.setItem('studyStats', JSON.stringify(stats));
    }, [stats]);

    // Update study streak on first load
    useEffect(() => {
        const today = new Date().toDateString();
        if (stats.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const wasYesterday = stats.lastStudyDate === yesterday.toDateString();

            setStats(prev => ({
                ...prev,
                lastStudyDate: today,
                studyStreak: wasYesterday ? prev.studyStreak + 1 : 1
            }));
        }
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading vocabulary...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>Error: {error}</div>;
    if (vocabData.length === 0) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>No vocabulary data found. Please check vocab.csv.</div>;

    // Validate currentIndex if vocab data changed
    const validIndex = Math.min(currentIndex, vocabData.length - 1);
    if (validIndex !== currentIndex) {
        setCurrentIndex(validIndex);
    }

    const handleNext = () => {
        if (currentIndex < vocabData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Mark current word as studied
            const wordId = vocabData[currentIndex].id;
            if (!learnedWords.includes(wordId)) {
                setLearnedWords(prev => [...prev, wordId]);
                setStats(prev => ({ ...prev, totalStudied: prev.totalStudied + 1 }));
            } else {
                setStats(prev => ({ ...prev, totalReviewed: prev.totalReviewed + 1 }));
            }
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleMarkLearned = () => {
        const wordId = vocabData[currentIndex].id;
        if (!learnedWords.includes(wordId)) {
            setLearnedWords(prev => [...prev, wordId]);
            setStats(prev => ({ ...prev, totalStudied: prev.totalStudied + 1 }));
        }
    };

    const handleReset = () => {
        if (window.confirm('Bạn có chắc muốn học lại từ đầu? Tiến độ sẽ bị xóa!')) {
            setCurrentIndex(0);
            setLearnedWords([]);
            localStorage.removeItem('studyProgress');
        }
    };

    const currentWord = vocabData[currentIndex];
    const progress = ((currentIndex + 1) / vocabData.length) * 100;
    const learnedProgress = (learnedWords.length / vocabData.length) * 100;
    const isCurrentLearned = learnedWords.includes(currentWord?.id);

    return (
        <div className="meme-game-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '4rem'
        }}>
            <h2 className="heading-lg" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Study Session 📝</h2>

            {/* Stats Row */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem' }}>Từ {currentIndex + 1}/{vocabData.length}</span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '0.85rem' }}>Đã học: {learnedWords.length}</span>
                </div>
                {stats.studyStreak > 1 && (
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))' }}>
                        <span>🔥</span>
                        <span style={{ fontSize: '0.85rem' }}>{stats.studyStreak} ngày</span>
                    </div>
                )}
            </div>

            {/* Progress Bars */}
            <div style={{ width: '100%', maxWidth: '350px', marginBottom: '1.5rem' }}>
                {/* Current Position */}
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Vị trí hiện tại</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Learned Words */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Từ đã thuộc</span>
                        <span>{Math.round(learnedProgress)}%</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${learnedProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Flashcard Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)' }}>
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{
                        opacity: currentIndex === 0 ? 0.3 : 1,
                        cursor: currentIndex === 0 ? 'default' : 'pointer',
                        padding: 'clamp(8px, 2vw, 10px)',
                        background: 'var(--glass-bg)',
                        borderRadius: '50%',
                        boxShadow: 'var(--glass-shadow)',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChevronLeft size={28} color={currentIndex === 0 ? 'var(--text-muted)' : 'var(--primary)'} />
                </button>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Flashcard data={currentWord} />
                    </motion.div>
                </AnimatePresence>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === vocabData.length - 1}
                        style={{
                            opacity: currentIndex === vocabData.length - 1 ? 0.5 : 1,
                            cursor: currentIndex === vocabData.length - 1 ? 'not-allowed' : 'pointer',
                            padding: 'clamp(8px, 2vw, 10px)',
                            background: 'var(--glass-bg)',
                            borderRadius: '50%',
                            boxShadow: 'var(--glass-shadow)',
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ChevronRight size={28} color={currentIndex === vocabData.length - 1 ? 'var(--text-muted)' : 'var(--primary)'} />
                    </button>
                    {currentIndex === vocabData.length - 1 && (
                        <div style={{
                            position: 'absolute',
                            top: '110%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}>
                            Hết từ vựng
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {/* Mark as Learned */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkLearned}
                    disabled={isCurrentLearned}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: isCurrentLearned
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'rgba(16, 185, 129, 0.2)',
                        color: isCurrentLearned ? 'white' : '#10b981',
                        cursor: isCurrentLearned ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                    }}
                >
                    <CheckCircle size={18} />
                    {isCurrentLearned ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}
                </motion.button>

                {/* Reset Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                    }}
                >
                    <RotateCcw size={16} />
                    Học lại từ đầu
                </motion.button>
            </div>

            {/* Quick Jump */}
            {vocabData.length > 20 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>Nhảy đến từ:</p>
                    <input
                        type="range"
                        min="0"
                        max={vocabData.length - 1}
                        value={currentIndex}
                        onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                        style={{ width: '200px', cursor: 'pointer' }}
                    />
                </div>
            )}

            {/* Completion Message */}
            {currentIndex === vocabData.length - 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{
                        marginTop: '1.5rem',
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</p>
                    <p style={{ fontWeight: 'bold' }}>Bạn đã hoàn thành tất cả từ vựng!</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Đã thuộc: {learnedWords.length}/{vocabData.length} từ</p>
                </motion.div>
            )}
        </div>
    );
};

export default Study;
