// Game UI Module

import { config, armButton, initGameLogic, engine, gameState } from './gameLogic.js';

function initUI() {
    // Remove buttons, show armed info instead
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';
    const armedInfo = document.createElement('div');
    armedInfo.id = 'armed-info';
    armedInfo.textContent = 'Armed: None';
    buttonsContainer.appendChild(armedInfo);
    updateArmedInfo();
}

function updateArmedInfo() {
    const armedInfo = document.getElementById('armed-info');
    if (!armedInfo) return;
    if (!window.chosenShape) {
        armedInfo.innerHTML = '<span>Armed: None</span>';
    } else {
        // Show a visual representation of the chosen shape
        const shape = window.chosenShape;
        let shapeHtml = '';
        switch (shape.label) {
            case 'circle':
                shapeHtml = `<div style="width:40px;height:40px;border-radius:50%;background:${shape.shapeColor};display:inline-block;"></div>`;
                break;
            case 'square':
                shapeHtml = `<div style="width:40px;height:40px;background:${shape.shapeColor};display:inline-block;"></div>`;
                break;
            case 'pentagon':
                shapeHtml = `<div style="width:40px;height:40px;clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);background:${shape.shapeColor};display:inline-block;"></div>`;
                break;
            case 'hexagon':
                shapeHtml = `<div style="width:40px;height:40px;clip-path:polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%);background:${shape.shapeColor};display:inline-block;"></div>`;
                break;
            case 'triangle':
                shapeHtml = `<div style="width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:40px solid ${shape.shapeColor};display:inline-block;"></div>`;
                break;
            default:
                shapeHtml = `<div style="width:40px;height:40px;background:${shape.shapeColor};display:inline-block;"></div>`;
        }
        armedInfo.innerHTML = `<span>Armed:</span> ${shapeHtml} <span style="margin-left:8px;">${shape.label}</span>`;
    }
}

// Listen for shape clicks
function setupShapeClick() {
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Find shape under mouse
        const { Mouse, Query } = Matter;
        const mouse = Mouse.create(canvas);
        mouse.position.x = mouseX;
        mouse.position.y = mouseY;
        const bodies = engine.world.bodies.filter(b => b.label && b.label !== 'ground');
        const found = Query.point(bodies, mouse.position);
        if (found.length > 0) {
            const shape = found[0];
            // Disarm all, then arm only this shape's color and type
            if (window.gameState) window.gameState.armedButtons = [];
            armButton(shape.shapeColor);
            armButton(shape.label);
            window.chosenShape = shape;
            updateArmedInfo();
        }
    });
}

window.updateScore = function(score) {
    document.getElementById('score').textContent = `Score: ${score}`;
    updateArmedInfo();
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
    setupShapeClick();
}

window.addEventListener('DOMContentLoaded', initGameUI);
