import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Star, Coffee, Sun, Moon, Zap } from 'lucide-react';

// 💕 Những lời yêu thương dành cho em Thư 💕
const loveMessages = [
    { emoji: "💖", message: "Thư ơi, anh tin em sẽ làm được! Cố lên nha bé yêu!", subtext: "Mỗi từ vựng em học hôm nay là một bước tiến gần hơn 🌟" },
    { emoji: "🌸", message: "Em là động lực lớn nhất của anh, và anh muốn em giỏi tiếng Anh!", subtext: "Hãy học thêm 10 từ hôm nay nhé 📚" },
    { emoji: "💕", message: "Anh yêu em nhiều lắm Thư ơi! Chăm học tiếng Anh đi nha~", subtext: "Em giỏi lắm, anh tự hào về em! ✨" },
    { emoji: "🥰", message: "Nhớ em lắm! Em học bài xong rồi hẵng chơi nhé~", subtext: "Anh đang chờ em chinh phục TOEIC nè! 💪" },
    { emoji: "🌷", message: "Be my English Queen! Học chăm để sau này du lịch cùng anh nha!", subtext: "Imagine us in Paris, speaking French AND English! 🗼" },
    { emoji: "💝", message: "Em Thư của anh là best! Hôm nay học được bao nhiêu từ rồi?", subtext: "Anh cược em sẽ nhớ 20+ từ mới hôm nay! 🎯" },
    { emoji: "🌈", message: "Mỗi lần em học là mỗi lần em xinh hơn trong mắt anh!", subtext: "Beauty with brains = Thư của anh 💅" },
    { emoji: "☀️", message: "Chào buổi sáng em yêu! Sẵn sàng học tiếng Anh chưa?", subtext: "A new day, new words to learn! ☕" },
    { emoji: "🌙", message: "Ôn bài trước khi ngủ giúp nhớ lâu hơn đó Thư!", subtext: "Sleep tight, dream in English! 💤" },
    { emoji: "🔥", message: "Em là người giỏi nhất thế giới này (trong mắt anh)!", subtext: "Now prove it with your TOEIC score! 📈" },
    { emoji: "💐", message: "Thư à, học tiếng Anh đi rồi anh thưởng!", subtext: "Surprise chờ em khi đạt target nhé! 🎁" },
    { emoji: "🍀", message: "Lucky to have you! Em học chăm anh thương nhiều hơn~", subtext: "Each word = one more kiss! 😘" },
    { emoji: "⭐", message: "Superstar của anh! Hãy tỏa sáng với tiếng Anh của em nha!", subtext: "The world is waiting for your English skills! 🌍" },
    { emoji: "🎀", message: "Princess Thư của anh, học vocabulary đi nàooo~", subtext: "Royal vocabulary for a royal girl! 👑" },
    { emoji: "💗", message: "Anh làm app này vì yêu em, em học vì yêu anh nhé!", subtext: "Love language: English + Vietnamese + Hugs 🤗" },
    { emoji: "🌻", message: "Như hoa hướng dương hướng về mặt trời, em hãy hướng về TOEIC!", subtext: "Và anh sẽ luôn ở đây cổ vũ em! 📣" },
    { emoji: "🦋", message: "Em sẽ bay cao như bướm với tiếng Anh giỏi!", subtext: "Transformation starts today! 🐛➡️🦋" },
    { emoji: "🍓", message: "Sweet như dâu, smart như Thư! Học tiếng Anh thôiii!", subtext: "Strawberry kisses for every correct answer! 💋" },
    { emoji: "🎵", message: "Học tiếng Anh như nghe nhạc hay - addictive hơn em tưởng!", subtext: "Let's make learning your favorite song! 🎧" },
    { emoji: "🌺", message: "Xinh đẹp và thông minh - that's my Thư!", subtext: "Add 'fluent in English' to the list! ✅" },
];

// Lời khuyên học tập
const studyTips = [
    "💡 Tip: Học 10-15 từ/ngày là vừa đủ để não nhớ lâu!",
    "💡 Tip: Nghe podcast tiếng Anh khi đi học/đi làm!",
    "💡 Tip: Xem phim có sub tiếng Anh để quen với ngữ cảnh!",
    "💡 Tip: Viết nhật ký bằng tiếng Anh mỗi ngày!",
    "💡 Tip: Nói chuyện với anh bằng tiếng Anh để practice nhé!",
    "💡 Tip: Đọc to ra sẽ nhớ từ vựng nhanh hơn!",
    "💡 Tip: Học vào buổi sáng khi não còn fresh!",
    "💡 Tip: Ôn lại từ cũ trước khi học từ mới!",
];

