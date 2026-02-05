import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb, HelpCircle, TrendingUp, Award, RotateCcw, History } from 'lucide-react';

const Quiz = () => {
    const { vocabData, loading, error } = useVocabulary();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Load quiz history on mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        setQuizHistory(history);
    }, []);

    useEffect(() => {
        if (loading || vocabData.length === 0) return;

        // Generate questions: Shuffle vocab and pick max 5
        const shuffled = [...vocabData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(word => {
            // Generate distractors
            const distractors = vocabData
                .filter(w => w.id !== word.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.meaning);

            const options = [...distractors, word.meaning].sort(() => 0.5 - Math.random());

            return {
                ...word,
                options
            };
        });
        setQuestions(selected);
    }, [vocabData, loading]);

    // Reset hints when question changes
    useEffect(() => {
        setShowHint(false);
        setShowTip(false);
    }, [currentQuestionIndex]);

    const handleSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].word);
        utterance.lang = 'en-US';
        utterance.rate = 0.7; // Even slower for quiz
        window.speechSynthesis.speak(utterance);
    };

    const handleOptionClick = (option) => {
        if (selectedOption) return;
        setSelectedOption(option);

        if (option === questions[currentQuestionIndex].meaning) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setShowResult(true);
                saveProgress(score + (option === questions[currentQuestionIndex].meaning ? 1 : 0), questions.length);
            }
        }, 1500);
    };

    const saveProgress = (finalScore, total) => {
        const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const newEntry = {
            date: new Date().toISOString(),
            score: finalScore,
            total: total,
            percentage: Math.round((finalScore / total) * 100)
        };
        history.push(newEntry);
        // Keep only last 50 entries
        const trimmedHistory = history.slice(-50);
        localStorage.setItem('quizHistory', JSON.stringify(trimmedHistory));
        setQuizHistory(trimmedHistory);
    };

    // Calculate stats
    const calculateStats = () => {
        if (quizHistory.length === 0) return null;

        const totalQuizzes = quizHistory.length;
        const totalScore = quizHistory.reduce((sum, q) => sum + q.score, 0);
        const totalQuestions = quizHistory.reduce((sum, q) => sum + q.total, 0);
        const avgPercentage = Math.round((totalScore / totalQuestions) * 100);
        const bestScore = Math.max(...quizHistory.map(q => q.percentage || Math.round((q.score / q.total) * 100)));

        // Calculate streak (consecutive days)
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return {
            totalQuizzes,
            avgPercentage,
            bestScore,
            totalCorrect: totalScore
        };
    };

    const stats = calculateStats();

    if (questions.length === 0) return (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p>Đang tải câu hỏi...</p>
        </div>
    );

    if (showResult) {
        const percentage = (score / questions.length) * 100;
        let emoji = '🎉';
        let message = 'Xuất sắc!';
        let mienTayPhrase = 'Hề hề, ez quá mà bà con ơi! 🤠';

        if (percentage < 40) {
            emoji = '💪';
            message = 'Cố gắng lên! Bạn làm được!';
            mienTayPhrase = 'Thôi kệ, chơi lại nha bà con! 🍌';
        } else if (percentage < 80) {
            emoji = '👍';
            message = 'Tốt lắm! Tiếp tục nhé!';
            mienTayPhrase = 'Khá bảnh luôn đó trời! ✨';
        }

        return (
            <div className="meme-game-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: 'clamp(1.5rem, 5vw, 2rem)', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: 2, duration: 0.5 }}
                        style={{ fontSize: 'clamp(3rem, 15vw, 5rem)', marginBottom: '1rem' }}
                    >
                        {emoji}
                    </motion.div>
                    <h2 className="heading-lg" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Hoàn thành!</h2>
                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {message}
                    </p>
                    <p style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)', color: '#f59e0b', fontStyle: 'italic', marginBottom: '1rem' }}>
                        {mienTayPhrase}
                    </p>
                    <p style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                        {score} / {questions.length} câu đúng ({percentage}%)
                    </p>

                    {/* Stats Summary */}
                    {stats && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalQuizzes}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Bài quiz</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.avgPercentage}%</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Trung bình</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.bestScore}%</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Cao nhất</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            onClick={() => window.location.reload()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RotateCcw size={18} />
                            Làm lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowHistory(!showHistory)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                border: '1px solid var(--primary)',
                                background: 'transparent',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <History size={18} />
                            Lịch sử
                        </motion.button>
                    </div>

                    {/* History Panel */}
                    {showHistory && quizHistory.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: '12px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}
                        >
                            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>📊 Lịch sử 10 bài gần nhất</h4>
                            {quizHistory.slice(-10).reverse().map((entry, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem',
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    fontSize: '0.85rem'
                                }}>
                                    <span>{new Date(entry.date).toLocaleDateString('vi-VN')}</span>
                                    <span style={{
                                        color: (entry.percentage || Math.round((entry.score / entry.total) * 100)) >= 80 ? '#10b981' : 'var(--text-muted)',
                                        fontWeight: 'bold'
                                    }}>
                                        {entry.score}/{entry.total} ({entry.percentage || Math.round((entry.score / entry.total) * 100)}%)
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Progress */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', marginTop: '10px', borderRadius: '4px' }}>
                    <motion.div
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '4px' }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                {/* Question Word */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
                            {currentQuestion.word}
                        </h1>
                        <button
                            onClick={handleSpeak}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            title="Nghe phát âm"
                        >
                            <Volume2 size={22} />
                        </button>
                    </div>

                    {/* Phonetic */}
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {currentQuestion.phonetic}
                    </p>

                    {/* Vietnamese Phonetic */}
                    {currentQuestion.phoneticVi && (
                        <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            border: '2px dashed #ff9800',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '1rem', color: '#e65100', fontWeight: 'bold' }}>
                                🗣️ Đọc: "{currentQuestion.phoneticVi}"
                            </span>
                        </div>
                    )}

                    {/* Hint Buttons */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {/* Example Hint */}
                        <button
                            onClick={() => setShowHint(!showHint)}
                            style={{
                                background: showHint ? '#e3f2fd' : 'transparent',
                                border: '1px solid #2196f3',
                                color: '#1976d2',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <HelpCircle size={16} />
                            {showHint ? 'Ẩn gợi ý' : '💡 Xem gợi ý'}
                        </button>

                        {/* Tip Button */}
                        {currentQuestion.tip && (
                            <button
                                onClick={() => setShowTip(!showTip)}
                                style={{
                                    background: showTip ? '#fff8e1' : 'transparent',
                                    border: '1px solid #ffc107',
                                    color: '#ff8f00',
                                    borderRadius: '20px',
                                    padding: '6px 14px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Lightbulb size={16} />
                                {showTip ? 'Ẩn mẹo' : '🌟 Mẹo học'}
                            </button>
                        )}
                    </div>

                    {/* Hint Content */}
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#e3f2fd',
                                borderRadius: '12px',
                                border: '1px solid #90caf9'
                            }}
                        >
                            <p style={{ fontStyle: 'italic', color: '#1565c0', marginBottom: '0.5rem' }}>
                                📝 "{currentQuestion.example}"
                            </p>
                            {currentQuestion.ExampleMeaning && (
                                <p style={{ color: '#0d47a1', fontSize: '0.9rem' }}>
                                    ✅ {currentQuestion.ExampleMeaning}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Tip Content */}
                    {showTip && currentQuestion.tip && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                                borderRadius: '12px',
                                border: '2px solid #ffc107'
                            }}
                        >
                            <span style={{ fontSize: '0.95rem', color: '#5d4037', fontWeight: '500' }}>
                                💡 {currentQuestion.tip}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Answer Options */}
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {currentQuestion.options.map((option, index) => {
                        let bgColor = 'white';
                        let borderColor = 'rgba(0,0,0,0.1)';
                        let emoji = '';

                        if (selectedOption) {
                            if (option === currentQuestion.meaning) {
                                bgColor = '#d4edda';
                                borderColor = '#28a745';
                                emoji = '✅ ';
                            } else if (option === selectedOption) {
                                bgColor = '#f8d7da';
                                borderColor = '#dc3545';
                                emoji = '❌ ';
                            }
                        }

                        return (
                            <motion.button
                                key={index}
                                whileHover={!selectedOption ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}
                                whileTap={!selectedOption ? { scale: 0.98 } : {}}
                                onClick={() => handleOptionClick(option)}
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    border: `2px solid ${borderColor}`,
                                    background: bgColor,
                                    color: 'var(--text-color)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: selectedOption ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {emoji}{option}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
