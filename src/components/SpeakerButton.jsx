import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import useTTS from '../hooks/useTTS';

/**
 * Speaker button component for pronouncing English words
 * Click to hear the word spoken aloud
 */
const SpeakerButton = ({
    word,
    size = 18,
    showLabel = false,
    style = {},
    className = ''
}) => {
    const { speak, isSupported } = useTTS();

    if (!isSupported) return null;

    const handleClick = (e) => {
        e.stopPropagation(); // Prevent parent click events
        speak(word);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            title={`Nghe phát âm: ${word}`}
            className={className}
            style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '50%',
                width: size + 14,
                height: size + 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                marginLeft: '0.5rem',
                flexShrink: 0,
                ...style
            }}
        >
            <Volume2 size={size} />
            {showLabel && <span style={{ marginLeft: 4, fontSize: '0.8rem' }}>Nghe</span>}
        </motion.button>
    );
};

export default SpeakerButton;