const Home = () => {
    const [currentMessage, setCurrentMessage] = useState(null);
    const [currentTip, setCurrentTip] = useState('');
    const [showHearts, setShowHearts] = useState(false);

    useEffect(() => {
        // Random message khi load page
        const randomIndex = Math.floor(Math.random() * loveMessages.length);
        setCurrentMessage(loveMessages[randomIndex]);

        // Random tip
        const tipIndex = Math.floor(Math.random() * studyTips.length);
        setCurrentTip(studyTips[tipIndex]);

        // Hiệu ứng trái tim
        setShowHearts(true);
        const timer = setTimeout(() => setShowHearts(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const getNewMessage = () => {
        const randomIndex = Math.floor(Math.random() * loveMessages.length);
        setCurrentMessage(loveMessages[randomIndex]);
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 2000);
    };

    if (!currentMessage) return null;

    return (
        <div className="meme-game-container" style={{ textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
            {/* Floating Hearts Animation */}
            <AnimatePresence>
                {showHearts && (
                    <>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 1,
                                    y: 0,
                                    x: Math.random() * 100 - 50,
                                    scale: 0.5 + Math.random() * 0.5
                                }}
                                animate={{
                                    opacity: 0,
                                    y: -200 - Math.random() * 100,
                                    rotate: Math.random() * 360
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2 + Math.random(), delay: i * 0.1 }}
                                style={{
                                    position: 'fixed',
                                    bottom: '20%',
                                    left: `${20 + i * 8}%`,
                                    fontSize: '1.5rem',
                                    pointerEvents: 'none',
                                    zIndex: 100
                                }}
                            >
                                {['💖', '💕', '💗', '💝', '❤️', '🩷', '💘', '💓'][i]}
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main Love Message Card */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="glass-panel"
                style={{
                    padding: 'clamp(1.5rem, 5vw, 3rem)',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,142,83,0.15), rgba(255,107,161,0.15))',
                    border: '2px solid rgba(255,107,161,0.3)'
                }}
            >
                {/* Header */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ fontSize: 'clamp(3rem, 12vw, 5rem)', marginBottom: '1rem' }}
                >
                    {currentMessage.emoji}
                </motion.div>

                <h2 style={{
                    fontSize: 'clamp(1.3rem, 5vw, 2rem)',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6ba1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.75rem',
                    lineHeight: 1.4
                }}>
                    Gửi em Thư yêu dấu 💕
                </h2>

                <motion.p
                    key={currentMessage.message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: 'var(--text-color)'
                    }}
                >
                    "{currentMessage.message}"
                </motion.p>

                <motion.p
                    key={currentMessage.subtext}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic'
                    }}
                >
                    {currentMessage.subtext}
                </motion.p>

                {/* Get New Message Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={getNewMessage}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '50px',
                        border: '2px solid rgba(255,107,161,0.5)',
                        background: 'rgba(255,107,161,0.1)',
                        color: '#ff6ba1',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Sparkles size={16} /> Lời yêu thương khác
                </motion.button>
            </motion.div>

            {/* Study Tip */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel"
                style={{
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
                    borderLeft: '4px solid #fbbf24'
                }}
            >
                <p style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)', margin: 0 }}>
                    {currentTip}
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}
            >
                <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/study'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2.5rem)',
                        fontSize: 'clamp(0.95rem, 3.5vw, 1.1rem)'
                    }}
                >
                    <BookOpen size={20} /> Học từ vựng ngay!
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/meme-game'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        border: '2px solid var(--color-primary)',
                        background: 'transparent',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.85rem, 3vw, 1rem)'
                    }}
                >
                    <Zap size={18} /> Chơi Meme Game 🎮
                </motion.button>
            </motion.div>

            {/* Footer Note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.8 }}
                style={{
                    marginTop: '2rem',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
                    color: 'var(--text-muted)'
                }}
            >
                Made with 💖 cho em Thư yêu của anh
            </motion.p>
        </div>
    );
};

export default Home;
