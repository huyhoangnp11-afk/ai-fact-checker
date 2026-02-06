import { useState, useEffect, useCallback, useRef } from 'react';
import { useVocabulary } from '../context/VocabularyContext';

const TIMER_SECONDS = 20;
const XP_REWARDS = [8, 10, 10, 12, 15]; // Variable rewards
const GOLD_WORD_CHANCE = 0.2; // 20% chance for 3x XP

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getRandomXP = () => XP_REWARDS[Math.floor(Math.random() * XP_REWARDS.length)];

const useKingGame = () => {
    const { vocabData, loading } = useVocabulary();

    // Game State
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost, roundEnd
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambledLetters, setScrambledLetters] = useState([]);
    const [userAnswer, setUserAnswer] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [wordsCompleted, setWordsCompleted] = useState(0);
    const [isGoldWord, setIsGoldWord] = useState(false);
    const [difficulty, setDifficulty] = useState(1); // 1-5
    const [feedbackMessage, setFeedbackMessage] = useState('');

    // UI Feedback State
    const [lastEarnedXP, setLastEarnedXP] = useState(0);
    const [showXPPopup, setShowXPPopup] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(1);

    // Timer ref
    const timerRef = useRef(null);
    // Prevent duplicate check calls
    const hasCheckedRef = useRef(false);

    // Load saved progress
    useEffect(() => {
        const saved = localStorage.getItem('kingGameProgress');
        if (saved) {
            const data = JSON.parse(saved);
            setTotalXP(data.totalXP || 0);
            setStreak(data.streak || 0);
            setWordsCompleted(data.wordsCompleted || 0);
        }
    }, []);

    // Save progress
    const saveProgress = useCallback(() => {
        localStorage.setItem('kingGameProgress', JSON.stringify({
            totalXP,
            streak,
            wordsCompleted,
            lastPlayed: new Date().toISOString()
        }));
    }, [totalXP, streak, wordsCompleted]);

    // Get word by difficulty
    const getWordByDifficulty = useCallback(() => {
        if (!vocabData || vocabData.length === 0) return null;

        let filteredWords = vocabData;

        // Filter by word length based on difficulty
        switch (difficulty) {
            case 1: // Tập sự: 3-5 letters
                filteredWords = vocabData.filter(w => w.word.length >= 3 && w.word.length <= 5);
                break;
            case 2: // Sơ cấp: 5-7 letters
                filteredWords = vocabData.filter(w => w.word.length >= 5 && w.word.length <= 7);
                break;
            case 3: // Trung cấp: 7-9 letters
                filteredWords = vocabData.filter(w => w.word.length >= 7 && w.word.length <= 9);
                break;
            case 4: // Cao cấp: 9-11 letters
                filteredWords = vocabData.filter(w => w.word.length >= 9 && w.word.length <= 11);
                break;
            case 5: // Vua: 10+ letters
                filteredWords = vocabData.filter(w => w.word.length >= 10);
                break;
            default:
                filteredWords = vocabData;
        }

        // Fallback if no words match
        if (filteredWords.length === 0) {
            filteredWords = vocabData;
        }

        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }, [vocabData, difficulty]);

    // Start new round
    const startRound = useCallback(() => {
        const word = getWordByDifficulty();
        if (!word) return;

        setCurrentWord(word);

        // Create scrambled letters with unique IDs
        const letters = word.word.toUpperCase().split('').map((letter, index) => ({
            id: `${letter}-${index}-${Date.now()}`,
            letter,
            isUsed: false
        }));
        setScrambledLetters(shuffleArray(letters));
        setUserAnswer([]);
        setTimeLeft(TIMER_SECONDS);
        setIsGoldWord(Math.random() < GOLD_WORD_CHANCE);
        setFeedbackMessage('');
        hasCheckedRef.current = false; // Reset check guard
        setGameState('playing');

        // Start timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setGameState('lost');
                    setStreak(0);
                    setFeedbackMessage('Hết giờ rồi cưng ơi! 😭');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [getWordByDifficulty]);

    // Start game
    const startGame = useCallback(() => {
        setScore(0);
        setWordsCompleted(0);
        startRound();
    }, [startRound]);

    // Add letter to answer
    const addLetter = useCallback((letterObj) => {
        if (gameState !== 'playing') return;

        setScrambledLetters(prev =>
            prev.map(l => l.id === letterObj.id ? { ...l, isUsed: true } : l)
        );
        setUserAnswer(prev => [...prev, letterObj]);
    }, [gameState]);

    // Remove letter from answer
    const removeLetter = useCallback((letterObj) => {
        if (gameState !== 'playing') return;

        setScrambledLetters(prev =>
            prev.map(l => l.id === letterObj.id ? { ...l, isUsed: false } : l)
        );
        setUserAnswer(prev => prev.filter(l => l.id !== letterObj.id));
    }, [gameState]);

    // Check answer
    const checkAnswer = useCallback(() => {
        if (!currentWord || hasCheckedRef.current) return;

        const userWord = userAnswer.map(l => l.letter).join('');
        const correctWord = currentWord.word.toUpperCase();

        if (userWord === correctWord) {
            // Prevent duplicate calls
            hasCheckedRef.current = true;

            // Correct!
            clearInterval(timerRef.current);

            const baseXP = getRandomXP();
            const multiplier = isGoldWord ? 3 : 1;
            const earnedXP = baseXP * multiplier;

            // Calculate if level up will happen
            const oldLevel = Math.floor(totalXP / 100) + 1;
            const newLevel = Math.floor((totalXP + earnedXP) / 100) + 1;

            setScore(prev => prev + earnedXP);
            setTotalXP(prev => prev + earnedXP);
            setStreak(prev => prev + 1);
            setWordsCompleted(prev => prev + 1);

            // Trigger XP popup
            setLastEarnedXP(earnedXP);
            setShowXPPopup(true);
            setTimeout(() => setShowXPPopup(false), 1500);

            // Check for level up
            if (newLevel > oldLevel) {
                setPrevLevel(oldLevel);
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 3000);
            }

            const messages = [
                'Đỉnh của chóp! 🎉',
                'Quá là xịn! 🌟',
                'Đúng rồi nè cưng!',
                'Xuất sắc ông giáo! 🏆',
                'Gà thì dẹp, bạn là vua! 👑'
            ];
            setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)] +
                (isGoldWord ? ' (TỪ VÀNG x3!)' : ''));

            setGameState('roundEnd');
            saveProgress();
        }
    }, [currentWord, userAnswer, isGoldWord, saveProgress, totalXP]);

    // Auto-check when answer is complete
    useEffect(() => {
        if (gameState === 'playing' && currentWord && userAnswer.length === currentWord.word.length) {
            checkAnswer();
        }
    }, [userAnswer, currentWord, checkAnswer, gameState]);

    // Continue to next round
    const nextRound = useCallback(() => {
        // Increase difficulty every 5 words
        if (wordsCompleted > 0 && wordsCompleted % 5 === 0 && difficulty < 5) {
            setDifficulty(prev => Math.min(prev + 1, 5));
        }
        startRound();
    }, [wordsCompleted, difficulty, startRound]);

    // Reset game
    const resetGame = useCallback(() => {
        clearInterval(timerRef.current);
        setGameState('menu');
        setCurrentWord(null);
        setScrambledLetters([]);
        setUserAnswer([]);
        setScore(0);
        setDifficulty(1);
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Calculate level from XP
    const level = Math.floor(totalXP / 100) + 1;
    const xpToNextLevel = 100 - (totalXP % 100);

    // Difficulty names
    const difficultyNames = {
        1: 'Tập Sự',
        2: 'Sơ Cấp',
        3: 'Trung Cấp',
        4: 'Cao Cấp',
        5: 'Vua'
    };

    return {
        // State
        gameState,
        currentWord,
        scrambledLetters,
        userAnswer,
        timeLeft,
        score,
        streak,
        totalXP,
        level,
        xpToNextLevel,
        wordsCompleted,
        isGoldWord,
        difficulty,
        difficultyName: difficultyNames[difficulty],
        feedbackMessage,
        loading,

        // UI Feedback
        lastEarnedXP,
        showXPPopup,
        showLevelUp,

        // Actions
        startGame,
        addLetter,
        removeLetter,
        nextRound,
        resetGame,
        setDifficulty
    };
};

export default useKingGame;
