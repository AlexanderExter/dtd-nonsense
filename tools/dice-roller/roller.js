/**
 * DTD Dice Roller - Standalone Tool
 * Uses shared dice.js module for core rolling logic
 */

// State
const state = {
    history: [],
    maxHistory: 50
};

// DOM Elements (cached after init)
let elements = {};

// ============================================================================
// Initialization
// ============================================================================

function init() {
    cacheElements();
    bindEvents();
    loadHistory();

    // Focus the first input
    elements.diceRolled.focus();
}

function cacheElements() {
    elements = {
        diceRolled: document.getElementById('dice-rolled'),
        diceKept: document.getElementById('dice-kept'),
        diceModifier: document.getElementById('dice-modifier'),
        diceTN: document.getElementById('dice-tn'),
        btnRoll: document.getElementById('btn-roll'),
        btnClear: document.getElementById('btn-clear'),
        resultArea: document.getElementById('result-area'),
        resultDice: document.getElementById('result-dice'),
        resultTotal: document.getElementById('result-total'),
        resultModifier: document.getElementById('result-modifier'),
        resultTN: document.getElementById('result-tn'),
        resultOutcome: document.getElementById('result-outcome'),
        rollHistory: document.getElementById('roll-history')
    };
}

function bindEvents() {
    // Roll button
    elements.btnRoll.addEventListener('click', executeRoll);

    // Clear history
    elements.btnClear.addEventListener('click', clearHistory);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.diceRolled.value = btn.dataset.rolled;
            elements.diceKept.value = btn.dataset.kept;
            executeRoll();
        });
    });

    // Keep dice <= rolled dice
    elements.diceRolled.addEventListener('change', () => {
        const rolled = parseInt(elements.diceRolled.value) || 1;
        const kept = parseInt(elements.diceKept.value) || 1;
        if (kept > rolled) {
            elements.diceKept.value = rolled;
        }
    });
}

function handleKeydown(e) {
    // Enter to roll (if not in a button)
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        executeRoll();
    }

    // Escape to clear inputs
    if (e.key === 'Escape') {
        elements.diceRolled.value = 5;
        elements.diceKept.value = 3;
        if (elements.diceModifier) elements.diceModifier.value = 0;
        elements.diceTN.value = 15;
        elements.diceRolled.focus();
    }
}

// ============================================================================
// Rolling Logic
// ============================================================================

function executeRoll() {
    const numDice = Math.max(1, parseInt(elements.diceRolled.value) || 5);
    const keepDice = Math.max(1, Math.min(numDice, parseInt(elements.diceKept.value) || 3));
    const modifier = parseInt(elements.diceModifier?.value) || 0;
    const tn = parseInt(elements.diceTN.value) || 15;

    // Sync inputs in case we clamped
    elements.diceRolled.value = numDice;
    elements.diceKept.value = keepDice;

    // Use shared dice module (new API with overflow compression)
    const result = DTD.dice.roll(numDice, keepDice, modifier);
    const outcome = DTD.dice.calculateOutcome(result.total, tn);

    // Display result
    displayResult(result, tn, outcome);

    // Add to history with structured data for replay
    addToHistory(numDice, keepDice, modifier, tn, result, outcome);
}

// ============================================================================
// Result Display
// ============================================================================

function displayResult(result, tn, outcome) {
    elements.resultArea.style.display = 'block';

    // Show dice (new DieRoll object shape)
    renderDice(result.allRolls, result.keptRolls);

    // Show overflow note if compression happened
    const overflowEl = document.getElementById('result-overflow');
    if (overflowEl) {
        if (result.overflow) {
            overflowEl.textContent = `(compressed to ${result.overflow.numDice}k${result.overflow.keepDice}${result.overflow.modifier > 0 ? '+' + result.overflow.modifier : ''})`;
            overflowEl.style.display = 'inline';
        } else {
            overflowEl.style.display = 'none';
        }
    }

    // Show totals (dice + modifier)
    if (result.modifier && result.modifier !== 0) {
        elements.resultTotal.textContent = result.total;
        if (elements.resultModifier) {
            elements.resultModifier.textContent = `(${result.diceTotal}${result.modifier >= 0 ? '+' : ''}${result.modifier})`;
            elements.resultModifier.style.display = 'inline';
        }
    } else {
        elements.resultTotal.textContent = result.total;
        if (elements.resultModifier) {
            elements.resultModifier.style.display = 'none';
        }
    }
    elements.resultTN.textContent = tn;

    // Show outcome
    renderOutcome(outcome);

    // Animate
    elements.resultArea.style.animation = 'none';
    elements.resultArea.offsetHeight; // Trigger reflow
    elements.resultArea.style.animation = 'slideIn 0.3s ease-out';
}

