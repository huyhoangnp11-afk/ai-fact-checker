import React from 'react';
import { motion } from 'framer-motion';
import { Zap, HelpCircle, Snowflake, Shield, Coins } from 'lucide-react';

const powerUps = [
    { id: 'hint', name: 'Gợi ý', icon: HelpCircle, desc: 'Tự chọn 1 từ đúng', cost: 50, color: '#10b981' },
    { id: 'freeze', name: 'Đóng băng', icon: Snowflake, desc: 'Dừng thời gian 5s', cost: 50, color: '#3b82f6' },
    { id: 'shield', name: 'Khiên', icon: Shield, desc: 'Bảo vệ 1 mạng', cost: 100, color: '#f59e0b' },
    { id: 'double', name: 'X2 Điểm', icon: Zap, desc: 'Nhân đôi điểm vòng này', cost: 100, color: '#eab308' }
];

const GameControls = ({ availablePowerUps, usePowerUp, coins }) => {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {availablePowerUps.map(powerId => {
                const power = powerUps.find(p => p.id === powerId);
                if (!power) return null;
                const Icon = power.icon;
                const canAfford = coins >= power.cost;

                return (
                    <motion.button
                        key={powerId}
                        className="glass-panel"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => usePowerUp(powerId)}
                        disabled={!canAfford}
                        style={{
                            padding: '0.5rem 0.8rem',
                            border: '1px solid rgba(255,255,255,0.2)',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            opacity: canAfford ? 1 : 0.5,
                            background: canAfford ? undefined : 'rgba(0,0,0,0.2)'
                        }}
                        title={`${power.desc} (Giá: ${power.cost})`}
                    >
                        <Icon size={16} color={power.color} />
                        <span>{power.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.2rem' }}>
                            <Coins size={10} color="gold" /> {power.cost}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default GameControls;
