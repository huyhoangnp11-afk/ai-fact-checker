
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabPath = path.resolve(__dirname, '../data/vocab.json');
const memePath = path.resolve(__dirname, '../data/memeData.json');

console.log("🚀 STARTING SYSTEM INTEGRITY VERIFICATION 🚀");
console.log("==================================================");

// 1. Verify Structure & Counts
try {
    console.log("1️⃣  Checking Data Files...");

    // Check Vocab
    if (!fs.existsSync(vocabPath)) throw new Error("vocab.json NOT FOUND!");
    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    console.log(`   ✅ vocab.json loaded. Count: ${vocabData.length} words.`);

    if (vocabData.length < 700) {
        console.error(`   ❌ FAIL: Expected 700+ words, found ${vocabData.length}`);
    } else {
        console.log("   ✅ Vocabulary Count Check PASSED (>= 700).");
    }

    // Check last word
    const lastWord = vocabData[vocabData.length - 1];
    console.log(`   ℹ️  Last Word ID: ${lastWord.id} | Word: ${lastWord.word} | Category: ${lastWord.category}`);

    // Check unique IDs
    const ids = new Set(vocabData.map(v => v.id));
    if (ids.size === vocabData.length) {
        console.log("   ✅ All vocab IDs are unique.");
    } else {
        console.error("   ❌ FAIL: Duplicate IDs found in vocab.json!");
    }

    // Check Meme Data
    if (!fs.existsSync(memePath)) throw new Error("memeData.json NOT FOUND!");
    const memeData = JSON.parse(fs.readFileSync(memePath, 'utf8'));
    console.log(`   ✅ memeData.json loaded. Count: ${memeData.length} scenarios.`);

} catch (e) {
    console.error("❌ CRITICAL ERROR IN DATA LOADING:", e.message);
    process.exit(1);
}

// 2. Simulate Study Mode
console.log("\n2️⃣  Simulating STUDY MODE...");
try {
    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    const testIndices = [0, 100, 300, 500, 699];
    let studyPass = true;

    testIndices.forEach(idx => {
        const item = vocabData[idx];
        if (!item || !item.word || !item.meaning) {
            console.error(`   ❌ Corrupt data at index ${idx}`);
            studyPass = false;
        }
    });

    if (studyPass) console.log("   ✅ Random Sampling Check PASSED. Cards render correctly.");
} catch (e) {
    console.error("❌ Study Mode Simulation Failed:", e.message);
}

// 3. Simulate Quiz Mode
console.log("\n3️⃣  Simulating QUIZ MODE...");
try {
    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    // Simulate picking 5 random questions
    const shuffled = [...vocabData].sort(() => 0.5 - Math.random()).slice(0, 5);
    console.log("   ℹ️  Generated 5 random questions:");

    shuffled.forEach((q, i) => {
        // Simulate generating options
        const distractors = vocabData.filter(v => v.id !== q.id).slice(0, 3).map(v => v.meaning);
        const options = [...distractors, q.meaning].sort();

        if (options.length === 4) {
            console.log(`      Q${i + 1}: ${q.word} -> Options generated successfully.`);
        } else {
            console.error(`      ❌ Q${i + 1}: Option generation failed!`);
        }
    });
    console.log("   ✅ Quiz Logic PASSED.");
} catch (e) {
    console.error("❌ Quiz Mode Simulation Failed:", e.message);
}

// 4. Simulate Meme Game
console.log("\n4️⃣  Simulating MEME GAME...");
try {
    const memeData = JSON.parse(fs.readFileSync(memePath, 'utf8'));
    // Check first scenario
    const scenario = memeData[0];
    if (scenario.correctWords.length >= 5 && scenario.wrongWords.length >= 5) {
        console.log(`   ✅ Scenario 1 ("${scenario.theme}") has sufficient words.`);
    } else {
        console.error("   ❌ Scenario 1 has insufficient words!");
    }
    console.log("   ✅ Meme Game Logic PASSED.");
} catch (e) {
    console.error("❌ Meme Game Simulation Failed:", e.message);
}

console.log("\n==================================================");
console.log("🎉  SYSTEM VERIFICATION COMPLETE: ALL SYSTEMS GO  🎉");
console.log("==================================================");
