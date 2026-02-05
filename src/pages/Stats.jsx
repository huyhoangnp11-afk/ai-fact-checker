import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ToeicProgress from '../components/ToeicProgress';

const Stats = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ totalQuizzes: 0, averageScore: 0, estimatedToeic: 0 });

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        setHistory(data.reverse()); // Show newest first

        if (data.length > 0) {
            const totalPercentage = data.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);

            // Calculate Total Correct Answers for TOEIC Estimation
            const totalCorrectAnswers = data.reduce((acc, curr) => acc + curr.score, 0);

            // Simple Estimation Logic:
            // Assuming 1 correct answer ~= 10 points (just for fun/motivation)
            // Capped at 990. 
            // Also adding a base score for encouragement + (avg score factor)

            const baseScore = 150; // Everyone starts somewhere!
            const perAnswerPoints = 10;
            // Bonus for high average accuracy
            const accuracy = totalPercentage / data.length;
            const accuracyBonus = accuracy * 2;

            let toeicScore = baseScore + (totalCorrectAnswers * perAnswerPoints) + accuracyBonus;
            if (toeicScore > 990) toeicScore = 990;

            setStats({
                totalQuizzes: data.length,
                averageScore: Math.round(data.length > 0 ? totalPercentage / data.length : 0),
                estimatedToeic: Math.round(toeicScore)
            });
        }
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h2 className="heading-lg" style={{ textAlign: 'center', marginBottom: '2rem' }}>Learning Progress 📊</h2>

            {/* TOEIC Progress Bar */}
            <ToeicProgress score={stats.estimatedToeic} />

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', minWidth: '200px', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Quizzes Taken</h3>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalQuizzes}</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', minWidth: '200px', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Average Score</h3>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.averageScore}%</p>
                </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginLeft: '1rem' }}>Recent Activity</h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {history.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No quizzes taken yet. Go to Study mode and take a quiz!
                    </p>
                ) : (
                    history.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Vocabulary Quiz</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: (item.score / item.total) >= 0.8 ? '#28a745' : ((item.score / item.total) >= 0.5 ? 'var(--accent)' : 'var(--primary)')
                                }}>
                                    {item.score}/{item.total}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Stats;
