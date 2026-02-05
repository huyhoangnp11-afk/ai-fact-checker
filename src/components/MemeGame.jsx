import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Heart, RefreshCw, Volume2, Zap, Star, Crown, Flame, Target, Gift, Sparkles, Play } from 'lucide-react';

// Sound effects using Web Audio API
const useSound = () => {
    const audioContext = useRef(null);

    const playSound = useCallback((type) => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = audioContext.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch (type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
            case 'levelup':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.2);
                });
                break;
            case 'combo':
                oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.15);
                break;
            case 'powerup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;
        }
    }, []);

    return playSound;
};

// Particle explosion component
const Particles = ({ x, y, color, count = 12 }) => {
    return (
        <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: 0, y: 0,
                        scale: 1,
                        opacity: 1
                    }}
                    animate={{
                        x: Math.cos(i * (360 / count) * Math.PI / 180) * 100,
                        y: Math.sin(i * (360 / count) * Math.PI / 180) * 100,
                        scale: 0,
                        opacity: 0
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: color
                    }}
                />
            ))}
        </div>
    );
};

// Confetti component
const Confetti = ({ active }) => {
    if (!active) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: -20,
                        rotate: 0
                    }}
                    animate={{
                        y: window.innerHeight + 20,
                        rotate: Math.random() * 720 - 360
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        ease: 'linear',
                        delay: Math.random() * 0.5
                    }}
                    style={{
                        position: 'absolute',
                        width: Math.random() * 10 + 5,
                        height: Math.random() * 10 + 5,
                        background: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bb5', '#a66cff'][Math.floor(Math.random() * 6)],
                        borderRadius: Math.random() > 0.5 ? '50%' : '0'
                    }}
                />
            ))}
        </div>
    );
};

// Import meme data from JSON file for better caching and smaller bundle
import memeData from '../data/memeData.json';

// Game Modes
const gameModes = [
    { id: 'classic', name: 'Classic', emoji: '🎮', desc: 'Chơi qua tất cả levels', color: '#8b5cf6' },
    { id: 'timeAttack', name: 'Time Attack', emoji: '⏱️', desc: '60s - càng nhiều điểm càng tốt', color: '#ef4444' },
    { id: 'endless', name: 'Endless', emoji: '♾️', desc: 'Chơi không giới hạn', color: '#10b981' },
    { id: 'boss', name: 'Boss Battle', emoji: '👹', desc: 'Thử thách cực khó', color: '#f59e0b' }
];

// XP Level thresholds
const xpLevels = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, 6500, 8000, 10000, 15000];
const getLevelFromXP = (xp) => {
    for (let i = xpLevels.length - 1; i >= 0; i--) {
        if (xp >= xpLevels[i]) return i + 1;
    }
    return 1;
};
const getXPProgress = (xp) => {
    const level = getLevelFromXP(xp);
    const currentLevelXP = xpLevels[level - 1] || 0;
    const nextLevelXP = xpLevels[level] || xpLevels[xpLevels.length - 1];
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

// Daily Challenge Generator
const getDailyChallenge = () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const challenges = [
        { id: 'perfectGame', name: 'Game hoàn hảo', desc: 'Hoàn thành game không sai lần nào', reward: 200, emoji: '💯' },
        { id: 'speedRun', name: 'Tốc độ ánh sáng', desc: 'Hoàn thành 5 rounds trong 60s', reward: 150, emoji: '⚡' },
        { id: 'streak10', name: 'Combo x10', desc: 'Đạt streak 10 liên tiếp', reward: 180, emoji: '🔥' },
        { id: 'noPowerUp', name: 'Tay không bắt giặc', desc: 'Thắng game không dùng power-up', reward: 120, emoji: '✊' },
        { id: 'hardMode', name: 'Thử thách hard', desc: 'Hoàn thành game ở Hard mode', reward: 250, emoji: '😰' },
        { id: 'extremeMode', name: 'Extreme warrior', desc: 'Hoàn thành game ở Extreme', reward: 400, emoji: '💀' },
        { id: 'words50', name: 'Từ vựng master', desc: 'Trả lời đúng 50 từ trong ngày', reward: 100, emoji: '📚' }
    ];
    return challenges[seed % challenges.length];
};

