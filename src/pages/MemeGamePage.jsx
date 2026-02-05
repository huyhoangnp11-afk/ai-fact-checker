import React from 'react';
import MemeGame from '../components/MemeGame';
import { motion } from 'framer-motion';

const MemeGamePage = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ paddingBottom: '2rem' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>
                    🎮 Meme Vocabulary
                </h1>
                <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>
                    Nhìn emoji, đoán từ vựng liên quan - Như game show Chung Sức!
                </p>
            </div>

            <MemeGame />
        </motion.div>
    );
};

export default MemeGamePage;
