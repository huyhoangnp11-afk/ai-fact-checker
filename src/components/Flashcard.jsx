import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb } from 'lucide-react';

const Flashcard = ({ data }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showTip, setShowTip] = useState(false);

    // Reset states when vocab changes
    useEffect(() => {
        setIsFlipped(false);
        setShowTranslation(false);
        setShowTip(false);
    }, [data]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleSpeak = (e) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slower for beginners
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div style={{ perspective: '1000px', width: '320px', height: '450px', cursor: 'pointer' }} onClick={handleFlip}>
            <motion.div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Front Side */}
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                    }}
                >
                    <span style={{
                        background: 'var(--accent)',
                        color: 'var(--text-color)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        {data.partOfSpeech}
                    </span>

                    <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{data.word}</h2>

                    {/* Phonetic Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '1.1rem' }}>{data.phonetic}</span>
                            <button
                                onClick={handleSpeak}
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                                title="Nghe phát âm"
                            >
                                <Volume2 size={20} />
                            </button>
                        </div>

                        {/* Vietnamese Phonetic - Beginner Friendly! */}
                        {data.phoneticVi && (
                            <div style={{
                                background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                marginTop: '8px',
                                border: '2px dashed #ff9800'
                            }}>
                                <span style={{ fontSize: '1.1rem', color: '#e65100', fontWeight: 'bold' }}>
                                    🗣️ Đọc: "{data.phoneticVi}"
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                        👆 Chạm để xem nghĩa
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        overflowY: 'auto'
                    }}
                >
                    {/* Meaning with Emoji */}
                    <h3 style={{
                        fontSize: '1.6rem',
                        color: 'var(--primary)',
                        marginBottom: '1rem',
                        lineHeight: '1.4'
                    }}>
                        {data.meaning}
                    </h3>

                    {/* Example Section */}
                    <div style={{
                        width: '100%',
                        background: '#f5f5f5',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '0.5rem'
                    }}>
                        <p style={{ fontStyle: 'italic', color: '#333', fontSize: '0.95rem', marginBottom: '8px' }}>
                            📝 "{data.example}"
                        </p>

                        {/* Example Translation Toggle */}
                        {data.ExampleMeaning && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setShowTranslation(!showTranslation)}
                                    style={{
                                        background: showTranslation ? 'var(--secondary)' : 'transparent',
                                        border: '1px solid var(--secondary)',
                                        color: showTranslation ? 'white' : 'var(--secondary)',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {showTranslation ? '🔒 Ẩn dịch' : '🔓 Xem dịch'}
                                </button>
                                {showTranslation && (
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        marginTop: '8px',
                                        background: '#e8f5e9',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    }}>
                                        ✅ {data.ExampleMeaning}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Learning Tip - Beginner Friendly! */}
                    {data.tip && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                marginTop: 'auto'
                            }}
                        >
                            <button
                                onClick={() => setShowTip(!showTip)}
                                style={{
                                    background: showTip ? 'linear-gradient(135deg, #ffd54f, #ffb300)' : 'transparent',
                                    border: '2px solid #ffc107',
                                    color: showTip ? '#333' : '#ff8f00',
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    margin: '0 auto',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Lightbulb size={16} />
                                {showTip ? 'Ẩn mẹo' : '💡 Mẹo học'}
                            </button>
                            {showTip && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                                    border: '2px solid #ffc107',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '0.9rem', color: '#5d4037', fontWeight: '500' }}>
                                        💡 {data.tip}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;
