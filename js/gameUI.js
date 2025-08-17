// Game UI Module
import { config, armButton, initGameLogic, engine } from './gameLogic.js';

function initUI() {
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';
    // Expose armed buttons for UI (move this up so it's defined before use)
    window.getArmedButtons = function() {
        return (window.gameState && window.gameState.armedButtons) ? window.gameState.armedButtons : [];
    };

    // Color buttons
    config.colors.forEach((color, index) => {
        const button = document.createElement('button');
        button.className = 'color-button';
        button.textContent = `Color ${index + 1}`;
        button.style.backgroundColor = color;
        button.dataset.type = 'color';
        button.dataset.value = color;
        button.addEventListener('click', () => {
            armButton(color);
            updateArmedButtonsUI();
        });
        buttonsContainer.appendChild(button);
    });

    // Shape buttons
    config.shapes.forEach((shape, index) => {
        const button = document.createElement('button');
        button.className = 'shape-button';
        button.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
        button.dataset.type = 'shape';
        button.dataset.value = shape;
        button.addEventListener('click', () => {
            armButton(shape);
            updateArmedButtonsUI();
        });
        buttonsContainer.appendChild(button);
    });

    // Initial highlight
    updateArmedButtonsUI();
// Update button UI to show which are armed
function updateArmedButtonsUI() {
    const buttons = document.querySelectorAll('#buttons-container button');
    buttons.forEach(btn => {
        const value = btn.dataset.value;
        if (window.getArmedButtons().includes(value)) {
            btn.classList.add('armed');
        } else {
            btn.classList.remove('armed');
        }
    });
}

// Expose armed buttons for UI
window.getArmedButtons = function() {
    // gameState is imported from gameLogic.js
    // But not directly here, so we use armButton's closure
    // Instead, add a getter in gameLogic.js and import it
    // For now, we can use window.gameState if exposed
    return (window.gameState && window.gameState.armedButtons) ? window.gameState.armedButtons : [];
};
}

window.updateScore = function(score) {
    document.getElementById('score').textContent = `Score: ${score}`;
};

function setupRender() {
    const { Render } = Matter;
    const render = Render.create({
        canvas: document.getElementById('gameCanvas'),
        engine: engine,
        options: {
            width: 800,
            height: 1000,
            wireframes: false,
            background: '#f4f4f4'
        }
    });
    Render.run(render);
}

function initGameUI() {
    initUI();
    setupRender();
    initGameLogic();
    // Expose gameState for UI
    import('./gameLogic.js').then(mod => {
        window.gameState = mod.gameState;
        updateArmedButtonsUI();
    });
}

window.addEventListener('DOMContentLoaded', initGameUI);
