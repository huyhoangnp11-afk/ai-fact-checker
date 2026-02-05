import React from 'react';
import Quiz from '../components/Quiz';

const QuizPage = () => {
    return (
        <div style={{ paddingBottom: '4rem' }}>
            <h2 className="heading-lg" style={{ textAlign: 'center', marginBottom: '2rem' }}>Quick Quiz ⚡</h2>
            <Quiz />
        </div>
    );
};

export default QuizPage;
