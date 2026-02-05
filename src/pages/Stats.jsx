import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Crown, BookOpen, Gamepad2, TrendingUp } from 'lucide-react';
import ToeicProgress from '../components/ToeicProgress';
import { getLevelFromXP, getTitleFromLevel, getXPProgress, xpLevels } from '../hooks/useMemeGame';

const Stats = () => {
    const [quizHistory, setQuizHistory] = useState([]);
    const [memeStats, setMemeStats] = useState(null);
    const [academicStats, setAcademicStats] = useState({ totalQuizzes: 0, averageScore: 0, estimatedToeic: 0 });

    useEffect(() => {
        // Load Quiz Data
        const quizData = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        setQuizHistory(quizData.reverse());

        if (quizData.length > 0) {
            const totalPercentage = quizData.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);
            const totalCorrectAnswers = quizData.reduce((acc, curr) => acc + curr.score, 0);

            // Estimation logic
            const baseScore = 150;
            const perAnswerPoints = 10;
            const accuracy = totalPercentage / quizData.length;
            const accuracyBonus = accuracy * 2;
            let toeicScore = baseScore + (totalCorrectAnswers * perAnswerPoints) + accuracyBonus;
            if (toeicScore > 990) toeicScore = 990;

            setAcademicStats({
                totalQuizzes: quizData.length,
                averageScore: Math.round(totalPercentage / quizData.length),
                estimatedToeic: Math.round(toeicScore)
            });
        }

        // Load Meme Game Data
        const savedMemeStats = localStorage.getItem('memeGameStats');
        if (savedMemeStats) {
            setMemeStats(JSON.parse(savedMemeStats));
        }
    }, []);

    // Helper to get Pet Icon
    const getPetIcon = (streak) => {
        if (streak >= 10) return '🐉';
        if (streak >= 3) return '🐣';
        return '🥚';
    };

    const currentLevel = getLevelFromXP(memeStats?.totalXP || 0);
    const progressToNext = getXPProgress(memeStats?.totalXP || 0);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', padding: '1rem' }}>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="heading-lg"
                style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
                Hồ Sơ Học Tập 📊
            </motion.h2>

            {/* --- HERO PROFILE SECTION --- */}
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    padding: '2rem',
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    gap: '2rem'
                }}
            >
                {/* Level & Title */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '0.5rem' }}>LEVEL {currentLevel}</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fbbf24', textShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}>
                        {getTitleFromLevel(currentLevel)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: '0.5rem' }}>{memeStats?.totalXP || 0} XP</div>
                </div>

                {/* Pet Avatar */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    style={{
                        width: '120px', height: '120px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                        cursor: 'help'
                    }}
                    title={`Pet hiện tại của bạn: ${memeStats?.dailyStreak >= 10 ? 'Rồng Thần' : memeStats?.dailyStreak >= 3 ? 'Gà Con' : 'Trứng'}`}
                >
                    {getPetIcon(memeStats?.dailyStreak || 0)}
                </motion.div>

                {/* TOEIC Estimate */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '0.5rem' }}>EST. TOEIC SCORE</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>{academicStats.estimatedToeic}</div>
                </div>
            </motion.div>

            {/* --- DETAILED STATS GRID --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                {/* Academic Stats */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.4rem' }}>
                        <BookOpen color="#3b82f6" /> Academic Progress
                    </h3>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <span style={{ color: '#9ca3af' }}>Quizzes Taken</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{academicStats.totalQuizzes}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: '#9ca3af' }}>Avg. Accuracy</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: academicStats.averageScore >= 80 ? '#10b981' : '#f59e0b' }}>
                                {academicStats.averageScore}%
                            </span>
                        </div>
                        <ToeicProgress score={academicStats.estimatedToeic} />
                    </div>
                </motion.div>

                {/* Arcade Stats */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.4rem' }}>
                        <Gamepad2 color="#8b5cf6" /> Arcade Stats
                    </h3>
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                <Crown size={24} color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>High Score</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{memeStats?.highScore || 0}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                <Zap size={24} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Max Streak</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{memeStats?.maxStreak || 0}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                <Trophy size={24} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Games Won</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{memeStats?.gamesWon || 0}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                <Target size={24} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Correct Words</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{memeStats?.totalCorrect || 0}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- RECENT HISTORY LIST --- */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp /> Recent History
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {quizHistory.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '2rem' }}>
                            Chưa có dữ liệu bài làm. Hãy vào "Học Tập" để làm bài Quiz nhé!
                        </p>
                    ) : (
                        quizHistory.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-panel"
                                style={{
                                    padding: '1.2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: `4px solid ${item.score / item.total >= 0.8 ? '#10b981' : '#f59e0b'}`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '0.8rem',
                                        borderRadius: '50%'
                                    }}>
                                        <BookOpen size={20} color="#60a5fa" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Vocabulary Quiz</p>
                                        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                            {new Date(item.date).toLocaleDateString('vi-VN')} • {new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: (item.score / item.total) >= 0.8 ? '#10b981' : ((item.score / item.total) >= 0.5 ? '#f59e0b' : '#ef4444')
                                    }}>
                                        {item.score}/{item.total}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Stats;