function renderDice(allRolls, keptRolls) {
    // Build a set of kept indices by matching DieRoll objects
    const keptValues = keptRolls.map(d => d.value);
    const keptSet = new Set();
    const keptCopy = [...keptValues];

    for (const keptVal of keptCopy) {
        for (let i = 0; i < allRolls.length; i++) {
            if (allRolls[i].value === keptVal && !keptSet.has(i)) {
                keptSet.add(i);
                break;
            }
        }
    }

    elements.resultDice.innerHTML = allRolls.map((die, i) => {
        const isKept = keptSet.has(i);
        const classes = ['die'];
        if (isKept) classes.push('kept');
        if (die.exploded && isKept) classes.push('exploded');
        if (!isKept) classes.push('dropped');

        return `<div class="${classes.join(' ')}">${die.value}</div>`;
    }).join('');
}

function renderOutcome(outcome) {
    let text = '';
    let className = '';

    if (outcome.success) {
        if (outcome.raises > 0) {
            text = `Success +${outcome.raises} Raise${outcome.raises > 1 ? 's' : ''}`;
            className = 'raises';
        } else {
            text = 'Success';
            className = 'success';
        }
    } else {
        if (outcome.checks > 0) {
            text = `Failure (${outcome.checks} Check${outcome.checks > 1 ? 's' : ''})`;
        } else {
            text = 'Failure';
        }
        className = 'failure';
    }

    elements.resultOutcome.textContent = text;
    elements.resultOutcome.className = 'result-outcome ' + className;
}

// ============================================================================
// History Management
// ============================================================================

function addToHistory(numDice, keepDice, modifier, tn, result, outcome) {
    const modStr = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
    const entry = {
        notation: `${numDice}k${keepDice}${modStr}`,
        num: numDice,
        keep: keepDice,
        modifier: modifier,
        tn: tn,
        total: result.total,
        success: outcome.success,
        raises: outcome.raises,
        checks: outcome.checks,
        timestamp: Date.now()
    };

    state.history.unshift(entry);

    // Limit history size
    if (state.history.length > state.maxHistory) {
        state.history.pop();
    }

    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.rollHistory.innerHTML = '<p class="empty-state">No rolls yet. Press Enter or click Roll!</p>';
        return;
    }

    elements.rollHistory.innerHTML = state.history.map((entry, i) => {
        const outcomeClass = entry.success ? 'success' : 'failure';
        let outcomeText = '';

        if (entry.success) {
            outcomeText = entry.raises > 0 ? `+${entry.raises}R` : 'Pass';
        } else {
            outcomeText = entry.checks > 0 ? `${entry.checks}C` : 'Fail';
        }

        const time = formatTime(entry.timestamp);

        return `
            <div class="history-entry ${outcomeClass}" onclick="replayRoll(${i})">
                <div class="history-roll">${entry.notation} vs TN ${entry.tn}</div>
                <div class="history-result">
                    <span class="history-total">${entry.total}</span>
                    <span class="history-outcome ${outcomeClass}">${outcomeText}</span>
                </div>
                <div class="history-time">${time}</div>
            </div>
        `;
    }).join('');
}

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return new Date(timestamp).toLocaleDateString();
}

function replayRoll(index) {
    const entry = state.history[index];
    if (!entry) return;

    // Use structured data if available, fall back to parsing notation
    if (entry.num != null && entry.keep != null) {
        elements.diceRolled.value = entry.num;
        elements.diceKept.value = entry.keep;
        if (elements.diceModifier) elements.diceModifier.value = entry.modifier || 0;
        elements.diceTN.value = entry.tn;
        executeRoll();
    } else {
        // Legacy: parse notation string
        const match = entry.notation.match(/(\d+)k(\d+)/);
        if (match) {
            elements.diceRolled.value = match[1];
            elements.diceKept.value = match[2];
            elements.diceTN.value = entry.tn;
            executeRoll();
        }
    }
}

function clearHistory() {
    state.history = [];
    saveHistory();
    renderHistory();
    elements.resultArea.style.display = 'none';
}

// ============================================================================
// Persistence
// ============================================================================

function saveHistory() {
    try {
        localStorage.setItem('dtd-roll-history', JSON.stringify(state.history));
    } catch (e) {
        console.warn('Failed to save history:', e);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('dtd-roll-history');
        if (saved) {
            state.history = JSON.parse(saved);
            renderHistory();
        }
    } catch (e) {
        console.warn('Failed to load history:', e);
    }
}

// Make replayRoll accessible from onclick
window.replayRoll = replayRoll;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
