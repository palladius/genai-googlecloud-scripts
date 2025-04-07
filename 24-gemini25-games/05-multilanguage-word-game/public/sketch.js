// @ts-check
// Welcome to the Multilingual Anagram Fun Zone! 🥳 v1.4.1
// Changes: Version moved to title, Improved touch drag end handling.

// --- sbrodola.sh Simulation Zone ---

// --- lib/config.js ---

const GAME_VERSION = "1.4.1"; // Updated version number

// Game Settings
const MAX_WORDS_PER_GAME = 5;
const SCORE_THRESHOLDS = { fast: 30, medium: 60, slow: 120 };
const SCORE_POINTS = { fast: 100, medium: 50, slow: 25, slowest: 10 };

// Visual Defaults
const DEFAULT_LETTER_SIZE = 40;
const DEFAULT_LETTER_SPACING = 10;
const DEFAULT_FLAG_SIZE = 30;
const HEADER_HEIGHT_PERCENT = 0.15;
const GAME_AREA_HEIGHT_PERCENT = 1.0 - HEADER_HEIGHT_PERCENT;

const BACKGROUND_COLOR = '#f0f8ff';
const FONT_SIZE_UI = 18;
const FONT_SIZE_EMOJI = 50;
const FONT_SIZE_LETTER = 30;

// --- lib/colors.js ---
const COLORS = {
    text: '#333333',
    // versionText: '#aaaaaa', // No longer needed for separate version display
    letterBg: '#ffffff',
    letterBgSelected: '#ffff99',
    letterBgSelectedKeyboard: '#add8e6',
    letterBorder: '#cccccc',
    correctHighlight: '#90ee90',
    buttonBg: '#87cefa',
    buttonText: '#ffffff',
    buttonHover: '#4682b4',
    toggleOn: '#90ee90',
    toggleOff: '#d3d3d3',
    resetButtonBg: '#ff6347',
    resetButtonHover: '#dc143c',
};

// Basic Style Functions
function applyTextStyle(p, { color = COLORS.text, size = FONT_SIZE_UI, align = p.LEFT, vAlign = p.CENTER } = {}) {
    p.fill(color);
    p.textSize(size);
    p.textAlign(align, vAlign);
    p.noStroke();
}

// --- lib/utils.js ---

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [ array[randomIndex], array[currentIndex] ];
    }
    return array;
}

function scrambleWord(word) {
     if (!word) return '';
    let letters = word.split('');
    let maxAttempts = 10;
    let attempts = 0;
    let shuffledWord = word;
    if (letters.length > 1) {
        let originalLetters = [...letters];
        letters = shuffleArray(letters);
        shuffledWord = letters.join('');
        if (shuffledWord === word && letters.length > 2) {
             attempts = 0;
            do {
                letters = shuffleArray(letters);
                shuffledWord = letters.join('');
                attempts++;
            } while (shuffledWord === word && attempts < maxAttempts);
        }
        if (letters.length === 2 && letters[0] === letters[1] && word.length === 2) {
             shuffledWord = letters.join('');
        }
    }
    return shuffledWord;
}

function isPointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function getFlagEmoji(langCode) {
    const flags = { it: '🇮🇹', en: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', de: '🇩🇪', fr: '🇫🇷' };
    return flags[langCode] || '🏳️';
}

// --- lib/word_data.js ---
const words = [ /* ... same word data as before ... */
    // Easy
    { emoji: '🍎', it: 'mela', en: 'apple', de: 'apfel', fr: 'pomme', difficulty: 'easy' },
    { emoji: '👀', it: 'occhi', en: 'eyes', de: 'augen', fr: 'yeux', difficulty: 'easy' },
    { emoji: '🏠', it: 'casa', en: 'house', de: 'haus', fr: 'maison', difficulty: 'easy' },
    { emoji: '🐶', it: 'cane', en: 'dog', de: 'hund', fr: 'chien', difficulty: 'easy' },
    { emoji: '🐱', it: 'gatto', en: 'cat', de: 'katze', fr: 'chat', difficulty: 'easy' },
    { emoji: '☀️', it: 'sole', en: 'sun', de: 'sonne', fr: 'soleil', difficulty: 'easy' },
    { emoji: '🌙', it: 'luna', en: 'moon', de: 'mond', fr: 'lune', difficulty: 'easy' },
    { emoji: '💧', it: 'acqua', en: 'water', de: 'wasser', fr: 'eau', difficulty: 'easy' },
    { emoji: '🌳', it: 'albero', en: 'tree', de: 'baum', fr: 'arbre', difficulty: 'easy' },
    { emoji: '🚗', it: 'auto', en: 'car', de: 'auto', fr: 'voiture', difficulty: 'easy' },
    // Medium
    { emoji: '🍓', it: 'fragola', en: 'strawberry', de: 'erdbeere', fr: 'fraise', difficulty: 'medium' },
    { emoji: '🐘', it: 'elefante', en: 'elephant', de: 'elefant', fr: 'éléphant', difficulty: 'medium' },
    { emoji: '⏰', it: 'orologio', en: 'clock', de: 'uhr', fr: 'horloge', difficulty: 'medium' },
    { emoji: '🦋', it: 'farfalla', en: 'butterfly', de: 'schmetterling', fr: 'papillon', difficulty: 'medium' },
    { emoji: '🌻', it: 'girasole', en: 'sunflower', de: 'sonnenblume', fr: 'tournesol', difficulty: 'medium' },
    { emoji: '🌍', it: 'mondo', en: 'world', de: 'welt', fr: 'monde', difficulty: 'medium' },
    { emoji: '🎤', it: 'microfono', en: 'microphone', de: 'mikrofon', fr: 'microphone', difficulty: 'medium' },
    // Hard
    { emoji: '♊️', it: 'gemelli', en: 'twins', de: 'zwillinge', fr: 'jumeaux', difficulty: 'hard' },
    { emoji: '🧭', it: 'bussola', en: 'compass', de: 'kompass', fr: 'boussole', difficulty: 'hard' },
    { emoji: '🔬', it: 'microscopio', en: 'microscope', de: 'mikroskop', fr: 'microscope', difficulty: 'hard' },
    { emoji: '🤔', it: 'pensare', en: 'thinking', de: 'denken', fr: 'penser', difficulty: 'hard' },
    { emoji: '🚀', it: 'razzo', en: 'rocket', de: 'rakete', fr: 'fusée', difficulty: 'hard' },
    { emoji: '🥳', it: 'festa', en: 'party', de: 'party', fr: 'fête', difficulty: 'hard' },
];

// --- lib/game_state.js ---
let gameState = 'START_SCREEN'; let currentWordData = null; let wordStates = []; let score = 0; let wordsPlayed = 0; let startTime = 0; let correctFlashTime = 0; let currentWordPool = [];
let selectedDifficulty = 'easy'; let availableLanguages = ['it', 'en', 'de', 'fr']; let selectedLanguages = ['it', 'en', 'de'];
let dragging = { active: false, isTouch: false, pointerId: null, letterIndex: -1, langIndex: -1, offsetX: 0, offsetY: 0, currentX: 0, currentY: 0 };
let keyboardState = { selectedRow: 0, selectedCol: 0, selectedLetters: [] };
let uiElements = { langToggles: [], difficultyButtons: [], startButton: null, playAgainButton: null, resetButton: null };

// --- lib/drawing.js ---

// --- REMOVED drawVersion function ---

function drawStartScreen(p) {
    p.background(BACKGROUND_COLOR);
    // *** MODIFIED: Added version to title ***
    applyTextStyle(p, { size: p.constrain(p.width / 20, 24, 40), align: p.CENTER });
    p.text(`Word Scramble Fun v${GAME_VERSION} 🤪`, p.width / 2, p.height * 0.1);

    // (Rest of start screen drawing logic remains the same)
    applyTextStyle(p, { size: FONT_SIZE_UI, align: p.LEFT });
    let startOptionsX = p.constrain(p.width * 0.1, 30, 100);
    p.text('Choose Languages:', startOptionsX, p.height * 0.2);
    uiElements.langToggles = [];
    let toggleX = startOptionsX;
    const toggleY = p.height * 0.2 + 30;
    const toggleW = p.constrain(p.width / 6, 70, 90); const toggleH = 30; const toggleSpacing = 15;
    availableLanguages.forEach((lang, index) => {
        const flag = getFlagEmoji(lang); const isSelected = selectedLanguages.includes(lang); const x = toggleX + index * (toggleW + toggleSpacing);
        if (x + toggleW < p.width * 0.95) {
           uiElements.langToggles.push({ x, y: toggleY, w: toggleW, h: toggleH, lang });
           p.stroke(COLORS.letterBorder); p.fill(isSelected ? COLORS.toggleOn : COLORS.toggleOff); p.rect(x, toggleY, toggleW, toggleH, 5);
           applyTextStyle(p, { size: FONT_SIZE_UI - 2, color: isSelected ? COLORS.text : '#888', align: p.CENTER, vAlign: p.CENTER }); p.text(`${flag} ${lang.toUpperCase()}`, x + toggleW / 2, toggleY + toggleH / 2);
        }
    });
    applyTextStyle(p, { size: FONT_SIZE_UI, align: p.LEFT });
    p.text('Choose Difficulty:', startOptionsX, p.height * 0.4);
    uiElements.difficultyButtons = [];
    let diffButtonX = startOptionsX;
    const diffButtonY = p.height * 0.4 + 30;
    const diffButtonW = p.constrain(p.width / 5, 80, 110); const diffButtonH = 40; const diffSpacing = 15;
    ['easy', 'medium', 'hard'].forEach((diff, index) => {
        const isSelected = selectedDifficulty === diff; const x = diffButtonX + index * (diffButtonW + diffSpacing);
        if (x + diffButtonW < p.width * 0.95) {
            uiElements.difficultyButtons.push({ x, y: diffButtonY, w: diffButtonW, h: diffButtonH, difficulty: diff });
            p.stroke(COLORS.letterBorder); p.fill(isSelected ? COLORS.buttonHover : COLORS.buttonBg); p.rect(x, diffButtonY, diffButtonW, diffButtonH, 5);
            applyTextStyle(p, { size: FONT_SIZE_UI, color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text(diff.charAt(0).toUpperCase() + diff.slice(1), x + diffButtonW / 2, diffButtonY + diffButtonH / 2);
        }
    });
    const startBtnW = p.constrain(p.width * 0.4, 120, 200); const startBtnH = p.constrain(p.height * 0.08, 40, 60); const startBtnX = p.width / 2 - startBtnW / 2; const startBtnY = p.height * 0.85 - startBtnH / 2; uiElements.startButton = { x: startBtnX, y: startBtnY, w: startBtnW, h: startBtnH };
    let hoverX = dragging.isTouch ? -1000 : p.mouseX; let hoverY = dragging.isTouch ? -1000 : p.mouseY; p.fill(COLORS.buttonBg); if (isPointInRect(hoverX, hoverY, startBtnX, startBtnY, startBtnW, startBtnH)) { p.fill(COLORS.buttonHover); } p.rect(startBtnX, startBtnY, startBtnW, startBtnH, 10);
    applyTextStyle(p, { size: p.constrain(startBtnH * 0.4, 16, 24), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Start Game!', startBtnX + startBtnW / 2, startBtnY + startBtnH / 2);
    // --- REMOVED drawVersion(p); ---
}

function drawPlayingScreen(p) {
    // (Drawing logic same as v1.4.0)
    if (correctFlashTime > 0 && p.millis() < correctFlashTime + 500) { p.background(COLORS.correctHighlight); if (p.millis() > correctFlashTime + 490) correctFlashTime = 0; } else { p.background(BACKGROUND_COLOR); }
    const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows;
    const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE); const letterSpacing = p.constrain(letterSize * 0.25, 5, DEFAULT_LETTER_SPACING); const flagSize = p.constrain(letterSize * 0.8, 20, DEFAULT_FLAG_SIZE); const letterFontSize = p.constrain(letterSize * 0.7, 15, FONT_SIZE_LETTER); const uiFontSize = p.constrain(headerHeight * 0.15, 14, FONT_SIZE_UI); const emojiFontSize = p.constrain(headerHeight * 0.4, 30, FONT_SIZE_EMOJI);
    const topMargin = 15; const scoreY = topMargin + uiFontSize / 2; const timerY = scoreY; const wordCountY = scoreY; const emojiY = headerHeight * 0.6; const firstRowCenterY = headerHeight + availableHeightPerRow / 2; const rowSpacing = availableHeightPerRow;
    applyTextStyle(p, { size: uiFontSize, align: p.LEFT, vAlign: p.TOP }); p.text(`Score: ${score} ❤️`, 20, topMargin); applyTextStyle(p, { size: uiFontSize, align: p.RIGHT, vAlign: p.TOP }); p.text(`Word: ${wordsPlayed + 1} / ${MAX_WORDS_PER_GAME}`, p.width - 20, topMargin);
    let elapsedTime = (p.millis() - startTime) / 1000; applyTextStyle(p, { size: uiFontSize, align: p.CENTER, vAlign: p.TOP }); p.text(`Time: ${elapsedTime.toFixed(1)}s`, p.width / 2, topMargin);
    if (currentWordData) { applyTextStyle(p, { size: emojiFontSize, align: p.CENTER }); p.text(currentWordData.emoji, p.width / 2, emojiY); }
    const resetBtnW = p.constrain(p.width * 0.2, 80, 110); const resetBtnH = p.constrain(headerHeight * 0.3, 30, 40); const resetBtnX = p.width - resetBtnW - 15; const resetBtnY = headerHeight * 0.15; uiElements.resetButton = { x: resetBtnX, y: resetBtnY, w: resetBtnW, h: resetBtnH };
    let hoverX = dragging.isTouch ? -1000 : p.mouseX; let hoverY = dragging.isTouch ? -1000 : p.mouseY; p.fill(COLORS.resetButtonBg); if (isPointInRect(hoverX, hoverY, resetBtnX, resetBtnY, resetBtnW, resetBtnH)) { p.fill(COLORS.resetButtonHover); } p.stroke(COLORS.letterBorder); p.rect(resetBtnX, resetBtnY, resetBtnW, resetBtnH, 5); applyTextStyle(p, { size: p.constrain(resetBtnH * 0.4, 12, uiFontSize), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Reset Game', resetBtnX + resetBtnW / 2, resetBtnY + resetBtnH / 2);
    wordStates.forEach((langState, langIndex) => {
        const numLetters = langState.currentLetters.length; const totalWordWidth = numLetters * letterSize + Math.max(0, numLetters - 1) * letterSpacing; const totalRowWidth = flagSize + 15 + totalWordWidth; const rowStartY = firstRowCenterY + langIndex * rowSpacing - letterSize / 2;
        let rowStartX = (p.width - totalRowWidth) / 2; rowStartX = Math.max(rowStartX, 10);
        const flagX = rowStartX; const flagY = rowStartY + letterSize / 2; applyTextStyle(p, { size: flagSize, align: p.CENTER, vAlign: p.CENTER }); p.text(getFlagEmoji(langState.lang), flagX + flagSize / 2, flagY);
        let currentLetterX = flagX + flagSize + 15; langState.letterBoxes = [];
        langState.currentLetters.forEach((letter, letterIndex) => {
            langState.letterBoxes.push({ x: currentLetterX, y: rowStartY, w: letterSize, h: letterSize }); let bgColor = COLORS.letterBg; const isKeyboardSelectedPair = keyboardState.selectedLetters.some(sel => sel.langIndex === langIndex && sel.letterIndex === letterIndex); if (isKeyboardSelectedPair) { bgColor = COLORS.letterBgSelected; } if (keyboardState.selectedRow === langIndex && keyboardState.selectedCol === letterIndex) { if (!isKeyboardSelectedPair) { bgColor = COLORS.letterBgSelectedKeyboard; } }
            p.stroke(COLORS.letterBorder); p.fill(bgColor); p.rect(currentLetterX, rowStartY, letterSize, letterSize, 5);
            applyTextStyle(p, { size: letterFontSize, align: p.CENTER, vAlign: p.CENTER }); p.text(letter.toUpperCase(), currentLetterX + letterSize / 2, rowStartY + letterSize / 2);
            currentLetterX += letterSize + letterSpacing;
        });
    });
     if (dragging.active) { const { letterIndex, langIndex, offsetX, offsetY } = dragging; const dragX = dragging.currentX - offsetX; const dragY = dragging.currentY - offsetY; const letter = wordStates[langIndex]?.currentLetters[letterIndex]; if (letter) { p.stroke(COLORS.letterBorder); p.fill(COLORS.letterBgSelected); p.rect(dragX, dragY, letterSize, letterSize, 5); applyTextStyle(p, { size: letterFontSize, align: p.CENTER, vAlign: p.CENTER }); p.text(letter.toUpperCase(), dragX + letterSize / 2, dragY + letterSize / 2); } }
    // --- REMOVED drawVersion(p); ---
}

function drawGameOverScreen(p) {
    // (Drawing logic same as v1.4.0)
    p.background(BACKGROUND_COLOR);
    applyTextStyle(p, { size: p.constrain(p.width / 15, 30, 60), align: p.CENTER, color: '#dc143c' }); p.text('Game Over! 🎉', p.width / 2, p.height * 0.3);
    applyTextStyle(p, { size: p.constrain(p.width / 20, 24, 40), align: p.CENTER }); p.text(`Final Score: ${score} ❤️`, p.width / 2, p.height * 0.5);
    const btnW = p.constrain(p.width * 0.5, 150, 250); const btnH = p.constrain(p.height * 0.1, 45, 70); const btnX = p.width / 2 - btnW / 2; const btnY = p.height * 0.7 - btnH / 2; uiElements.playAgainButton = { x: btnX, y: btnY, w: btnW, h: btnH };
    let hoverX = dragging.isTouch ? -1000 : p.mouseX; let hoverY = dragging.isTouch ? -1000 : p.mouseY; p.fill(COLORS.buttonBg); if (isPointInRect(hoverX, hoverY, btnX, btnY, btnW, btnH)) { p.fill(COLORS.buttonHover); } p.rect(btnX, btnY, btnW, btnH, 10); applyTextStyle(p, { size: p.constrain(btnH * 0.4, 18, 28), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Play Again?', btnX + btnW / 2, btnY + btnH / 2);
    // --- REMOVED drawVersion(p); ---
}

// --- lib/game_logic.js ---
// (startGame, nextWord, checkWinCondition, swapLetters remain the same)
function startGame(p) { const difficultiesToInclude = []; if (selectedDifficulty === 'easy') difficultiesToInclude.push('easy'); else if (selectedDifficulty === 'medium') difficultiesToInclude.push('easy', 'medium'); else difficultiesToInclude.push('easy', 'medium', 'hard'); let baseWordPool = words.filter(word => difficultiesToInclude.includes(word.difficulty)); currentWordPool = shuffleArray([...baseWordPool]); if (currentWordPool.length === 0) { alert("Whoops! No words found for that difficulty."); gameState = 'START_SCREEN'; return; } score = 0; wordsPlayed = -1; gameState = 'PLAYING'; nextWord(p); }
function nextWord(p) { wordsPlayed++; if (wordsPlayed >= MAX_WORDS_PER_GAME) { gameState = 'GAME_OVER'; return; } if (currentWordPool.length === 0) { alert("Wow, you played all the words! 🎉 Game Over!"); gameState = 'GAME_OVER'; return; } currentWordData = currentWordPool.pop(); wordStates = []; selectedLanguages.forEach(lang => { const correctWord = currentWordData[lang]; if (correctWord) { const scrambled = scrambleWord(correctWord); wordStates.push({ lang, correctWord, currentLetters: scrambled.split(''), letterBoxes: [], isCorrect: false }); } else { console.warn(`Missing word data: ${lang}, ${currentWordData.emoji}`); } }); keyboardState.selectedRow = 0; keyboardState.selectedCol = 0; if (wordStates.length > 0 && wordStates[0].currentLetters.length > 0) { keyboardState.selectedCol = Math.min(keyboardState.selectedCol, wordStates[0].currentLetters.length - 1); } else { keyboardState.selectedCol = 0; } keyboardState.selectedLetters = []; startTime = p.millis(); correctFlashTime = 0; console.log(`Word ${wordsPlayed + 1}: ${currentWordData.emoji} (${currentWordData.en})`); }
function checkWinCondition(p) { if (wordStates.length === 0) return; let allCorrect = true; wordStates.forEach(state => { const currentWord = state.currentLetters.join(''); state.isCorrect = (currentWord.toLowerCase() === state.correctWord.toLowerCase()); if (!state.isCorrect) allCorrect = false; }); if (allCorrect) { console.log("Word Correct!"); correctFlashTime = p.millis(); let elapsedTime = (p.millis() - startTime) / 1000; let points = 0; if (elapsedTime <= SCORE_THRESHOLDS.fast) points = SCORE_POINTS.fast; else if (elapsedTime <= SCORE_THRESHOLDS.medium) points = SCORE_POINTS.medium; else if (elapsedTime <= SCORE_THRESHOLDS.slow) points = SCORE_POINTS.slow; else points = SCORE_POINTS.slowest; score += points; setTimeout(() => { if (gameState === 'PLAYING') { nextWord(p); keyboardState.selectedRow = 0; keyboardState.selectedCol = 0; keyboardState.selectedLetters = []; } }, 600); } }
function swapLetters(langIndex, index1, index2) { if (langIndex < 0 || langIndex >= wordStates.length) return; const state = wordStates[langIndex]; if (!state || !state.currentLetters) return; if (index1 < 0 || index1 >= state.currentLetters.length || index2 < 0 || index2 >= state.currentLetters.length) return; console.log(`Swapping lang ${langIndex}: idx ${index1} & ${index2}`); [state.currentLetters[index1], state.currentLetters[index2]] = [state.currentLetters[index2], state.currentLetters[index1]]; }


// --- lib/input_handler.js ---

// --- MOUSE Handlers --- (Remain the same)
function handleMousePressed(p) { if (dragging.active) return; let pressX = p.mouseX; let pressY = p.mouseY; if (gameState === 'START_SCREEN') { handleStartScreenInput(p, pressX, pressY); } else if (gameState === 'PLAYING') { if (!handlePlayingScreenButtons(p, pressX, pressY)) { startDragging(p, pressX, pressY, false, null); } } else if (gameState === 'GAME_OVER') { handleGameOverInput(p, pressX, pressY); } }
function handleMouseDragged(p) { if (dragging.active && !dragging.isTouch) { dragging.currentX = p.mouseX; dragging.currentY = p.mouseY; } return false; }
function handleMouseReleased(p) { if (dragging.active && !dragging.isTouch) { finishDragging(p, p.mouseX, p.mouseY); } }

// --- TOUCH Handlers --- (Added logging and failsafe reset)
function handleTouchStarted(p) { if (dragging.active) return false; if (p.touches.length > 0) { let touch = p.touches[0]; let pressX = touch.x; let pressY = touch.y; if (gameState === 'START_SCREEN') { handleStartScreenInput(p, pressX, pressY); } else if (gameState === 'PLAYING') { if (!handlePlayingScreenButtons(p, pressX, pressY)) { startDragging(p, pressX, pressY, true, touch.id); } } else if (gameState === 'GAME_OVER') { handleGameOverInput(p, pressX, pressY); } } return false; }
function handleTouchMoved(p) { if (dragging.active && dragging.isTouch) { let currentTouch = null; for (let touch of p.touches) { if (touch.id === dragging.pointerId) { currentTouch = touch; break; } } if (currentTouch) { dragging.currentX = currentTouch.x; dragging.currentY = currentTouch.y; } } return false; }
function handleTouchEnded(p) {
    if (dragging.active && dragging.isTouch) {
        console.log(`Touch ended. Tracked Pointer ID: ${dragging.pointerId}`);
        // Log IDs of touches that actually ended
        const endedTouchIDs = p.changedTouches.map(t => t.id);
        console.log("Ended Touch IDs in changedTouches:", endedTouchIDs);

        let endedTouchFound = false;
        for (let touch of p.changedTouches) {
            if (touch.id === dragging.pointerId) {
                console.log(`Matched ended touch ID: ${touch.id}. Finishing drag.`);
                finishDragging(p, touch.x, touch.y); // Use final position
                endedTouchFound = true;
                 // finishDragging now calls resetDraggingState, so we don't need it here
                break;
            }
        }
         // *** Failsafe Reset ***
         // If the loop completes and we haven't found the specific touch ID,
         // OR if changedTouches is empty (which can sometimes happen),
         // but we were definitely dragging with touch, reset the state anyway.
         if (!endedTouchFound) {
            // Check if there are NO touches left OR if the specific pointer is gone
            let pointerStillActive = false;
            for(let touch of p.touches) { // Check remaining active touches
                if (touch.id === dragging.pointerId) {
                    pointerStillActive = true;
                    break;
                }
            }

            if (!pointerStillActive) {
                 console.warn(`Tracked touch ${dragging.pointerId} ended but wasn't found in changedTouches or is no longer active. Forcing drag reset.`);
                 resetDraggingState();
            } else {
                 console.log(`Touch ended event occurred, but tracked pointer ${dragging.pointerId} seems still active. Not resetting drag yet.`);
                 // This scenario might indicate a multi-touch situation where only one finger lifted.
                 // For this simple game, we might still want to reset if ANY finger lifts while dragging.
                 // Let's be more aggressive: Reset if the ended touch list isn't empty, even if ID didn't match.
                 if (endedTouchIDs.length > 0) {
                      console.warn(`An ended touch occurred, but not the tracked one (${dragging.pointerId}). Resetting drag anyway for simplicity.`);
                      resetDraggingState();
                 }
            }
        }
    } else {
         // If touch ends but we weren't tracking a touch drag, log for info.
         // console.log("Touch ended but no active touch drag was tracked.");
    }
    return false; // Prevent default actions like simulated clicks
}

// --- Input Helper Functions --- (handleStartScreenInput, handlePlayingScreenButtons, handleGameOverInput remain same)
function handleStartScreenInput(p, pressX, pressY) { uiElements.langToggles.forEach(toggle => { if (isPointInRect(pressX, pressY, toggle.x, toggle.y, toggle.w, toggle.h)) { const langIndex = selectedLanguages.indexOf(toggle.lang); if (langIndex > -1) { if (selectedLanguages.length > 1) selectedLanguages.splice(langIndex, 1); else alert("Need >= 1 language!"); } else { selectedLanguages.push(toggle.lang); } } }); uiElements.difficultyButtons.forEach(button => { if (isPointInRect(pressX, pressY, button.x, button.y, button.w, button.h)) { selectedDifficulty = button.difficulty; } }); const startBtn = uiElements.startButton; if (startBtn && isPointInRect(pressX, pressY, startBtn.x, startBtn.y, startBtn.w, startBtn.h)) { if (selectedLanguages.length > 0) startGame(p); else alert("Select >= 1 language!"); } }
function handlePlayingScreenButtons(p, pressX, pressY) { const resetBtn = uiElements.resetButton; if (resetBtn && isPointInRect(pressX, pressY, resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h)) { console.log("Reset clicked!"); gameState = 'GAME_OVER'; resetDraggingState(); return true; } return false; }
function handleGameOverInput(p, pressX, pressY) { const playAgainBtn = uiElements.playAgainButton; if (playAgainBtn && isPointInRect(pressX, pressY, playAgainBtn.x, playAgainBtn.y, playAgainBtn.w, playAgainBtn.h)) { gameState = 'START_SCREEN'; } }

// --- Dragging Logic Helper Functions --- (Added logging to startDragging, finishDragging calls reset)
function startDragging(p, pressX, pressY, isTouchInput, pointerIdInput) {
     const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE);
     for (let i = 0; i < wordStates.length; i++) { if (!wordStates[i] || !wordStates[i].letterBoxes) continue; for (let j = 0; j < wordStates[i].letterBoxes.length; j++) { const box = wordStates[i].letterBoxes[j]; if (isPointInRect(pressX, pressY, box.x, box.y, letterSize, letterSize)) {
         dragging.active = true; dragging.isTouch = isTouchInput; dragging.pointerId = pointerIdInput; dragging.langIndex = i; dragging.letterIndex = j; dragging.offsetX = pressX - box.x; dragging.offsetY = pressY - box.y; dragging.currentX = pressX; dragging.currentY = pressY; keyboardState.selectedLetters = [];
         console.log(`Drag started: ${isTouchInput ? 'Touch' : 'Mouse'}, lang ${i}, letter ${j}. Storing pointerId: ${pointerIdInput}`); // Log stored ID
         return;
     } } }
 }
function finishDragging(p, releaseX, releaseY) {
     if (!dragging.active) {
          console.log("finishDragging called but not active.");
          return; // Should not happen if logic is correct, but safe check
     }
     console.log(`Finishing drag at (${releaseX.toFixed(0)}, ${releaseY.toFixed(0)})`);
     let droppedOnTarget = false; const dragLangIndex = dragging.langIndex; const dragLetterIndex = dragging.letterIndex;
     const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE);
     if (dragLangIndex >= 0 && dragLangIndex < wordStates.length) { const state = wordStates[dragLangIndex]; if (state && state.letterBoxes) { for (let j = 0; j < state.letterBoxes.length; j++) { if (j === dragLetterIndex) continue; const box = state.letterBoxes[j]; const dropCheckX = dragging.currentX; const dropCheckY = dragging.currentY; const dropCenterX = dropCheckX - dragging.offsetX + letterSize / 2; const dropCenterY = dropCheckY - dragging.offsetY + letterSize / 2; if (isPointInRect(dropCenterX, dropCenterY, box.x, box.y, letterSize, letterSize)) { console.log(`Dropped on target: lang ${dragLangIndex}, letter ${j}`); swapLetters(dragLangIndex, dragLetterIndex, j); droppedOnTarget = true; checkWinCondition(p); break; } } } }
     // *** Always reset state after finishing attempt ***
     resetDraggingState();
 }
function resetDraggingState() {
    if (dragging.active) { // Log only if it was previously active
         console.log("Resetting dragging state.");
    }
    dragging.active = false; dragging.isTouch = false; dragging.pointerId = null; dragging.letterIndex = -1; dragging.langIndex = -1;
}

// --- Keyboard Handler --- (Updated: Immediate swap, no ENTER)
function handleKeyPressed(p, event) {
     if (gameState !== 'PLAYING') return; if (wordStates.length === 0) return;
     let rowChanged = false; let colChanged = false;
     const currentRowState = wordStates[keyboardState.selectedRow];
     if (!currentRowState || !currentRowState.currentLetters) { console.warn("Key press on invalid row state."); return; }
     const currentRowLength = currentRowState.currentLetters.length;

    // Arrow Keys
     if (p.keyCode === p.UP_ARROW) { event.preventDefault(); if (keyboardState.selectedRow > 0) { keyboardState.selectedRow--; rowChanged = true; } }
     else if (p.keyCode === p.DOWN_ARROW) { event.preventDefault(); if (keyboardState.selectedRow < wordStates.length - 1) { keyboardState.selectedRow++; rowChanged = true; } }
     else if (p.keyCode === p.LEFT_ARROW) { event.preventDefault(); if (currentRowLength > 0) { if (keyboardState.selectedCol > 0) { keyboardState.selectedCol--; } else { keyboardState.selectedCol = currentRowLength - 1; } colChanged = true; } }
     else if (p.keyCode === p.RIGHT_ARROW) { event.preventDefault(); if (currentRowLength > 0) { if (keyboardState.selectedCol < currentRowLength - 1) { keyboardState.selectedCol++; } else { keyboardState.selectedCol = 0; } colChanged = true; } }
    // SPACE Key
     else if (p.keyCode === 32) {
         event.preventDefault();
         if (keyboardState.selectedCol >= 0 && keyboardState.selectedCol < currentRowLength) {
             const currentSelection = { langIndex: keyboardState.selectedRow, letterIndex: keyboardState.selectedCol };
             const existingIndex = keyboardState.selectedLetters.findIndex( sel => sel.langIndex === currentSelection.langIndex && sel.letterIndex === currentSelection.letterIndex );
             if (existingIndex !== -1) {
                 console.log(`Deselecting: ${JSON.stringify(currentSelection)}`);
                 keyboardState.selectedLetters.splice(existingIndex, 1);
             } else {
                 console.log(`Selecting: ${JSON.stringify(currentSelection)}`);
                 keyboardState.selectedLetters.push(currentSelection);
                 if (keyboardState.selectedLetters.length === 2) {
                     const sel1 = keyboardState.selectedLetters[0]; const sel2 = keyboardState.selectedLetters[1];
                     if (sel1.langIndex === sel2.langIndex) {
                         if (sel1.letterIndex !== sel2.letterIndex) {
                             console.log(`Immediate swap: [${sel1.langIndex}, ${sel1.letterIndex}] <-> [${sel2.langIndex}, ${sel2.letterIndex}]`);
                             swapLetters(sel1.langIndex, sel1.letterIndex, sel2.letterIndex);
                             checkWinCondition(p);
                         } else { console.log("Cannot swap same letter."); }
                     } else { console.log("Cannot swap different rows."); }
                     keyboardState.selectedLetters = []; // Clear after attempt
                 } else if (keyboardState.selectedLetters.length > 1) { // Should only be 1 now after clearing, but safety
                      keyboardState.selectedLetters.shift();
                 }
             }
              console.log("Selected after op:", JSON.stringify(keyboardState.selectedLetters));
         } else { console.log("Invalid column for SPACE."); }
     }
     // Row/Col change cleanup
     if (rowChanged || colChanged) { const newRowState = wordStates[keyboardState.selectedRow]; if (newRowState && newRowState.currentLetters) { const newRowLength = newRowState.currentLetters.length; if (keyboardState.selectedCol >= newRowLength) keyboardState.selectedCol = Math.max(0, newRowLength - 1); } else { keyboardState.selectedCol = 0; } if (rowChanged) { keyboardState.selectedLetters = []; } }
}

// --- main.js (sketch.js) ---

let p5Instance;

const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(window.innerWidth * 0.98, window.innerHeight * 0.98);
        p.textFont('Arial'); p.textAlign(p.CENTER, p.CENTER); p.frameRate(30);
        console.log(`Game Setup Complete! v${GAME_VERSION}`);
    };
    p.windowResized = () => { p.resizeCanvas(window.innerWidth * 0.98, window.innerHeight * 0.98); console.log("Window resized"); };
    p.draw = () => { switch (gameState) { case 'START_SCREEN': drawStartScreen(p); break; case 'PLAYING': drawPlayingScreen(p); break; case 'GAME_OVER': drawGameOverScreen(p); break; } };
    // Assign input handlers
    p.mousePressed = () => handleMousePressed(p); p.mouseDragged = () => handleMouseDragged(p); p.mouseReleased = () => handleMouseReleased(p);
    p.touchStarted = () => handleTouchStarted(p); p.touchMoved = () => handleTouchMoved(p); p.touchEnded = () => handleTouchEnded(p);
    p.keyPressed = (event) => handleKeyPressed(p, event);
};

p5Instance = new p5(sketch);
