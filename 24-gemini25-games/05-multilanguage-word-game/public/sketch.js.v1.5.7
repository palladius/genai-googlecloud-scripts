// @ts-check
// Welcome to the Multilingual Anagram Fun Zone! 🥳 v1.5.5
// Changes: Added visible word load status. Refined preload logic for robustness.

// --- lib/config.js ---
const GAME_VERSION = "1.57"; // Updated version number
// (Rest of config, colors, utils, placeholder, game_state remain the same)
const MAX_WORDS_PER_GAME = 5; const SCORE_THRESHOLDS = { fast: 30, medium: 60, slow: 120 }; const SCORE_POINTS = { fast: 100, medium: 50, slow: 25, slowest: 10 }; const DEFAULT_LETTER_SIZE = 40; const DEFAULT_LETTER_SPACING = 10; const DEFAULT_FLAG_SIZE = 30; const HEADER_HEIGHT_PERCENT = 0.15; const GAME_AREA_HEIGHT_PERCENT = 1.0 - HEADER_HEIGHT_PERCENT; const BACKGROUND_COLOR = '#f0f8ff'; const FONT_SIZE_UI = 18; const FONT_SIZE_EMOJI = 50; const FONT_SIZE_LETTER = 30;
const COLORS = { text: '#333333', loadStatusText: '#555555', loadErrorText: '#ff0000', letterBg: '#ffffff', letterBgSelected: '#ffff99', letterBgSelectedKeyboard: '#add8e6', letterBgTouchSelectedSource: '#d3d3d3', letterBgTouchTarget: '#ffb6c1', letterBorder: '#cccccc', correctHighlight: '#90ee90', buttonBg: '#87cefa', buttonText: '#ffffff', buttonHover: '#4682b4', toggleOn: '#90ee90', toggleOff: '#d3d3d3', resetButtonBg: '#ff6347', resetButtonHover: '#dc143c', };
function applyTextStyle(p, { color = COLORS.text, size = FONT_SIZE_UI, align = p.LEFT, vAlign = p.CENTER } = {}) { p.fill(color); p.textSize(size); p.textAlign(align, vAlign); p.noStroke(); }
function shuffleArray(array) { let currentIndex = array.length, randomIndex; while (currentIndex !== 0) { randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--; [array[currentIndex], array[randomIndex]] = [ array[randomIndex], array[currentIndex] ]; } return array; }
function scrambleWord(word) { if (!word) return ''; let letters = word.split(''); let maxAttempts = 10; let attempts = 0; let shuffledWord = word; if (letters.length > 1) { let originalLetters = [...letters]; letters = shuffleArray(letters); shuffledWord = letters.join(''); if (shuffledWord === word && letters.length > 2) { attempts = 0; do { letters = shuffleArray(letters); shuffledWord = letters.join(''); attempts++; } while (shuffledWord === word && attempts < maxAttempts); } if (letters.length === 2 && letters[0] === letters[1] && word.length === 2) { shuffledWord = letters.join(''); } } return shuffledWord; }
function isPointInRect(px, py, rx, ry, rw, rh) { return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh; }
function getFlagEmoji(langCode) { const flags = { it: '🇮🇹', en: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', de: '🇩🇪', fr: '🇫🇷' }; return flags[langCode] || '🏳️'; }
let gameState = 'START_SCREEN'; let currentWordData = null; let wordStates = []; let score = 0; let wordsPlayed = 0; let startTime = 0; let correctFlashTime = 0; let currentWordPool = [];
let selectedDifficulty = 'easy'; let availableLanguages = ['it', 'en', 'de', 'fr']; let selectedLanguages = ['it', 'en', 'de'];
let dragging = { active: false, letterIndex: -1, langIndex: -1, offsetX: 0, offsetY: 0, currentX: 0, currentY: 0 };
let keyboardState = { selectedRow: 0, selectedCol: 0, selectedLetters: [] };
let touchSelectionState = { active: false, langIndex: -1, letterIndex: -1 };
let uiElements = { langToggles: [], difficultyButtons: [], startButton: null, playAgainButton: null, resetButton: null };

// --- Global variable for word loading status ---
let wordLoadStatus = "Loading words from GitHub..."; // Default message
const githubURL = 'https://raw.githubusercontent.com/palladius/genai-googlecloud-scripts/refs/heads/main/24-gemini25-games/05-multilanguage-word-game/public/words.json';


// --- lib/drawing.js ---
function drawStartScreen(p) {
    p.background(BACKGROUND_COLOR);
    // Title
    applyTextStyle(p, { size: p.constrain(p.width / 20, 24, 40), align: p.CENTER });
    p.text(`Word Scramble Fun v${GAME_VERSION} 🤪`, p.width / 2, p.height * 0.1);

    // *** Draw Word Load Status ***
    let statusColor = COLORS.loadStatusText;
    if (wordLoadStatus.toLowerCase().includes("error") || wordLoadStatus.toLowerCase().includes("fail")) {
        statusColor = COLORS.loadErrorText;
    }
    applyTextStyle(p, { size: 14, color: statusColor, align: p.CENTER });
    p.text(wordLoadStatus, p.width / 2, p.height * 0.1 + 40); // Position below title

    // (Rest of start screen drawing logic remains the same)
    applyTextStyle(p, { size: FONT_SIZE_UI, align: p.LEFT }); let startOptionsX = p.constrain(p.width * 0.1, 30, 100); p.text('Choose Languages:', startOptionsX, p.height * 0.25); uiElements.langToggles = []; let toggleX = startOptionsX; const toggleY = p.height * 0.25 + 30; const toggleW = p.constrain(p.width / 6, 70, 90); const toggleH = 30; const toggleSpacing = 15; availableLanguages.forEach((lang, index) => { const flag = getFlagEmoji(lang); const isSelected = selectedLanguages.includes(lang); const x = toggleX + index * (toggleW + toggleSpacing); if (x + toggleW < p.width * 0.95) { uiElements.langToggles.push({ x, y: toggleY, w: toggleW, h: toggleH, lang }); p.stroke(COLORS.letterBorder); p.fill(isSelected ? COLORS.toggleOn : COLORS.toggleOff); p.rect(x, toggleY, toggleW, toggleH, 5); applyTextStyle(p, { size: FONT_SIZE_UI - 2, color: isSelected ? COLORS.text : '#888', align: p.CENTER, vAlign: p.CENTER }); p.text(`${flag} ${lang.toUpperCase()}`, x + toggleW / 2, toggleY + toggleH / 2); } }); applyTextStyle(p, { size: FONT_SIZE_UI, align: p.LEFT }); p.text('Choose Difficulty:', startOptionsX, p.height * 0.45); uiElements.difficultyButtons = []; let diffButtonX = startOptionsX; const diffButtonY = p.height * 0.45 + 30; const diffButtonW = p.constrain(p.width / 5, 80, 110); const diffButtonH = 40; const diffSpacing = 15; ['easy', 'medium', 'hard'].forEach((diff, index) => { const isSelected = selectedDifficulty === diff; const x = diffButtonX + index * (diffButtonW + diffSpacing); if (x + diffButtonW < p.width * 0.95) { uiElements.difficultyButtons.push({ x, y: diffButtonY, w: diffButtonW, h: diffButtonH, difficulty: diff }); p.stroke(COLORS.letterBorder); p.fill(isSelected ? COLORS.buttonHover : COLORS.buttonBg); p.rect(x, diffButtonY, diffButtonW, diffButtonH, 5); applyTextStyle(p, { size: FONT_SIZE_UI, color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text(diff.charAt(0).toUpperCase() + diff.slice(1), x + diffButtonW / 2, diffButtonY + diffButtonH / 2); } }); const startBtnW = p.constrain(p.width * 0.4, 120, 200); const startBtnH = p.constrain(p.height * 0.08, 40, 60); const startBtnX = p.width / 2 - startBtnW / 2; const startBtnY = p.height * 0.85 - startBtnH / 2; uiElements.startButton = { x: startBtnX, y: startBtnY, w: startBtnW, h: startBtnH }; let hoverX = p.mouseX; let hoverY = p.mouseY; p.fill(COLORS.buttonBg); if (isPointInRect(hoverX, hoverY, startBtnX, startBtnY, startBtnW, startBtnH)) { p.fill(COLORS.buttonHover); } p.rect(startBtnX, startBtnY, startBtnW, startBtnH, 10); applyTextStyle(p, { size: p.constrain(startBtnH * 0.4, 16, 24), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Start Game!', startBtnX + startBtnW / 2, startBtnY + startBtnH / 2);
}
// (drawPlayingScreen, drawGameOverScreen remain the same)
function drawPlayingScreen(p) { if (correctFlashTime > 0 && p.millis() < correctFlashTime + 500) { p.background(COLORS.correctHighlight); if (p.millis() > correctFlashTime + 490) correctFlashTime = 0; } else { p.background(BACKGROUND_COLOR); } const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE); const letterSpacing = p.constrain(letterSize * 0.25, 5, DEFAULT_LETTER_SPACING); const flagSize = p.constrain(letterSize * 0.8, 20, DEFAULT_FLAG_SIZE); const letterFontSize = p.constrain(letterSize * 0.7, 15, FONT_SIZE_LETTER); const uiFontSize = p.constrain(headerHeight * 0.15, 14, FONT_SIZE_UI); const emojiFontSize = p.constrain(headerHeight * 0.4, 30, FONT_SIZE_EMOJI); const topMargin = 15; const scoreY = topMargin + uiFontSize / 2; const timerY = scoreY; const wordCountY = scoreY; const emojiY = headerHeight * 0.6; const firstRowCenterY = headerHeight + availableHeightPerRow / 2; const rowSpacing = availableHeightPerRow; applyTextStyle(p, { size: uiFontSize, align: p.LEFT, vAlign: p.TOP }); p.text(`Score: ${score} ❤️`, 20, topMargin); applyTextStyle(p, { size: uiFontSize, align: p.RIGHT, vAlign: p.TOP }); p.text(`Word: ${wordsPlayed + 1} / ${MAX_WORDS_PER_GAME}`, p.width - 20, topMargin); let elapsedTime = (p.millis() - startTime) / 1000; applyTextStyle(p, { size: uiFontSize, align: p.CENTER, vAlign: p.TOP }); p.text(`Time: ${elapsedTime.toFixed(1)}s`, p.width / 2, topMargin); if (currentWordData) { applyTextStyle(p, { size: emojiFontSize, align: p.CENTER }); p.text(currentWordData.emoji, p.width / 2, emojiY); } const resetBtnW = p.constrain(p.width * 0.2, 80, 110); const resetBtnH = p.constrain(headerHeight * 0.3, 30, 40); const resetBtnX = p.width - resetBtnW - 15; const resetBtnY = headerHeight * 0.15; uiElements.resetButton = { x: resetBtnX, y: resetBtnY, w: resetBtnW, h: resetBtnH }; let hoverX = p.mouseX; let hoverY = p.mouseY; p.fill(COLORS.resetButtonBg); if (isPointInRect(hoverX, hoverY, resetBtnX, resetBtnY, resetBtnW, resetBtnH)) { p.fill(COLORS.resetButtonHover); } p.stroke(COLORS.letterBorder); p.rect(resetBtnX, resetBtnY, resetBtnW, resetBtnH, 5); applyTextStyle(p, { size: p.constrain(resetBtnH * 0.4, 12, uiFontSize), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Reset Game', resetBtnX + resetBtnW / 2, resetBtnY + resetBtnH / 2); wordStates.forEach((langState, langIndex) => { const numLetters = langState.currentLetters.length; const totalWordWidth = numLetters * letterSize + Math.max(0, numLetters - 1) * letterSpacing; const totalRowWidth = flagSize + 15 + totalWordWidth; const rowStartY = firstRowCenterY + langIndex * rowSpacing - letterSize / 2; let rowStartX = (p.width - totalRowWidth) / 2; rowStartX = Math.max(rowStartX, 10); const flagX = rowStartX; const flagY = rowStartY + letterSize / 2; applyTextStyle(p, { size: flagSize, align: p.CENTER, vAlign: p.CENTER }); p.text(getFlagEmoji(langState.lang), flagX + flagSize / 2, flagY); let currentLetterX = flagX + flagSize + 15; langState.letterBoxes = []; langState.currentLetters.forEach((letter, letterIndex) => { langState.letterBoxes.push({ x: currentLetterX, y: rowStartY, w: letterSize, h: letterSize }); let bgColor = COLORS.letterBg; const isTouchSelectedSource = touchSelectionState.active && touchSelectionState.langIndex === langIndex && touchSelectionState.letterIndex === letterIndex; const isTouchTarget = touchSelectionState.active && touchSelectionState.langIndex === langIndex && touchSelectionState.letterIndex !== letterIndex; const isKeyboardSelectedPair = keyboardState.selectedLetters.some(sel => sel.langIndex === langIndex && sel.letterIndex === letterIndex); const isKeyboardCursor = keyboardState.selectedRow === langIndex && keyboardState.selectedCol === letterIndex; if (isTouchSelectedSource) { bgColor = COLORS.letterBgTouchSelectedSource; } else if (isTouchTarget) { bgColor = COLORS.letterBgTouchTarget; } else if (isKeyboardSelectedPair) { bgColor = COLORS.letterBgSelected; } else if (isKeyboardCursor) { bgColor = COLORS.letterBgSelectedKeyboard; } p.stroke(COLORS.letterBorder); p.fill(bgColor); p.rect(currentLetterX, rowStartY, letterSize, letterSize, 5); applyTextStyle(p, { size: letterFontSize, align: p.CENTER, vAlign: p.CENTER }); p.text(letter.toUpperCase(), currentLetterX + letterSize / 2, rowStartY + letterSize / 2); currentLetterX += letterSize + letterSpacing; }); }); if (dragging.active && !touchSelectionState.active) { const { letterIndex, langIndex, offsetX, offsetY } = dragging; const dragX = dragging.currentX - offsetX; const dragY = dragging.currentY - offsetY; const letter = wordStates[langIndex]?.currentLetters[letterIndex]; if (letter) { p.stroke(COLORS.letterBorder); p.fill(COLORS.letterBgSelected); p.rect(dragX, dragY, letterSize, letterSize, 5); applyTextStyle(p, { size: letterFontSize, align: p.CENTER, vAlign: p.CENTER }); p.text(letter.toUpperCase(), dragX + letterSize / 2, dragY + letterSize / 2); } } }
function drawGameOverScreen(p) { p.background(BACKGROUND_COLOR); applyTextStyle(p, { size: p.constrain(p.width / 15, 30, 60), align: p.CENTER, color: '#dc143c' }); p.text('Game Over! 🎉', p.width / 2, p.height * 0.3); applyTextStyle(p, { size: p.constrain(p.width / 20, 24, 40), align: p.CENTER }); p.text(`Final Score: ${score} ❤️`, p.width / 2, p.height * 0.5); const btnW = p.constrain(p.width * 0.5, 150, 250); const btnH = p.constrain(p.height * 0.1, 45, 70); const btnX = p.width / 2 - btnW / 2; const btnY = p.height * 0.7 - btnH / 2; uiElements.playAgainButton = { x: btnX, y: btnY, w: btnW, h: btnH }; let hoverX = p.mouseX; let hoverY = p.mouseY; p.fill(COLORS.buttonBg); if (isPointInRect(hoverX, hoverY, btnX, btnY, btnW, btnH)) { p.fill(COLORS.buttonHover); } p.rect(btnX, btnY, btnW, btnH, 10); applyTextStyle(p, { size: p.constrain(btnH * 0.4, 18, 28), color: COLORS.buttonText, align: p.CENTER, vAlign: p.CENTER }); p.text('Play Again?', btnX + btnW / 2, btnY + btnH / 2); }

// --- lib/game_logic.js ---
// (startGame check simplified, nextWord, checkWinCondition, swapLetters remain the same)
function startGame(p) {
    // Rely on the check in setup, but keep a basic check here
    if (!Array.isArray(words) || words.length === 0) {
        console.error("startGame called but words array is invalid!");
        alert(`Error: ${wordLoadStatus}`); // Show status from loading phase
        return; // Don't proceed
    }
    const difficultiesToInclude = [];
    if (selectedDifficulty === 'easy') difficultiesToInclude.push('easy');
    else if (selectedDifficulty === 'medium') difficultiesToInclude.push('easy', 'medium');
    else difficultiesToInclude.push('easy', 'medium', 'hard');
    let baseWordPool = words.filter(word => difficultiesToInclude.includes(word.difficulty));
    if (baseWordPool.length === 0) {
         // This check is important if the JSON is valid but contains no words for the difficulty
         alert("Whoops! No words found for that difficulty in the loaded list.");
         gameState = 'START_SCREEN'; // Go back to allow changing difficulty
         return;
     }
    currentWordPool = shuffleArray([...baseWordPool]);
    score = 0; wordsPlayed = -1; gameState = 'PLAYING';
    resetTouchSelectionState(); clearKeyboardSelection();
    nextWord(p);
}
function nextWord(p) { wordsPlayed++; if (wordsPlayed >= MAX_WORDS_PER_GAME) { gameState = 'GAME_OVER'; return; } if (currentWordPool.length === 0) { alert("Wow, you played all the words! 🎉 Game Over!"); gameState = 'GAME_OVER'; return; } currentWordData = currentWordPool.pop(); wordStates = []; selectedLanguages.forEach(lang => { const correctWord = currentWordData[lang]; if (correctWord) { const scrambled = scrambleWord(correctWord); wordStates.push({ lang, correctWord, currentLetters: scrambled.split(''), letterBoxes: [], isCorrect: false }); } else { console.warn(`Missing word data: ${lang}, ${currentWordData.emoji}`); } }); keyboardState.selectedRow = 0; keyboardState.selectedCol = 0; if (wordStates.length > 0 && wordStates[0].currentLetters.length > 0) { keyboardState.selectedCol = Math.min(keyboardState.selectedCol, wordStates[0].currentLetters.length - 1); } else { keyboardState.selectedCol = 0; } keyboardState.selectedLetters = []; startTime = p.millis(); correctFlashTime = 0; console.log(`Word ${wordsPlayed + 1}: ${currentWordData.emoji} (${currentWordData.en})`); }
function checkWinCondition(p) { if (wordStates.length === 0) return; let allCorrect = true; wordStates.forEach(state => { const currentWord = state.currentLetters.join(''); state.isCorrect = (currentWord.toLowerCase() === state.correctWord.toLowerCase()); if (!state.isCorrect) allCorrect = false; }); if (allCorrect) { console.log("Word Correct!"); correctFlashTime = p.millis(); let elapsedTime = (p.millis() - startTime) / 1000; let points = 0; if (elapsedTime <= SCORE_THRESHOLDS.fast) points = SCORE_POINTS.fast; else if (elapsedTime <= SCORE_THRESHOLDS.medium) points = SCORE_POINTS.medium; else if (elapsedTime <= SCORE_THRESHOLDS.slow) points = SCORE_POINTS.slow; else points = SCORE_POINTS.slowest; score += points; setTimeout(() => { if (gameState === 'PLAYING') { nextWord(p); keyboardState.selectedRow = 0; keyboardState.selectedCol = 0; clearKeyboardSelection(); resetTouchSelectionState(); } }, 600); } }
function swapLetters(langIndex, index1, index2) { if (langIndex < 0 || langIndex >= wordStates.length) return; const state = wordStates[langIndex]; if (!state || !state.currentLetters) return; if (index1 < 0 || index1 >= state.currentLetters.length || index2 < 0 || index2 >= state.currentLetters.length) return; console.log(`Swapping lang ${langIndex}: idx ${index1} & ${index2}`); [state.currentLetters[index1], state.currentLetters[index2]] = [state.currentLetters[index2], state.currentLetters[index1]]; }


// --- lib/input_handler.js ---
// (Input handlers and helpers remain the same)
function handleMousePressed(p) { if (touchSelectionState.active) return; if (dragging.active) return; let pressX = p.mouseX; let pressY = p.mouseY; if (gameState === 'START_SCREEN') { handleStartScreenInput(p, pressX, pressY); } else if (gameState === 'PLAYING') { if (!handlePlayingScreenButtons(p, pressX, pressY)) { startDragging(p, pressX, pressY); } } else if (gameState === 'GAME_OVER') { handleGameOverInput(p, pressX, pressY); } }
function handleMouseDragged(p) { if (dragging.active) { dragging.currentX = p.mouseX; dragging.currentY = p.mouseY; } return false; }
function handleMouseReleased(p) { if (dragging.active) { finishDragging(p, p.mouseX, p.mouseY); } }
function handleTouchStarted(p) { if (dragging.active) return false; if (p.touches.length > 1 && !touchSelectionState.active) { return false; } let pressX = p.mouseX; let pressY = p.mouseY; if (gameState === 'START_SCREEN') { handleStartScreenInput(p, pressX, pressY); } else if (gameState === 'PLAYING') { if (handlePlayingScreenButtons(p, pressX, pressY)) { resetTouchSelectionState(); return false; } const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE); let targetHit = null; for (let i = 0; i < wordStates.length; i++) { if (!wordStates[i] || !wordStates[i].letterBoxes) continue; for (let j = 0; j < wordStates[i].letterBoxes.length; j++) { const box = wordStates[i].letterBoxes[j]; if (isPointInRect(pressX, pressY, box.x, box.y, letterSize, letterSize)) { targetHit = { langIndex: i, letterIndex: j }; break; } } if (targetHit) break; } if (!touchSelectionState.active) { if (targetHit) { touchSelectionState.active = true; touchSelectionState.langIndex = targetHit.langIndex; touchSelectionState.letterIndex = targetHit.letterIndex; console.log(`Touch SOURCE: [${targetHit.langIndex}, ${targetHit.letterIndex}]`); clearKeyboardSelection(); } } else { if (targetHit && targetHit.langIndex === touchSelectionState.langIndex && targetHit.letterIndex !== touchSelectionState.letterIndex) { console.log(`Touch TARGET: [${targetHit.langIndex}, ${targetHit.letterIndex}]. Swapping.`); swapLetters(touchSelectionState.langIndex, touchSelectionState.letterIndex, targetHit.letterIndex); checkWinCondition(p); resetTouchSelectionState(); } else { if (targetHit) { console.log(`Touch invalid target [${targetHit.langIndex}, ${targetHit.letterIndex}]. Cancel.`); } else { console.log("Touch miss target. Cancel."); } resetTouchSelectionState(); } } } else if (gameState === 'GAME_OVER') { handleGameOverInput(p, pressX, pressY); } return false; }
function handleStartScreenInput(p, pressX, pressY) { uiElements.langToggles.forEach(toggle => { if (isPointInRect(pressX, pressY, toggle.x, toggle.y, toggle.w, toggle.h)) { const langIndex = selectedLanguages.indexOf(toggle.lang); if (langIndex > -1) { if (selectedLanguages.length > 1) selectedLanguages.splice(langIndex, 1); else alert("Need >= 1 language!"); } else { selectedLanguages.push(toggle.lang); } } }); uiElements.difficultyButtons.forEach(button => { if (isPointInRect(pressX, pressY, button.x, button.y, button.w, button.h)) { selectedDifficulty = button.difficulty; } }); const startBtn = uiElements.startButton; if (startBtn && isPointInRect(pressX, pressY, startBtn.x, startBtn.y, startBtn.w, startBtn.h)) { if (selectedLanguages.length > 0) startGame(p); else alert("Select >= 1 language!"); } }
function handlePlayingScreenButtons(p, pressX, pressY) { const resetBtn = uiElements.resetButton; if (resetBtn && isPointInRect(pressX, pressY, resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h)) { console.log("Reset clicked!"); gameState = 'GAME_OVER'; resetDraggingState(); resetTouchSelectionState(); return true; } return false; }
function handleGameOverInput(p, pressX, pressY) { const playAgainBtn = uiElements.playAgainButton; if (playAgainBtn && isPointInRect(pressX, pressY, playAgainBtn.x, playAgainBtn.y, playAgainBtn.w, playAgainBtn.h)) { gameState = 'START_SCREEN'; } }
function startDragging(p, pressX, pressY) { const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE); for (let i = 0; i < wordStates.length; i++) { if (!wordStates[i] || !wordStates[i].letterBoxes) continue; for (let j = 0; j < wordStates[i].letterBoxes.length; j++) { const box = wordStates[i].letterBoxes[j]; if (isPointInRect(pressX, pressY, box.x, box.y, letterSize, letterSize)) { dragging.active = true; dragging.langIndex = i; dragging.letterIndex = j; dragging.offsetX = pressX - box.x; dragging.offsetY = pressY - box.y; dragging.currentX = pressX; dragging.currentY = pressY; resetTouchSelectionState(); clearKeyboardSelection(); console.log(`Mouse Drag started: lang ${i}, letter ${j}.`); return; } } } }
function finishDragging(p, releaseX, releaseY) { if (!dragging.active) return; console.log(`Mouse Drag ended at (${releaseX.toFixed(0)}, ${releaseY.toFixed(0)})`); let droppedOnTarget = false; const dragLangIndex = dragging.langIndex; const dragLetterIndex = dragging.letterIndex; const headerHeight = p.height * HEADER_HEIGHT_PERCENT; const gameAreaHeight = p.height * GAME_AREA_HEIGHT_PERCENT; const numRows = wordStates.length > 0 ? wordStates.length : 1; const availableHeightPerRow = gameAreaHeight / numRows; const letterSize = p.constrain(availableHeightPerRow * 0.4, 25, DEFAULT_LETTER_SIZE); if (dragLangIndex >= 0 && dragLangIndex < wordStates.length) { const state = wordStates[dragLangIndex]; if (state && state.letterBoxes) { for (let j = 0; j < state.letterBoxes.length; j++) { if (j === dragLetterIndex) continue; const box = state.letterBoxes[j]; const dropCheckX = dragging.currentX; const dropCheckY = dragging.currentY; const dropCenterX = dropCheckX - dragging.offsetX + letterSize / 2; const dropCenterY = dropCheckY - dragging.offsetY + letterSize / 2; if (isPointInRect(dropCenterX, dropCenterY, box.x, box.y, letterSize, letterSize)) { console.log(`Dropped on target: lang ${dragLangIndex}, letter ${j}`); swapLetters(dragLangIndex, dragLetterIndex, j); droppedOnTarget = true; checkWinCondition(p); break; } } } } resetDraggingState(); }
function resetDraggingState() { if (dragging.active) console.log("Resetting mouse dragging state."); dragging.active = false; dragging.letterIndex = -1; dragging.langIndex = -1; }
function resetTouchSelectionState() { if (touchSelectionState.active) console.log("Resetting touch selection state."); touchSelectionState.active = false; touchSelectionState.langIndex = -1; touchSelectionState.letterIndex = -1; }
function clearKeyboardSelection() { if (keyboardState.selectedLetters.length > 0) console.log("Clearing keyboard selection."); keyboardState.selectedLetters = []; }
function handleKeyPressed(p, event) { if (gameState !== 'PLAYING') return; if (wordStates.length === 0) return; let rCh = false; let cCh = false; const crState = wordStates[keyboardState.selectedRow]; if (!crState || !crState.currentLetters) { console.warn("Key press invalid state."); return; } const crLen = crState.currentLetters.length; if (p.keyCode === p.UP_ARROW) { event.preventDefault(); if (keyboardState.selectedRow > 0) { keyboardState.selectedRow--; rCh = true; } } else if (p.keyCode === p.DOWN_ARROW) { event.preventDefault(); if (keyboardState.selectedRow < wordStates.length - 1) { keyboardState.selectedRow++; rCh = true; } } else if (p.keyCode === p.LEFT_ARROW) { event.preventDefault(); if (crLen > 0) { if (keyboardState.selectedCol > 0) { keyboardState.selectedCol--; } else { keyboardState.selectedCol = crLen - 1; } cCh = true; } } else if (p.keyCode === p.RIGHT_ARROW) { event.preventDefault(); if (crLen > 0) { if (keyboardState.selectedCol < crLen - 1) { keyboardState.selectedCol++; } else { keyboardState.selectedCol = 0; } cCh = true; } } else if (p.keyCode === 32) { event.preventDefault(); if (keyboardState.selectedCol >= 0 && keyboardState.selectedCol < crLen) { const curSel = { langIndex: keyboardState.selectedRow, letterIndex: keyboardState.selectedCol }; const exIdx = keyboardState.selectedLetters.findIndex(s => s.langIndex === curSel.langIndex && s.letterIndex === curSel.letterIndex); if (exIdx !== -1) { console.log(`Deselecting: ${JSON.stringify(curSel)}`); keyboardState.selectedLetters.splice(exIdx, 1); } else { console.log(`Selecting: ${JSON.stringify(curSel)}`); resetTouchSelectionState(); keyboardState.selectedLetters.push(curSel); if (keyboardState.selectedLetters.length === 2) { const s1 = keyboardState.selectedLetters[0]; const s2 = keyboardState.selectedLetters[1]; if (s1.langIndex === s2.langIndex) { if (s1.letterIndex !== s2.letterIndex) { console.log(`Immediate KB swap: [${s1.langIndex}, ${s1.letterIndex}] <-> [${s2.langIndex}, ${s2.letterIndex}]`); swapLetters(s1.langIndex, s1.letterIndex, s2.letterIndex); checkWinCondition(p); } else { console.log("KB Swap same letter"); } } else { console.log("KB Swap different rows"); } keyboardState.selectedLetters = []; } else if (keyboardState.selectedLetters.length > 1) { keyboardState.selectedLetters.shift(); } } console.log("KB Sel after op:", JSON.stringify(keyboardState.selectedLetters)); } } if (rCh || cCh) { const nrState = wordStates[keyboardState.selectedRow]; if (nrState && nrState.currentLetters) { const nrLen = nrState.currentLetters.length; if (keyboardState.selectedCol >= nrLen) keyboardState.selectedCol = Math.max(0, nrLen - 1); } else { keyboardState.selectedCol = 0; } if (rCh) { clearKeyboardSelection(); resetTouchSelectionState(); } } }


// --- main.js (sketch.js) ---

let words = []; // Global variable
let p5Instance;

const sketch = (p) => {

    p.preload = () => {
        // *** UPDATED PRELOAD LOGIC ***
        wordLoadStatus = "Loading words..."; // Reset status at start of preload
        try {
            p.loadJSON(githubURL, // 'words.json',
                // Success Callback
                (rawData) => {
                    console.log("loadJSON success callback fired. Data type:", typeof rawData);
                    let processedData = []; // Prepare for final array
                    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
                        console.log("Data is object, converting...");
                        try {
                            processedData = Object.values(rawData); // Convert
                        } catch (e) {
                            console.error("Error converting loaded object:", e);
                            wordLoadStatus = "Error: Processing failed!";
                        }
                    } else if (Array.isArray(rawData)) {
                        console.log("Data is already array.");
                        processedData = rawData; // Use directly
                    } else {
                        console.error("Loaded data is not object or array:", rawData);
                        wordLoadStatus = "Error: Invalid data format!";
                    }

                    // Assign FINAL array to global words and update status
                    words = processedData;
                    if (Array.isArray(words) && words.length > 0) {
                         wordLoadStatus = `Loaded ${words.length} words from github.`;
                         console.log(`Success: Global words assigned (Array, ${words.length})`);
                    } else {
                         // Update status if conversion failed or data was invalid
                         if (!wordLoadStatus.toLowerCase().includes("error")) { // Avoid overwriting specific errors
                              wordLoadStatus = "Error: No valid words found!";
                         }
                         console.error("Failed to populate global words array correctly.");
                         words = []; // Ensure it's an empty array on failure
                    }
                },
                // Error Callback
                (error) => {
                    console.error("loadJSON error callback fired:", error);
                    words = []; // Ensure empty array on load failure
                    wordLoadStatus = "Error: Loading failed!";
                }
            );
            console.log("p.loadJSON call initiated in preload.");
        } catch (err) {
            console.error("Exception during p.loadJSON call:", err);
            words = []; // Ensure empty array on exception
            wordLoadStatus = "Error: Critical load exception!";
        }
    }

    p.setup = () => {
        p.createCanvas(window.innerWidth * 0.98, window.innerHeight * 0.98);
        p.textFont('Arial'); p.textAlign(p.CENTER, p.CENTER); p.frameRate(30);
        console.log(`Game Setup Complete! v${GAME_VERSION}`);

        // Setup check: Verify words array IS an array and has items.
        // This relies on the preload callbacks having correctly populated 'words'.
        if (Array.isArray(words) && words.length > 0) {
             console.log(`Setup check PASSED: ${words.length} words ready.`);
        } else {
             console.error(`Setup check FAILED: Global 'words' is not a populated array! Status: ${wordLoadStatus}`);
             // Display error (using status set during preload)
             p.background(255, 100, 100);
             applyTextStyle(p, { size: 20, color: '#fff', align: p.CENTER });
             p.text(`FATAL ERROR: ${wordLoadStatus}`, p.width / 2, p.height / 2);
             p.text("Cannot start game.", p.width / 2, p.height / 2 + 30);
             p.noLoop(); // Stop
             return;
        }
        // Rest of setup
    };

    // (windowResized, draw, input handler assignments remain the same)
    p.windowResized = () => { p.resizeCanvas(window.innerWidth * 0.98, window.innerHeight * 0.98); console.log("Window resized"); };
    p.draw = () => { switch (gameState) { case 'START_SCREEN': drawStartScreen(p); break; case 'PLAYING': drawPlayingScreen(p); break; case 'GAME_OVER': drawGameOverScreen(p); break; } };
    p.mousePressed = () => handleMousePressed(p); p.mouseDragged = () => handleMouseDragged(p); p.mouseReleased = () => handleMouseReleased(p);
    p.touchStarted = () => handleTouchStarted(p);
    p.keyPressed = (event) => handleKeyPressed(p, event);
};

p5Instance = new p5(sketch);