// Achievements (expanded to 20)
const achievements = [
    { id: 'first_win', name: 'Chiến thắng đầu tiên', emoji: '🏆', desc: 'Hoàn thành 1 game', requirement: (stats) => stats.gamesWon >= 1, xp: 50 },
    { id: 'streak_5', name: 'Combo Master', emoji: '🔥', desc: 'Đạt streak 5 liên tiếp', requirement: (stats) => stats.maxStreak >= 5, xp: 75 },
    { id: 'streak_10', name: 'Combo God', emoji: '🌟', desc: 'Đạt streak 10 liên tiếp', requirement: (stats) => stats.maxStreak >= 10, xp: 150 },
    { id: 'perfect_round', name: 'Perfect!', emoji: '💯', desc: 'Hoàn thành round không sai', requirement: (stats) => stats.perfectRounds >= 1, xp: 60 },
    { id: 'perfect_5', name: 'Perfectionist', emoji: '✨', desc: '5 Perfect rounds', requirement: (stats) => stats.perfectRounds >= 5, xp: 120 },
    { id: 'speed_demon', name: 'Thần tốc', emoji: '⚡', desc: 'Hoàn thành round trong 10s', requirement: (stats) => stats.fastRounds >= 1, xp: 80 },
    { id: 'speed_master', name: 'Flash', emoji: '💨', desc: '10 Fast rounds', requirement: (stats) => stats.fastRounds >= 10, xp: 200 },
    { id: 'survivor', name: 'Sống sót', emoji: '❤️‍🔥', desc: 'Thắng với 1 mạng còn lại', requirement: (stats) => stats.closeWins >= 1, xp: 100 },
    { id: 'highscore_500', name: 'High Scorer', emoji: '👑', desc: 'Đạt 500+ điểm', requirement: (stats) => stats.highScore >= 500, xp: 100 },
    { id: 'highscore_1000', name: 'Score King', emoji: '🏅', desc: 'Đạt 1000+ điểm', requirement: (stats) => stats.highScore >= 1000, xp: 200 },
    { id: 'highscore_2000', name: 'Legendary', emoji: '🌈', desc: 'Đạt 2000+ điểm', requirement: (stats) => stats.highScore >= 2000, xp: 500 },
    { id: 'dedicated_10', name: 'Chăm chỉ', emoji: '📚', desc: 'Chơi 10 games', requirement: (stats) => stats.totalGames >= 10, xp: 80 },
    { id: 'dedicated_50', name: 'Cống hiến', emoji: '🎖️', desc: 'Chơi 50 games', requirement: (stats) => stats.totalGames >= 50, xp: 200 },
    { id: 'dedicated_100', name: 'Huyền thoại', emoji: '👨‍🎓', desc: 'Chơi 100 games', requirement: (stats) => stats.totalGames >= 100, xp: 500 },
    { id: 'vocabulary_100', name: 'Vua từ vựng', emoji: '🎓', desc: 'Trả lời đúng 100 từ', requirement: (stats) => stats.totalCorrect >= 100, xp: 100 },
    { id: 'vocabulary_500', name: 'Từ điển sống', emoji: '📖', desc: 'Trả lời đúng 500 từ', requirement: (stats) => stats.totalCorrect >= 500, xp: 300 },
    { id: 'vocabulary_1000', name: 'Oxford', emoji: '🏛️', desc: 'Trả lời đúng 1000 từ', requirement: (stats) => stats.totalCorrect >= 1000, xp: 1000 },
    { id: 'all_easy', name: 'Easy Clear', emoji: '😊', desc: 'Hoàn thành tất cả Easy', requirement: (stats) => (stats.completedLevels?.easy?.length || 0) >= 30, xp: 150 },
    { id: 'all_normal', name: 'Normal Clear', emoji: '😐', desc: 'Hoàn thành tất cả Normal', requirement: (stats) => (stats.completedLevels?.normal?.length || 0) >= 30, xp: 300 },
    { id: 'all_hard', name: 'Hard Clear', emoji: '😰', desc: 'Hoàn thành tất cả Hard', requirement: (stats) => (stats.completedLevels?.hard?.length || 0) >= 30, xp: 500 },
    { id: 'all_extreme', name: 'Extreme Legend', emoji: '💀', desc: 'Hoàn thành tất cả Extreme', requirement: (stats) => (stats.completedLevels?.extreme?.length || 0) >= 30, xp: 1000 },
    { id: 'daily_7', name: 'Tuần lễ cháy', emoji: '📅', desc: 'Chơi 7 ngày liên tiếp', requirement: (stats) => stats.dailyStreak >= 7, xp: 200 },
    { id: 'level_5', name: 'Rising Star', emoji: '⭐', desc: 'Đạt Level 5', requirement: (stats) => getLevelFromXP(stats.totalXP || 0) >= 5, xp: 0 },
    { id: 'level_10', name: 'Champion', emoji: '🏆', desc: 'Đạt Level 10', requirement: (stats) => getLevelFromXP(stats.totalXP || 0) >= 10, xp: 0 },
    { id: 'boss_slayer', name: 'Boss Slayer', emoji: '👹', desc: 'Đánh bại 1 Boss', requirement: (stats) => stats.bossesDefeated >= 1, xp: 300 }
];

// Power-ups (expanded)
const powerUps = [
    { id: 'freeze', name: 'Freeze', emoji: '❄️', desc: 'Dừng thời gian 5s', cost: 0 },
    { id: 'hint', name: 'Hint', emoji: '💡', desc: 'Loại bỏ 3 từ sai', cost: 0 },
    { id: 'shield', name: 'Shield', emoji: '🛡️', desc: 'Miễn sai 1 lần', cost: 50 },
    { id: 'double', name: 'Double', emoji: '✨', desc: 'Nhân đôi điểm round này', cost: 100 },
    { id: 'extraLife', name: 'Extra Life', emoji: '💖', desc: 'Thêm 1 mạng', cost: 75 },
    { id: 'reveal', name: 'Reveal', emoji: '👁️', desc: 'Hiện 1 từ đúng', cost: 30 },
    { id: 'timeBonus', name: 'Time +10s', emoji: '⏰', desc: 'Thêm 10 giây', cost: 40 },
    { id: 'skipRound', name: 'Skip', emoji: '⏭️', desc: 'Bỏ qua round này', cost: 150 }
];

