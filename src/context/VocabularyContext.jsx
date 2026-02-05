import React, { createContext, useState, useEffect, useContext } from 'react';
import vocabDataSource from '../data/vocab.json';

const VocabularyContext = createContext();

export const VocabularyProvider = ({ children }) => {
    const [vocabData, setVocabData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulating async fetch for consistent API, but using local JSON data
        const loadVocab = async () => {
            try {
                // In a real app, you might fetch this from an API
                // For now, we use the imported JSON directly
                // Ensure data validity
                if (vocabDataSource && Array.isArray(vocabDataSource)) {
                    setVocabData(vocabDataSource);
                } else {
                    throw new Error("Invalid vocabulary data format");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading vocabulary:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadVocab();
    }, []);

    return (
        <VocabularyContext.Provider value={{ vocabData, loading, error }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    return useContext(VocabularyContext);
};
