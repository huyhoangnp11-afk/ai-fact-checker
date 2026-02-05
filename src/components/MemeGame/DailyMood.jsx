import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

const dailyMessages = [
    { emoji: "🚀", title: "bùng nổ", text: "Hôm nay năng lượng của bạn sẽ bùng nổ như pháo hoa! Hãy tận dụng để học hết mình.", color: "#ef4444" },
    { emoji: "🐢", title: "chậm mà chắc", text: "Không cần vội vàng, cứ 'slow but sure' như chú rùa, bạn sẽ đến đích!", color: "#10b981" },
    { emoji: "🦁", title: "mạnh mẽ", text: "Hãy dũng cảm đối mặt với từ vựng khó. Bạn là chúa sơn lâm của TOEIC!", color: "#f59e0b" },
    { emoji: "🦉", title: "uyên bác", text: "Trí tuệ của bạn đang ở đỉnh cao. Hôm nay là ngày tốt để giải đề!", color: "#8b5cf6" },
    { emoji: "🦄", title: "phép màu", text: "Sẽ có điều kỳ diệu xảy ra. Có thể là bạn sẽ nhớ hết 10 từ mới trong 1 nốt nhạc?", color: "#ec4899" },
    { emoji: "🧘", title: "an nhiên", text: "Giữ tâm tĩnh lặng trước sóng gió bài thi. Hít thở sâu và chọn đáp án C!", color: "#06b6d4" },
    { emoji: "🎯", title: "tập trung", text: "Mục tiêu đã định, đừng xao nhãng. 'Focus' là keyword của hôm nay.", color: "#dc2626" },
    { emoji: "🍀", title: "may mắn", text: "Thần may mắn đang mỉm cười. Khoanh lụi cũng trúng (nhưng học thì tốt hơn)!", color: "#84cc16" }
];

const DailyMood = ({ close }) => {
    const [flipped, setFlipped] = useState(false);
    const [card, setCard] = useState(null);

    useEffect(() => {
        // Select logic based on date hash to be consistent for the day? 
        // Or just random for fun? Let's do random for now but save to localStorage if we want "once per day".
        // For fun: simple random.
        const random = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
        setCard(random);
    }, []);

    if (!card) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
            }}
            onClick={close}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <motion.div
                    style={{ width: '300px', height: '450px', cursor: 'pointer', perspective: '1000px' }}
                    onClick={() => setFlipped(true)}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        style={{
                            width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* Front (Back of card visually) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
                            borderRadius: '20px', border: '2px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                        }}>
                            <div style={{ textAlign: 'center', opacity: 0.7 }}>
                                <Sparkles size={60} color="#c084fc" />
                                <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontFamily: 'serif' }}>Daily Tarot</div>
                                <div style={{ fontSize: '0.8rem' }}>Chạm để lật bài</div>
                            </div>
                        </div>

                        {/* Back (Content) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                            borderRadius: '20px', padding: '2rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', color: '#1f2937',
                            boxShadow: '0 0 50px rgba(255,255,255, 0.3)'
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{card.emoji}</div>
                            <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', color: card.color, marginBottom: '0.5rem' }}>
                                {card.title}
                            </h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                "{card.text}"
                            </p>
                            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                                Thông điệp vũ trụ gửi bạn ✨
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {flipped && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={close}
                        style={{
                            marginTop: '2rem', background: 'white', color: 'black',
                            border: 'none', padding: '0.8rem 2rem', borderRadius: '50px',
                            fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '2rem auto 0'
                        }}
                    >
                        Nhận thông điệp
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default DailyMood;
