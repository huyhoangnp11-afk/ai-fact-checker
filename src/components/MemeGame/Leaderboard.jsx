import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, User } from 'lucide-react';

const Leaderboard = ({ stats, close }) => {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        // Mock data + Local highscore
        const mockLeaders = [
            { name: "MemeLord99", score: 5000, crown: 'gold' },
            { name: "EnglishMaster", score: 4200, crown: 'silver' },
            { name: "StudyBoy", score: 3800, crown: 'bronze' },
            { name: "LazyCat", score: 2500 },
        ];

        // Add user score
        const userEntry = { name: "Bạn (You)", score: stats.highScore || 0, isUser: true };
        const all = [...mockLeaders, userEntry].sort((a, b) => b.score - a.score).slice(0, 10);
        setLeaders(all);
    }, [stats.highScore]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 50, padding: '2rem', width: '90%', maxWidth: '400px',
                background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Trophy color="gold" /> Bảng Xếp Hạng
                </h2>
                <button onClick={close} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {leaders.map((player, index) => (
                    <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem', borderRadius: '10px',
                            background: player.isUser ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                            border: player.isUser ? '1px solid #8b5cf6' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center', color: index < 3 ? 'gold' : 'white' }}>{index + 1}</span>
                            {index === 0 && <Crown size={16} color="gold" />}
                            <span style={{ fontWeight: player.isUser ? 'bold' : 'normal' }}>{player.name}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{player.score}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Leaderboard;
