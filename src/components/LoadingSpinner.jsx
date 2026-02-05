import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(255, 215, 0, 0.3)',
                    borderTop: '4px solid #FFD700',
                    borderRadius: '50%'
                }}
            />
            <motion.p
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                    fontSize: '1.2rem',
                    color: '#FFD700',
                    fontWeight: '600'
                }}
            >
                {message}
            </motion.p>
        </div>
    );
};

export default LoadingSpinner;
