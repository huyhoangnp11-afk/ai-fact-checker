import React from 'react';
import { motion } from 'framer-motion';

const ToeicProgress = ({ score }) => {
    // TOEIC score range is typically 10-990
    // We'll calculate progress percentage based on max score of 990
    const maxScore = 990;
    const progress = Math.min((score / maxScore) * 100, 100);

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>
                Estimated TOEIC Score
            </h3>

            <div style={{ position: 'relative', height: '30px', background: 'rgba(0,0,0,0.1)', borderRadius: '15px', overflow: 'hidden', margin: '0 auto', maxWidth: '500px' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                        borderRadius: '15px'
                    }}
                />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {Math.round(score)}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    / 990
                </span>
            </div>

            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {score < 300 ? "Beginner - Keep going!" :
                    score < 500 ? "Elementary - Good start!" :
                        score < 700 ? "Intermediate - Getting there!" :
                            score < 850 ? "Advanced - Excellent!" :
                                "Expert - Master!"}
            </p>
        </div>
    );
};

export default ToeicProgress;
