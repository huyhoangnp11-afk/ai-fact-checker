import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, BookOpen, PieChart, Zap, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { path: '/', label: 'Home', icon: Heart },
        { path: '/study', label: 'Study', icon: BookOpen },
        { path: '/quiz', label: 'Quiz', icon: Zap },
        { path: '/meme-game', label: 'Game', icon: Gamepad2 },
        { path: '/stats', label: 'Stats', icon: PieChart },
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: '20px',
            zIndex: 100,
            margin: '0 auto 2rem',
            maxWidth: '600px',
            padding: '0.5rem 1rem'
        }}>
            <ul style={{
                display: 'flex',
                justifyContent: 'space-around',
                listStyle: 'none',
                alignItems: 'center'
            }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <li key={link.path}>
                            <Link to={link.path} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '10px',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                position: 'relative'
                            }}>
                                <Icon size={24} />
                                <span style={{ fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{link.label}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            width: '100%',
                                            height: '3px',
                                            background: 'var(--primary)',
                                            borderRadius: '4px'
                                        }}
                                    />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Navbar;