// Titles based on level
const getTitleFromLevel = (level) => {
    const titles = [
        'Tân binh', 'Học viên', 'Người học', 'Sinh viên', 'Thực tập',
        'Nhân viên', 'Chuyên viên', 'Chuyên gia', 'Cao thủ', 'Bậc thầy',
        'Đại sư', 'Huyền thoại', 'Thần thánh', 'Bất tử', 'Vĩnh cửu'
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
};

// 🤠 CÂU BẮT TREND HỀ HỀ MIỀN TÂY - Random khi thắng round!
const mienTayPhrases = [
    { text: "Hề hề, ez quá mà bà con ơi!", emoji: "🤠" },
    { text: "Dễ như ăn chuối luôn bà con!", emoji: "🍌" },
    { text: "Xuất sắc zai! Sắp vô địch rồi!", emoji: "🌟" },
    { text: "Mỉn ơi, giỏi dữ đi!", emoji: "💪" },
    { text: "Trôi bấy như xuồng gà!", emoji: "⛵" },
    { text: "Mẹ mốc lòm! Ai bằng mày!", emoji: "👑" },
    { text: "Chơi ởm sao, nghe bà con!", emoji: "😎" },
    { text: "Dữ dội vô song!", emoji: "🔥" },
    { text: "Cha nội! Giỏi quá trời!", emoji: "🌈" },
    { text: "Còn ai xuất sắc hơn hông?", emoji: "🏆" },
    { text: "Gà mờ cũng chơi được nha bà con!", emoji: "🐓" },
    { text: "Sò cứu TOEIC!", emoji: "🫂" },
    { text: "Khá bảnh luôn đó trời!", emoji: "✨" },
    { text: "Dzui quá bà con ơi!", emoji: "🎉" },
    { text: "Ok luôn chú em, e dễ thương!", emoji: "💕" },
    { text: "Vô đối! King of miền Tây!", emoji: "👑" },
    { text: "Chuẩn luôn xích lô!", emoji: "🚤" },
    { text: "Sài Gòn xl mà, hề hề!", emoji: "🏠" },
    { text: "Chúc mừng! Lễ làng!", emoji: "🎊" },
    { text: "Trôi bấy như chuối chín!", emoji: "🍌" },
    { text: "E xuất sắc quá đi, hề hề!", emoji: "🤩" },
    { text: "Căng đét luôn bà con!", emoji: "💯" },
    { text: "Ăn nỉ luôn, EZ!", emoji: "🍽️" },
    { text: "Dễ ợt quận nha!", emoji: "🫡" },
    { text: "Sục sôi miền Tây!", emoji: "🔥" },
];

// Random phrase helper
const getRandomMienTayPhrase = () => {
    return mienTayPhrases[Math.floor(Math.random() * mienTayPhrases.length)];
};

const MemeGame = () => {
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
    const [activePowerUp, setActivePowerUp] = useState(null);
    const [availablePowerUps, setAvailablePowerUps] = useState(['hint', 'freeze']);
    const [shieldActive, setShieldActive] = useState(false);
    const [doublePoints, setDoublePoints] = useState(false);
    const [frozenTime, setFrozenTime] = useState(false);
    const [newAchievement, setNewAchievement] = useState(null);
    const [gameMode, setGameMode] = useState('classic');
    const [showLevelUp, setShowLevelUp] = useState(null);
    const [dailyChallenge] = useState(getDailyChallenge());
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [lastMeme, setLastMeme] = useState(null); // Track the meme when player lost
    const [coins, setCoins] = useState(() => {
        const saved = localStorage.getItem('memeGameCoins');
        return saved ? parseInt(saved) : 100;
    });
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
            // Reset daily stats if new day
            if (parsed.lastPlayDate !== today) {
                parsed.todayCorrect = 0;
                parsed.todayGames = 0;
                // Check daily streak
                const lastDate = new Date(parsed.lastPlayDate);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
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
    const usedPowerUp = useRef(false);

    // Difficulty settings
    const difficultySettings = {
        easy: { time: 45, lives: 5, wrongWords: 3, pointMultiplier: 0.5, xpMultiplier: 0.5 },
        normal: { time: 30, lives: 3, wrongWords: 5, pointMultiplier: 1, xpMultiplier: 1 },
        hard: { time: 20, lives: 2, wrongWords: 7, pointMultiplier: 1.5, xpMultiplier: 1.5 },
        extreme: { time: 15, lives: 1, wrongWords: 10, pointMultiplier: 2, xpMultiplier: 2.5 }
    };

    // Save stats and coins
    useEffect(() => {
        localStorage.setItem('memeGameStats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('memeGameCoins', coins.toString());
    }, [coins]);

    // Auto-save game progress
    useEffect(() => {
        if (gameState === 'playing') {
            const gameProgress = {
                currentRound,
                score,
                lives,
                availablePowerUps,
                difficulty,
                streak,
                version: 1, // versioning for future compatibility
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('memeGameSavedProgress', JSON.stringify(gameProgress));
        } else if (gameState === 'lost' || gameState === 'won') {
            // Clear progress on game over
            localStorage.removeItem('memeGameSavedProgress');
        }
    }, [currentRound, score, lives, availablePowerUps, difficulty, streak, gameState]);

    // Add XP helper
    const addXP = useCallback((amount) => {
        const settings = difficultySettings[difficulty];
        const xpToAdd = Math.round(amount * settings.xpMultiplier);
        setStats(prev => {
            const oldLevel = getLevelFromXP(prev.totalXP || 0);
            const newXP = (prev.totalXP || 0) + xpToAdd;
            const newLevel = getLevelFromXP(newXP);

            if (newLevel > oldLevel) {
                setShowLevelUp({ oldLevel, newLevel, title: getTitleFromLevel(newLevel) });
                playSound('achievement');
                setCoins(c => c + newLevel * 25); // Bonus coins on level up
            }

            return { ...prev, totalXP: newXP };
        });
    }, [difficulty, playSound]);

    // Check achievements
    const checkAchievements = useCallback(() => {
        achievements.forEach(achievement => {
            if (!stats.unlockedAchievements.includes(achievement.id) && achievement.requirement(stats)) {
                setStats(prev => ({
                    ...prev,
                    unlockedAchievements: [...prev.unlockedAchievements, achievement.id]
                }));
                setNewAchievement(achievement);
                playSound('powerup');
                setTimeout(() => setNewAchievement(null), 3000);
            }
        });
    }, [stats, playSound]);

    useEffect(() => {
        checkAchievements();
    }, [stats.gamesWon, stats.highScore, stats.maxStreak, checkAchievements]);

    // Shuffle và tạo options
    useEffect(() => {
        if (currentRound < memeData.length && gameState === 'playing') {
            const current = memeData[currentRound];

            // Safety check: if data is missing, auto-win or skip
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

    // Timer
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
                            setGameState('lost');
                            return 0;
                        }
                        return l - 1;
                    });
                    if (currentRound < memeData.length - 1) {
                        setCurrentRound(r => r + 1);
                    } else {
                        setGameState('won');
                    }
                    return difficultySettings[difficulty].time;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, currentRound, roundComplete, difficulty, frozenTime, shieldActive]);

    const usePowerUp = (powerId) => {
        if (!availablePowerUps.includes(powerId)) return;

        playSound('powerup');
        setAvailablePowerUps(prev => prev.filter(p => p !== powerId));

        switch (powerId) {
            case 'freeze':
                setFrozenTime(true);
                setTimeout(() => setFrozenTime(false), 5000);
                break;
            case 'hint':
                const current = memeData[currentRound];
                const wrongOptions = options.filter(w => !current.correctWords.includes(w) && !selectedWords.includes(w));
                const toRemove = wrongOptions.slice(0, 3);
                setOptions(prev => prev.filter(w => !toRemove.includes(w)));
                break;
            case 'shield':
                setShieldActive(true);
                break;
            case 'double':
                setDoublePoints(true);
                break;
        }
    };

    const addParticle = (e, color) => {
        const rect = e.target.getBoundingClientRect();
        const id = Date.now();
        setParticles(prev => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color }]);
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 600);
    };

    const handleWordClick = (word, e) => {
        if (selectedWords.includes(word) || roundComplete) return;

        const current = memeData[currentRound];
        const isCorrect = current.correctWords.includes(word);
        const settings = difficultySettings[difficulty];

        if (isCorrect) {
            setSelectedWords([...selectedWords, word]);
            const basePoints = 10;
            const streakBonus = streak * 3;
            const comboBonus = combo * 2;
            let points = (basePoints + streakBonus + comboBonus) * settings.pointMultiplier;
            if (doublePoints) points *= 2;

            setScore(s => Math.round(s + points));
            setStreak(st => {
                const newStreak = st + 1;
                if (newStreak > maxStreak) setMaxStreak(newStreak);
                if (newStreak > stats.maxStreak) {
                    setStats(prev => ({ ...prev, maxStreak: newStreak }));
                }
                return newStreak;
            });
            setCombo(c => c + 1);

            addParticle(e, '#10b981');
            playSound(streak >= 4 ? 'combo' : 'correct');
            setShowFeedback('correct');

            // Speak word
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);

            // Round complete?
            if (selectedWords.length + 1 === current.correctWords.length) {
                const roundTime = (Date.now() - roundStartTime.current) / 1000;
                const timeBonus = Math.round(timeLeft * 3 * settings.pointMultiplier);

                if (doublePoints) setDoublePoints(false);
                setRoundComplete(true);
                setScore(s => s + timeBonus);
                playSound('levelup');

                // Update stats
                const levelId = current.id;
                setStats(prev => {
                    const completedLevels = prev.completedLevels || { easy: [], normal: [], hard: [], extreme: [] };
                    const currentDiffLevels = completedLevels[difficulty] || [];
                    const updatedLevels = currentDiffLevels.includes(levelId)
                        ? currentDiffLevels
                        : [...currentDiffLevels, levelId];

                    return {
                        ...prev,
                        totalCorrect: prev.totalCorrect + current.correctWords.length,
                        todayCorrect: (prev.todayCorrect || 0) + current.correctWords.length,
                        perfectRounds: perfectRound.current ? prev.perfectRounds + 1 : prev.perfectRounds,
                        fastRounds: roundTime <= 10 ? prev.fastRounds + 1 : prev.fastRounds,
                        completedLevels: {
                            ...completedLevels,
                            [difficulty]: updatedLevels
                        }
                    };
                });

                // Award XP for round completion
                const roundXP = 20 + (roundTime <= 10 ? 10 : 0) + (perfectRound.current ? 15 : 0);
                addXP(roundXP);
                setCoins(c => c + (perfectRound.current ? 5 : 2));

                // Give power-up on perfect round
                if (perfectRound.current && Math.random() > 0.5) {
                    const randomPower = powerUps[Math.floor(Math.random() * powerUps.length)].id;
                    if (!availablePowerUps.includes(randomPower)) {
                        setAvailablePowerUps(prev => [...prev, randomPower]);
                    }
                }

                setTimeout(() => {
                    if (currentRound < memeData.length - 1) {
                        setCurrentRound(r => r + 1);
                        setCombo(0);
                    } else {
                        handleGameWon();
                    }
                }, 1500);
            }
        } else {
            perfectRound.current = false;
            setStreak(0);
            setCombo(0);
            addParticle(e, '#ef4444');
            playSound('wrong');
            setShowFeedback('wrong');

            if (shieldActive) {
                setShieldActive(false);
            } else {
                setLives(l => {
                    if (l <= 1) {
                        handleGameLost();
                        return 0;
                    }
                    return l - 1;
                });
            }
        }

        setTimeout(() => setShowFeedback(null), 500);
    };

    const handleGameWon = () => {
        setShowConfetti(true);
        setGameState('won');

        // Calculate XP and coins rewards
        const baseXP = 100;
        const perfectBonus = perfectRound.current ? 50 : 0;
        const difficultyBonus = { easy: 0, normal: 25, hard: 50, extreme: 100 }[difficulty];
        const totalXP = baseXP + perfectBonus + difficultyBonus;

        // Add XP and coins
        addXP(totalXP);
        setCoins(c => c + Math.round(score / 10));

        const finalStats = {
            ...stats,
            totalGames: stats.totalGames + 1,
            gamesWon: stats.gamesWon + 1,
            highScore: Math.max(stats.highScore, score),
            closeWins: lives === 1 ? stats.closeWins + 1 : stats.closeWins,
            todayGames: (stats.todayGames || 0) + 1
        };
        setStats(finalStats);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleGameLost = () => {
        // Save the current meme to show correct answer
        setLastMeme(memeData[currentRound]);
        setGameState('lost');
        setStats(prev => ({
            ...prev,
            totalGames: prev.totalGames + 1,
            highScore: Math.max(prev.highScore, score)
        }));
    };

    const continueGame = () => {
        const saved = localStorage.getItem('memeGameSavedProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                setCurrentRound(progress.currentRound);
                setScore(progress.score);
                setLives(progress.lives);
                setAvailablePowerUps(progress.availablePowerUps);
                setDifficulty(progress.difficulty);
                setStreak(progress.streak);
                setGameState('playing');
                // Ensure correct words etc. are reset for the round
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
        // Clear old save when starting fresh
        localStorage.removeItem('memeGameSavedProgress');
        setCurrentRound(0);
        setScore(0);
        setLives(difficultySettings[difficulty].lives);
        setStreak(0);
        setMaxStreak(0);
        setCombo(0);
        setGameState('playing');
        setShieldActive(false);
        setDoublePoints(false);
        setFrozenTime(false);
        setAvailablePowerUps(['hint']);
    };

    const current = gameState === 'playing' ? memeData[currentRound] : null;

    // Safety fallback for render
    if (gameState === 'playing' && !current) {
        return (
            <div className="meme-game-container">
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading data... or Data Error for Round {currentRound + 1}
                </div>
            </div>
        );
    }

    // Menu Screen
    if (gameState === 'menu') {
        const hasSavedGame = !!localStorage.getItem('memeGameSavedProgress');

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="meme-game-container"
                style={{ textAlign: 'center' }}
            >
                <motion.div
                    className="glass-panel menu-panel"
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    style={{ padding: 'clamp(1rem, 4vw, 2rem)', marginBottom: '1rem' }}
                >
                    {/* Header with Player Level */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>Level {getLevelFromXP(stats.totalXP || 0)}</div>
                            <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>{getTitleFromLevel(getLevelFromXP(stats.totalXP || 0))}</div>
                        </div>
                        <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)' }}>🎮</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '1.2rem' }}>🪙</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{coins}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>🔥 {stats.dailyStreak || 0} ngày</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Meme Vocabulary</h2>
                    <p style={{ opacity: 0.7, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Nhìn emoji, đoán từ vựng!</p>

                    {/* Continue Button */}
                    {hasSavedGame && (
                        <motion.button
                            className="btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={continueGame}
                            style={{
                                width: '100%',
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                                padding: '1rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            <Play size={24} fill="currentColor" /> Tiếp tục chơi
                        </motion.button>
                    )}

                    {/* XP Progress Bar */}
                    <div style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                            <span>XP: {stats.totalXP || 0}</span>
                            <span>Next: {xpLevels[getLevelFromXP(stats.totalXP || 0)] || 'MAX'}</span>
                        </div>
                        <div style={{
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getXPProgress(stats.totalXP || 0)}%` }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                                    borderRadius: '10px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Daily Challenge */}
                    <motion.div
                        className="glass-panel"
                        style={{
                            padding: '0.8rem',
                            marginBottom: '1.5rem',
                            background: stats.dailyChallengeCompleted === new Date().toDateString()
                                ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))'
                                : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))',
                            borderLeft: '4px solid #fbbf24'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>📅 Daily Challenge</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{dailyChallenge.emoji} {dailyChallenge.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{dailyChallenge.desc}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>+{dailyChallenge.reward} XP</div>
                                {stats.dailyChallengeCompleted === new Date().toDateString() && (
                                    <div style={{ color: '#10b981', fontSize: '0.8rem' }}>✓ Hoàn thành!</div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Game Mode Selection */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Chế độ chơi:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                            {gameModes.map(mode => (
                                <motion.button
                                    key={mode.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setGameMode(mode.id)}
                                    style={{
                                        padding: '0.6rem 0.8rem',
                                        borderRadius: '10px',
                                        border: '2px solid',
                                        borderColor: gameMode === mode.id ? mode.color : 'rgba(255,255,255,0.1)',
                                        background: gameMode === mode.id ? `${mode.color}33` : 'transparent',
                                        color: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>{mode.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: gameMode === mode.id ? 'bold' : 'normal', fontSize: '0.9rem' }}>{mode.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{mode.desc}</div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <div>
                            <Crown size={20} color="gold" />
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.highScore}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>High Score</div>
                        </div>
                        <div>
                            <Flame size={20} color="#ef4444" />
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.maxStreak}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Max Streak</div>
                        </div>
                        <div>
                            <Trophy size={20} color="#f59e0b" />
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.gamesWon}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Wins</div>
                        </div>
                        <div>
                            <Star size={20} color="#8b5cf6" />
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{stats.totalCorrect || 0}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Words</div>
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: 'clamp(0.8rem, 3vw, 1rem)' }}>Độ khó:</p>
                        <div className="difficulty-selector" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Object.keys(difficultySettings).map(diff => {
                                const completedCount = (stats.completedLevels?.[diff] || []).length;
                                const totalLevels = memeData.length;
                                return (
                                    <motion.button
                                        key={diff}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setDifficulty(diff)}
                                        style={{
                                            padding: 'clamp(0.35rem, 1.5vw, 0.5rem) clamp(0.6rem, 2.5vw, 1rem)',
                                            borderRadius: '10px',
                                            border: '2px solid',
                                            borderColor: difficulty === diff ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                                            background: difficulty === diff ? 'var(--color-primary)' : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            fontWeight: difficulty === diff ? 'bold' : 'normal',
                                            fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
                                            position: 'relative'
                                        }}
                                    >
                                        {diff === 'easy' && '😊 '}
                                        {diff === 'normal' && '😐 '}
                                        {diff === 'hard' && '😰 '}
                                        {diff === 'extreme' && '💀 '}
                                        {diff}
                                        {completedCount > 0 && (
                                            <span style={{
                                                marginLeft: '0.4rem',
                                                fontSize: '0.7rem',
                                                opacity: 0.8,
                                                background: completedCount === totalLevels ? 'gold' : 'rgba(255,255,255,0.2)',
                                                color: completedCount === totalLevels ? '#000' : 'inherit',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '10px'
                                            }}>
                                                {completedCount === totalLevels ? '✓' : `${completedCount}/${totalLevels}`}
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Level Grid */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Levels ({(stats.completedLevels?.[difficulty] || []).length}/{memeData.length}):
                        </p>
                        <div className="level-grid">
                            {memeData.map(level => {
                                const isCompleted = (stats.completedLevels?.[difficulty] || []).includes(level.id);
                                return (
                                    <motion.div
                                        key={level.id}
                                        whileHover={{ scale: 1.15 }}
                                        style={{
                                            width: 'clamp(28px, 8vw, 36px)',
                                            height: 'clamp(28px, 8vw, 36px)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isCompleted
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : 'rgba(255,255,255,0.1)',
                                            border: isCompleted ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                                            cursor: 'default',
                                            boxShadow: isCompleted ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
                                        }}
                                        title={`${level.theme} - ${level.themeVi}`}
                                    >
                                        {isCompleted ? '⭐' : level.emoji.charAt(0)}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <motion.button
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        style={{
                            padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 8vw, 3rem)',
                            fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 auto',
                            width: 'fit-content'
                        }}
                    >
                        <Zap size={20} /> Bắt đầu!
                    </motion.button>
                </motion.div>

                {/* Achievements */}
                <motion.div
                    className="glass-panel"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ padding: '1.5rem' }}
                >
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Star size={20} color="gold" /> Thành tựu
                    </h3>
                    <div className="achievements-grid">
                        {achievements.map(ach => {
                            const unlocked = stats.unlockedAchievements.includes(ach.id);
                            return (
                                <motion.div
                                    key={ach.id}
                                    whileHover={{ scale: 1.1 }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        background: unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                        opacity: unlocked ? 1 : 0.4,
                                        cursor: 'pointer'
                                    }}
                                    title={`${ach.name}: ${ach.desc}`}
                                >
                                    <div className="achievement-emoji" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>{ach.emoji}</div>
                                    <div className="achievement-name" style={{ fontSize: 'clamp(0.55rem, 2vw, 0.7rem)', marginTop: '0.25rem' }}>{ach.name}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // Game Over screens
    if (gameState === 'lost' || gameState === 'won') {
        return (
            <>
                <Confetti active={showConfetti} />
                <motion.div
                    className="glass-panel meme-game-container"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: 2, duration: 0.3 }}
                        style={{ fontSize: 'clamp(3rem, 12vw, 5rem)', marginBottom: '1rem' }}
                    >
                        {gameState === 'won' ? '🎉' : '😢'}
                    </motion.div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '1rem', color: gameState === 'won' ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {gameState === 'won' ? 'Congratulations!' : 'Game Over!'}
                    </h2>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 4vw, 2rem)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                            <Trophy size={28} color="gold" />
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>{score}</div>
                            <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>Điểm</div>
                        </div>
                        <div>
                            <Flame size={28} color="#ef4444" />
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>{maxStreak}</div>
                            <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>Max Streak</div>
                        </div>
                        <div>
                            <Target size={28} color="#3b82f6" />
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>{currentRound}/{memeData.length}</div>
                            <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>Vòng</div>
                        </div>
                    </div>

                    {/* Show correct answer when lost */}
                    {gameState === 'lost' && lastMeme && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                padding: 'clamp(1rem, 3vw, 1.5rem)',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                                borderRadius: '16px',
                                border: '2px solid rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <div style={{ fontSize: '0.9rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                📖 Đáp án đúng:
                            </div>
                            <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', marginBottom: '0.5rem' }}>
                                {lastMeme.emoji}
                            </div>
                            <div style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {lastMeme.theme}
                            </div>
                            <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {lastMeme.themeVi}
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                justifyContent: 'center'
                            }}>
                                {lastMeme.words.map((word, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                                            fontWeight: '500'
                                        }}
                                    >
                                        ✓ {word}
                                    </span>
                                ))}
                            </div>
                            <div style={{
                                marginTop: '0.75rem',
                                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                                color: '#f59e0b',
                                fontStyle: 'italic'
                            }}>
                                💡 Học từ này để lần sau nhớ nha!
                            </div>
                        </motion.div>
                    )}

                    {score > stats.highScore - score && gameState === 'won' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                borderRadius: '50px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1.5rem',
                                color: '#000'
                            }}
                        >
                            <Crown size={20} /> NEW HIGH SCORE!
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            className="btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={20} /> Chơi lại
                        </motion.button>
                        <motion.button
                            className="glass-panel"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setGameState('menu')}
                            style={{ padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer' }}
                        >
                            Menu
                        </motion.button>
                    </div>
                </motion.div>
            </>
        );
    }

    // Playing State
    return (
        <div className="meme-game-container">
            {/* Particles */}
            {particles.map(p => <Particles key={p.id} x={p.x} y={p.y} color={p.color} />)}

            {/* Header Stats */}
            <div className="game-stats-bar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Lives */}
                    <div className="glass-panel" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {[...Array(difficultySettings[difficulty].lives)].map((_, i) => (
                            <motion.div key={i} animate={{ scale: i < lives ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                                <Heart size={18} fill={i < lives ? '#ef4444' : 'transparent'} color={i < lives ? '#ef4444' : '#666'} />
                            </motion.div>
                        ))}
                        {shieldActive && <span style={{ marginLeft: '0.25rem' }}>🛡️</span>}
                    </div>

                    {/* Score */}
                    <div className="glass-panel" style={{ padding: 'clamp(0.35rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={16} color="gold" />
                        <motion.span key={score} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ fontWeight: 'bold', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
                            {score}
                        </motion.span>
                        {doublePoints && <span style={{ color: '#f59e0b' }}>x2</span>}
                    </div>

                    {/* Streak/Combo */}
                    <AnimatePresence>
                        {streak > 0 && (
                            <motion.div
                                className="glass-panel"
                                style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: `linear-gradient(135deg, rgba(${Math.min(255, streak * 30)}, ${Math.max(0, 150 - streak * 10)}, 0, 0.3), rgba(${Math.min(255, streak * 40)}, ${Math.max(0, 100 - streak * 10)}, 0, 0.3))` }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                            >
                                <Flame size={18} color={streak >= 5 ? '#ff4500' : '#f59e0b'} />
                                <span style={{ fontWeight: 'bold', color: streak >= 5 ? '#ff4500' : '#f59e0b' }}>x{streak}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Timer */}
                <motion.div
                    className="glass-panel"
                    style={{
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: frozenTime
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.3))'
                            : timeLeft <= 10
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.3))'
                                : undefined
                    }}
                    animate={timeLeft <= 5 && !frozenTime ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                >
                    {frozenTime ? <Sparkles size={20} color="#3b82f6" /> : <Timer size={20} color={timeLeft <= 10 ? '#ef4444' : 'currentColor'} />}
                    <span style={{ fontWeight: 'bold', color: timeLeft <= 10 && !frozenTime ? '#ef4444' : frozenTime ? '#3b82f6' : 'inherit', minWidth: '2ch' }}>
                        {frozenTime ? '❄️' : timeLeft}
                    </span>
                </motion.div>
            </div>

            {/* Power-ups */}
            {availablePowerUps.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
                    {availablePowerUps.map(powerId => {
                        const power = powerUps.find(p => p.id === powerId);
                        return (
                            <motion.button
                                key={powerId}
                                className="glass-panel"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => usePowerUp(powerId)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem'
                                }}
                                title={power.desc}
                            >
                                {power.emoji} {power.name}
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Progress Bar */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '6px', marginBottom: '1rem', overflow: 'hidden' }}>
                <motion.div
                    style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', height: '100%', borderRadius: '10px' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentRound + 1) / memeData.length) * 100}%` }}
                />
            </div>

            {/* Meme Card */}
            <motion.div
                className="glass-panel"
                key={currentRound}
                initial={{ x: 100, opacity: 0, rotateY: 90 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}
            >
                <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                    Vòng {currentRound + 1}/{memeData.length} • {difficulty.toUpperCase()}
                </div>

                <motion.div
                    className="meme-emoji-display"
                    style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'inline-block' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    {current.emoji}
                </motion.div>

                <h3 style={{ fontSize: 'clamp(1rem, 4vw, 1.3rem)', marginBottom: '0.25rem' }}>{current.theme}</h3>
                <p style={{ opacity: 0.7, marginBottom: '0.75rem', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)' }}>{current.themeVi} - Chọn 5 từ!</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                width: '35px', height: '6px', borderRadius: '3px',
                                background: i < selectedWords.length ? 'linear-gradient(90deg, var(--color-success), #10b981)' : 'rgba(255,255,255,0.2)'
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Word Options */}
            <div className="word-options-grid">
                <AnimatePresence>
                    {options.map((word, index) => {
                        const isSelected = selectedWords.includes(word);
                        const isCorrect = current.correctWords.includes(word);
                        const meaning = current.meanings?.[word];

                        return (
                            <motion.button
                                key={word}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={(e) => handleWordClick(word, e)}
                                disabled={isSelected}
                                className="glass-panel"
                                whileHover={!isSelected ? { scale: 1.05, y: -2 } : {}}
                                whileTap={!isSelected ? { scale: 0.95 } : {}}
                                style={{
                                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.4rem, 1.5vw, 0.6rem)',
                                    cursor: isSelected ? 'default' : 'pointer',
                                    border: 'none',
                                    background: isSelected
                                        ? (isCorrect ? 'linear-gradient(135deg, #10b98144, #10b98166)' : 'linear-gradient(135deg, #ef444444, #ef444466)')
                                        : undefined,
                                    color: isSelected ? (isCorrect ? '#10b981' : '#ef4444') : 'inherit',
                                    fontWeight: isSelected ? 'bold' : 'normal',
                                    textTransform: 'capitalize',
                                    minHeight: '44px'
                                }}
                            >
                                <div style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)' }}>
                                    {isSelected && isCorrect && '✓ '}{word}
                                </div>
                                {isSelected && meaning && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{
                                            fontSize: '0.75rem',
                                            marginTop: '0.35rem',
                                            opacity: 0.85,
                                            fontWeight: 'normal',
                                            textTransform: 'none',
                                            borderTop: '1px solid rgba(255,255,255,0.2)',
                                            paddingTop: '0.35rem'
                                        }}
                                    >
                                        {isCorrect ? '📗' : '📕'} {meaning}
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Feedback Toast */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
                            padding: '0.75rem 1.5rem', borderRadius: '50px',
                            background: showFeedback === 'correct' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        {showFeedback === 'correct' ? (streak > 3 ? `🔥 x${streak} COMBO!` : '✓ Tốt lắm!') : (shieldActive ? '🛡️ Shield!' : '✗ Sai rồi!')}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Round Complete */}
            <AnimatePresence>
                {roundComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            padding: 'clamp(1.5rem, 5vw, 2rem) clamp(2rem, 8vw, 3rem)', borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
                            color: 'white', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            maxWidth: '90vw'
                        }}
                    >
                        {(() => {
                            const phrase = getRandomMienTayPhrase();
                            return (
                                <>
                                    <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: 3, duration: 0.3 }} style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', marginBottom: '0.5rem' }}>
                                        {phrase.emoji}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', fontWeight: 'bold', marginBottom: '0.25rem' }}
                                    >
                                        {phrase.text}
                                    </motion.div>
                                    <div style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)', opacity: 0.9 }}>
                                        {perfectRound.current ? '💯 PERFECT! ' : ''}+{timeLeft * 3} bonus!
                                    </div>
                                </>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Achievement */}
            <AnimatePresence>
                {newAchievement && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        style={{
                            position: 'fixed', top: '100px', right: '20px',
                            padding: '1rem 1.5rem', borderRadius: '15px',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(251, 191, 36, 0.95))',
                            color: '#000', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem' }}>{newAchievement.emoji}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🏆 Thành tựu mới!</div>
                            <div style={{ fontSize: '0.9rem' }}>{newAchievement.name}</div>
                            {newAchievement.xp > 0 && (
                                <div style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>+{newAchievement.xp} XP</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Level Up Popup */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.7)', zIndex: 1000
                        }}
                        onClick={() => setShowLevelUp(null)}
                    >
                        <motion.div
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            style={{
                                padding: '2.5rem 4rem', borderRadius: '25px',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
                                color: 'white', textAlign: 'center',
                                boxShadow: '0 25px 80px rgba(139, 92, 246, 0.5)',
                                border: '3px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
                            >
                                🎉
                            </motion.div>
                            <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '0.3rem' }}>LEVEL UP!</div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.3rem' }}
                            >
                                {showLevelUp.newLevel}
                            </motion.div>
                            <div style={{ fontSize: '1.3rem', color: '#fbbf24', fontWeight: '600' }}>
                                {showLevelUp.title}
                            </div>
                            <div style={{ marginTop: '1rem', fontSize: '1rem', opacity: 0.9 }}>
                                🪙 +{showLevelUp.newLevel * 25} Coins
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
                                Click để tiếp tục
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemeGame;
