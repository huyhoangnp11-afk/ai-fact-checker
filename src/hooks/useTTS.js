import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for Text-to-Speech pronunciation
 * Uses Web Speech API (free, works offline, 90%+ browser support)
 */
const useTTS = () => {
    const [voices, setVoices] = useState([]);
    const [isSupported, setIsSupported] = useState(true);

    // Load available voices
    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setIsSupported(false);
            console.warn('TTS not supported in this browser');
            return;
        }

        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    /**
     * Speak text with English pronunciation
     * @param {string} text - Text to speak
     * @param {object} options - Optional settings
     */
    const speak = useCallback((text, options = {}) => {
        if (!isSupported || !text) return;

        const {
            rate = 0.85,      // Slower for learning
            pitch = 1,
            lang = 'en-US',
            voiceName = null
        } = options;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Select best English voice
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));

        let selectedVoice = null;

        if (voiceName) {
            selectedVoice = englishVoices.find(v => v.name.includes(voiceName));
        }

        if (!selectedVoice) {
            // Prefer Google voices (better quality)
            selectedVoice = englishVoices.find(v => v.name.includes('Google')) ||
                englishVoices.find(v => v.name.includes('Microsoft')) ||
                englishVoices[0];
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        speechSynthesis.speak(utterance);
    }, [voices, isSupported]);

    /**
     * Stop any ongoing speech
     */
    const stop = useCallback(() => {
        if (isSupported) {
            speechSynthesis.cancel();
        }
    }, [isSupported]);

    return {
        speak,
        stop,
        isSupported,
        voices
    };
};

export default useTTS;
