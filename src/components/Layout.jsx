import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <header style={{ textAlign: 'center', margin: '2rem 0' }}>
                <h1 className="heading-lg" style={{ fontSize: '2rem' }}>TOEIC Love Tracker 💖</h1>
            </header>

            <Navbar />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.main>
        </div>
    );
};

export default Layout;
