import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './useSound';
import memeData from '../data/memeData.json';

// Difficulty settings
export const difficultySettings = {
    easy: { time: 45, lives: 5, wrongWords: 3, pointMultiplier: 0.5, xpMultiplier: 0.5 },
    normal: { time: 30, lives: 3, wrongWords: 5, pointMultiplier: 1, xpMultiplier: 1 },
    hard: { time: 20, lives: 2, wrongWords: 7, pointMultiplier: 1.5, xpMultiplier: 1.5 },
    extreme: { time: 15, lives: 1, wrongWords: 10, pointMultiplier: 2, xpMultiplier: 2.5 }
};

export const gameModes = [
    { id: 'classic', name: 'Classic', desc: 'Chơi theo vòng, không giới hạn', emoji: '🏹', color: '#8b5cf6' },
    { id: 'blitz', name: 'Tốc Chiến', desc: '60s để ghi điểm cao nhất', emoji: '⚡', color: '#f59e0b' },
    { id: 'survival', name: 'Sinh Tồn', desc: '1 mạng duy nhất', emoji: '💀', color: '#ef4444' }
];

export const xpLevels = {
    1: 100, 2: 300, 3: 600, 4: 1000, 5: 1500,
    6: 2200, 7: 3000, 8: 4000, 9: 5500, 10: 7500
};

export const getLevelFromXP = (xp) => {
    let level = 1;
    for (const [lvl, req] of Object.entries(xpLevels)) {
        if (xp >= req) level = parseInt(lvl) + 1;
    }
    return level;
};

export const getTitleFromLevel = (level) => {
    if (level >= 10) return "Thánh Meme 👑";
    if (level >= 8) return "Chúa Hề 🤡";
    if (level >= 6) return "Danh Hài 🎭";
    if (level >= 4) return "Học Việc 🎓";
    return "Tân Binh 🌱";
};

export const getXPProgress = (xp) => {
    const currentLevel = getLevelFromXP(xp);
    const nextLevelReq = xpLevels[currentLevel] || xp * 1.5;
    const prevLevelReq = xpLevels[currentLevel - 1] || 0;
    return Math.min(100, Math.max(0, ((xp - prevLevelReq) / (nextLevelReq - prevLevelReq)) * 100));
};

