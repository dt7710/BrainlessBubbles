// 1. Initialize Matter.js
const {Engine, Render, Runner, Bodies, Body, Sleeping, Composite} = Matter;

const engine = Engine.create({
    gravity: { x: 0, y: 0.5 }, // Reduced gravity helps
    enableSleeping: true        // Crucial for stabilization
});
const world = engine.world;

// 2. Bind Renderer to Existing Canvas
const render = Render.create({
    canvas: document.getElementById('gameCanvas'), // Bind to your canvas
    engine: engine,
    options: {
        width: 800,
        height: 1000,
        wireframes: false,
        background: '#f4f4f4'
    }
});

const runner = Runner.create();
Runner.run(runner, engine); // Pass runner instance
Render.run(render);

//////////////////////////////////////////
const config = {
    colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
    shapes: ['circle', 'rectangle', 'triangle'],
    initialCount: 300,
    minSize: 20,
    maxSize: 25,
    maxButtons: 3,
    spawnHeight: 10,
    groundHeight: 1000,
    gravity: {y: 0.4}
};

// Game state
const gameState = {
    score: 0,
    armedButtons: [],
    activeShapes: []
};

/////////////////////////////

// Create ground
const ground = Bodies.rectangle(400, config.groundHeight - 10, 810, 60, {
    isStatic: true,
    render: {fillStyle: '#333'},
    label: 'ground'
});

// Create walls
const walls = [
    Bodies.rectangle(400, 0, 810, 20, {isStatic: true}), // top
    Bodies.rectangle(0, config.groundHeight / 2, 20, config.groundHeight, {isStatic: true}), // left
    Bodies.rectangle(800, config.groundHeight / 2, 20, config.groundHeight, {isStatic: true}) // right
];

// Add to world
Composite.add(world, [ground, ...walls]);

// Create UI elements
function initUI() {
    const buttonsContainer = document.getElementById('buttons-container');

    // Create color buttons
    config.colors.forEach((color, index) => {
        const button = document.createElement('button');
        button.className = 'color-button';
        button.textContent = `Color ${index + 1}`;
        button.style.backgroundColor = color;

        button.addEventListener('click', () => {
            handleButtonPress(color);
        });

        buttonsContainer.appendChild(button);
    });
}

// Handle button presses
function handleButtonPress(color) {
    // If button is already armed, disarm it
    const index = gameState.armedButtons.indexOf(color);
    if (index > -1) {
        gameState.armedButtons.splice(index, 1);
        return;
    }

    // Add to armed buttons
    gameState.armedButtons.push(color);

    // Limit to 2 buttons
    if (gameState.armedButtons.length > config.maxButtons) {
        gameState.armedButtons.shift(); // Remove oldest button
    }

    const pairs = Matter.Query.collides(
        ground,
        Composite.allBodies(world).filter(b => b !== ground)
    );
    handleCollisions(pairs);
}

// Create random shape
function createRandomShape() {
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const shapeType = config.shapes[Math.floor(Math.random() * config.shapes.length)];
    const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
    const x = Math.random() * 700 + 50;
    //
    let shape;
    switch (shapeType) {
        case 'circle':
            shape = Bodies.circle(x, config.spawnHeight, size, {
                restitution: 0.6,
                friction: 0.01,
                render: {fillStyle: color},
                label: shapeType,
                shapeColor: color
            });
            break;
        case 'rectangle':
            shape = Bodies.rectangle(x, config.spawnHeight, size * 2, size * 2, {
                restitution: 0.4,
                friction: 0.05,
                render: {fillStyle: color},
                label: shapeType,
                shapeColor: color
            });
            break;
        case 'triangle':
            shape = Bodies.polygon(x, config.spawnHeight, 3, size, {
                restitution: 0.5,
                friction: 0.03,
                render: {fillStyle: color},
                label: shapeType,
                shapeColor: color
            });
            break;
    }
    gameState.activeShapes.push(shape);
    Composite.add(world, shape);
    return shape;
}

// Handle ground collisions
function setupCollisionDetection() {
    Matter.Events.on(engine, 'collisionStart', (event) => {
        handleCollisions(event.pairs);
    });
}

function handleCollisions(pairs) {
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        // Check if collision involves ground and a shape
        if ((pair.bodyA === ground && pair.bodyB.label) ||
            (pair.bodyB === ground && pair.bodyA.label)) {

            const shape = pair.bodyA === ground ? pair.bodyB : pair.bodyA;
            const color = shape.shapeColor;

            // Check if shape color matches armed buttons
            if (gameState.armedButtons.includes(color)) {
                destroyShape(shape);
            }
        }
    }
}

function destroyShape(shape) {

    Composite.allBodies(world).forEach(body => {
        if (body.isSleeping && !body.isStatic) {
            Body.setStatic(body, false); // Ensure not stuck as static
            Sleeping.set(body, false); // Force wake
        }
    });

    // Remove shape from world
    Composite.remove(world, shape);

    // Remove from active shapes
    const index = gameState.activeShapes.indexOf(shape);
    if (index > -1) {
        gameState.activeShapes.splice(index, 1);
    }

    // Update score
    gameState.score++;
    updateScore();

    // Create new shape
    createRandomShape();
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
}

// Initialize game
function initGame() {
    initUI();
    setupCollisionDetection();

    // Create initial shapes
    for (let i = 0; i < config.initialCount; i++) {
        createRandomShape();
    }

    // Start physics
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);