// Game UI Module
import { config, armButton, initGameLogic, engine } from './gameLogic.js';

function initUI() {
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';
    config.colors.forEach((color, index) => {
        const button = document.createElement('button');
        button.className = 'color-button';
        button.textContent = `Color ${index + 1}`;
        button.style.backgroundColor = color;
        button.addEventListener('click', () => {
            armButton(color);
        });
        buttonsContainer.appendChild(button);
    });
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
}

window.addEventListener('DOMContentLoaded', initGameUI);