export const useMemeGame = () => {
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [selectedWords, setSelectedWords] = useState([]);
    const [options, setOptions] = useState([]);
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost
    const [timeLeft, setTimeLeft] = useState(30);
    const [showFeedback, setShowFeedback] = useState(null);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [roundComplete, setRoundComplete] = useState(false);
    const [difficulty, setDifficulty] = useState('normal');
    const [particles, setParticles] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [combo, setCombo] = useState(0);
    const [availablePowerUps, setAvailablePowerUps] = useState(['hint', 'freeze']);
    const [shieldActive, setShieldActive] = useState(false);
    const [doublePoints, setDoublePoints] = useState(false);
    const [frozenTime, setFrozenTime] = useState(false);
    const [newAchievement, setNewAchievement] = useState(null);
    const [gameMode, setGameMode] = useState('classic');
    const [lastMeme, setLastMeme] = useState(null);
    const [coins, setCoins] = useState(() => {
        const saved = localStorage.getItem('memeGameCoins');
        return saved ? parseInt(saved) : 100;
    });

    // Stats state
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('memeGameStats');
        const today = new Date().toDateString();
        const defaultStats = {
            highScore: 0, totalGames: 0, gamesWon: 0, totalCorrect: 0,
            maxStreak: 0, perfectRounds: 0, fastRounds: 0, closeWins: 0,
            unlockedAchievements: [],
            completedLevels: { easy: [], normal: [], hard: [], extreme: [] },
            totalXP: 0, dailyStreak: 0, lastPlayDate: null, bossesDefeated: 0,
            todayCorrect: 0, todayGames: 0, dailyChallengeCompleted: null
        };
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.lastPlayDate !== today) {
                parsed.todayCorrect = 0;
                parsed.todayGames = 0;
                const lastDate = new Date(parsed.lastPlayDate);
                const todayDate = new Date(today);
                // Simple streak check logic
                const diffTime = Math.abs(todayDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    parsed.dailyStreak = (parsed.dailyStreak || 0) + 1;
                } else if (diffDays > 1) {
                    parsed.dailyStreak = 1;
                }
                parsed.lastPlayDate = today;
            }
            return { ...defaultStats, ...parsed };
        }
        return { ...defaultStats, lastPlayDate: today };
    });

    const playSound = useSound();
    const roundStartTime = useRef(Date.now());
    const perfectRound = useRef(true);
    const hasSavedGame = useRef(!!localStorage.getItem('memeGameSavedProgress'));

    // --- Persist Stats & Coins ---
    useEffect(() => {
        localStorage.setItem('memeGameStats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('memeGameCoins', coins.toString());
    }, [coins]);

    // --- Auto Save Game Progress ---
    useEffect(() => {
        if (gameState === 'playing') {
            const gameProgress = {
                currentRound,
                score,
                lives,
                availablePowerUps,
                difficulty,
                streak,
                version: 1,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('memeGameSavedProgress', JSON.stringify(gameProgress));
            hasSavedGame.current = true;
        } else if (gameState === 'lost' || gameState === 'won') {
            localStorage.removeItem('memeGameSavedProgress');
            hasSavedGame.current = false;
        }
    }, [currentRound, score, lives, availablePowerUps, difficulty, streak, gameState]);

    // Check saved game availability for Menu
    const checkSavedGame = useCallback(() => {
        return !!localStorage.getItem('memeGameSavedProgress');
    }, []);

    // --- XP Logic ---
    const addXP = useCallback((amount) => {
        const settings = difficultySettings[difficulty];
        const multiplier = settings.xpMultiplier;
        const totalAmount = Math.round(amount * multiplier);

        setStats(prev => {
            const newXP = (prev.totalXP || 0) + totalAmount;
            return { ...prev, totalXP: newXP };
        });

        // Show floating XP (simplified)
    }, [difficulty]);

    // --- Game Logic functions ---
    const continueGame = () => {
        const saved = localStorage.getItem('memeGameSavedProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                setCurrentRound(progress.currentRound || 0);
                setScore(progress.score || 0);
                setLives(progress.lives || 3);
                setAvailablePowerUps(progress.availablePowerUps || ['hint']);
                setDifficulty(progress.difficulty || 'normal');
                setStreak(progress.streak || 0);
                setGameState('playing');
                setRoundComplete(false);
                setCombo(0);
                setSelectedWords([]);
            } catch (e) {
                console.error("Failed to load save", e);
                localStorage.removeItem('memeGameSavedProgress');
            }
        }
    };

    const startGame = () => {
        localStorage.removeItem('memeGameSavedProgress');
        setCurrentRound(0);
        setScore(0);
        setLives(gameModes.find(m => m.id === gameMode)?.id === 'survival' ? 1 : difficultySettings[difficulty].lives);
        setStreak(0);
        setMaxStreak(0);
        setCombo(0);
        setGameState('playing');
        setShieldActive(false);
        setDoublePoints(false);
        setFrozenTime(false);
        setAvailablePowerUps(['hint']);
    };

    const handleGameWon = () => {
        setShowConfetti(true);
        setGameState('won');

        const baseXP = 100;
        const perfectBonus = perfectRound.current ? 50 : 0;
        const difficultyBonus = { easy: 0, normal: 25, hard: 50, extreme: 100 }[difficulty];
        const totalXP = baseXP + perfectBonus + difficultyBonus;

        addXP(totalXP);
        setCoins(c => c + Math.round(score / 10));

        setStats(prev => ({
            ...prev,
            totalGames: prev.totalGames + 1,
            gamesWon: prev.gamesWon + 1,
            highScore: Math.max(prev.highScore, score),
            todayGames: (prev.todayGames || 0) + 1
        }));

        setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleGameLost = () => {
        setLastMeme(memeData[currentRound]);
        setGameState('lost');
        setStats(prev => ({
            ...prev,
            totalGames: prev.totalGames + 1,
            highScore: Math.max(prev.highScore, score)
        }));
    };

    // --- Timer Logic ---
    useEffect(() => {
        if (gameState !== 'playing' || roundComplete || frozenTime) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (shieldActive) {
                        setShieldActive(false);
                        return difficultySettings[difficulty].time / 2;
                    }
                    setLives(l => {
                        if (l <= 1) {
                            handleGameLost();
                            return 0;
                        }
                        return l - 1;
                    });
                    // Skip to next round if time runs out but lives remain
                    if (currentRound < memeData.length - 1) {
                        setCurrentRound(r => r + 1);
                        return difficultySettings[difficulty].time;
                    } else {
                        handleGameWon();
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, roundComplete, frozenTime, currentRound, difficulty, shieldActive]);

    // --- Clean up particles ---
    useEffect(() => {
        if (particles.length > 0) {
            const timer = setTimeout(() => setParticles([]), 1000);
            return () => clearTimeout(timer);
        }
    }, [particles]);

    // --- Generate Options for New Round ---
    useEffect(() => {
        if (currentRound < memeData.length && gameState === 'playing') {
            const current = memeData[currentRound];

            // Safety check for invalid data
            if (!current || !current.wrongWords) {
                console.error(`Missing data for round ${currentRound}`, current);
                if (currentRound < memeData.length - 1) {
                    setCurrentRound(r => r + 1);
                } else {
                    handleGameWon();
                }
                return;
            }

            const settings = difficultySettings[difficulty];
            const wrongToShow = current.wrongWords.slice(0, settings.wrongWords);
            const allWords = [...current.correctWords, ...wrongToShow];
            const shuffled = allWords.sort(() => Math.random() - 0.5);
            setOptions(shuffled);
            setSelectedWords([]);
            setTimeLeft(settings.time);
            setRoundComplete(false);
            roundStartTime.current = Date.now();
            perfectRound.current = true;
        }
    }, [currentRound, gameState, difficulty]);

    // --- Interactions ---
    const handleWordClick = (word, e) => {
        if (roundComplete || selectedWords.includes(word)) return;

        const current = memeData[currentRound];
        if (!current) return;

        const isCorrect = current.correctWords.includes(word);

        // Add particle effect
        const rect = e.target.getBoundingClientRect();
        setParticles(prev => [...prev, {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top,
            color: isCorrect ? '#10b981' : '#ef4444'
        }]);

        if (isCorrect) {
            playSound('correct');
            const newSelected = [...selectedWords, word];
            setSelectedWords(newSelected);

            // Score calculation
            const timeBonus = Math.floor(timeLeft / 5) * 10;
            const streakBonus = streak * 5;
            const points = (100 + timeBonus + streakBonus) * (difficultySettings[difficulty].pointMultiplier) * (doublePoints ? 2 : 1);

            setScore(s => s + Math.round(points));
            setCombo(c => c + 1);

            if (newSelected.length === 5) { // Win Round
                setRoundComplete(true);
                playSound('win');
                setStreak(s => {
                    const newStreak = s + 1;
                    if (newStreak > maxStreak) setMaxStreak(newStreak);
                    if (newStreak % 5 === 0) {
                        // Milestone bonus logic could go here
                    }
                    return newStreak;
                });

                setStats(s => ({
                    ...s,
                    totalCorrect: (s.totalCorrect || 0) + 5,
                    maxStreak: Math.max(s.maxStreak, streak + 1)
                }));

                setTimeout(() => {
                    if (currentRound < memeData.length - 1) {
                        setCurrentRound(r => r + 1);
                    } else {
                        handleGameWon();
                    }
                }, 1500);
            }
        } else {
            playSound('wrong');
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    handleGameLost();
                    return 0;
                }
                return newLives;
            });
            setStreak(0);
            setCombo(0);
            perfectRound.current = false;

            setShowFeedback({ message: 'Sai rồi!', type: 'error' });
            setTimeout(() => setShowFeedback(null), 1000);
        }
    };

    const usePowerUp = (type) => {
        if (coins < 50) {
            setShowFeedback({ message: 'Không đủ vàng! (Cần 50)', type: 'error' });
            setTimeout(() => setShowFeedback(null), 1500);
            return;
        }

        setCoins(c => c - 50);
        playSound('powerup');

        switch (type) {
            case 'hint':
                const current = memeData[currentRound];
                const unselectedCorrect = current.correctWords.filter(w => !selectedWords.includes(w));
                if (unselectedCorrect.length > 0) {
                    const hintWord = unselectedCorrect[0];
                    // Auto select the word
                    handleWordClick(hintWord, { target: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 0 }) } });
                }
                break;
            case 'freeze':
                setFrozenTime(true);
                setTimeout(() => setFrozenTime(false), 5000);
                break;
            // Add other powerups here
        }
    };

    return {
        // State
        currentRound, score, lives, selectedWords, options, gameState, timeLeft,
        showFeedback, streak, maxStreak, roundComplete, difficulty, particles,
        showConfetti, combo, availablePowerUps, shieldActive, doublePoints, frozenTime,
        newAchievement, gameMode, lastMeme, coins, stats,

        // Actions
        setDifficulty, setGameMode, setGameState, startGame, continueGame, handleWordClick,
        usePowerUp, checkSavedGame,

        // Data
        currentMeme: memeData[currentRound],
        totalRounds: memeData.length
    };
};
