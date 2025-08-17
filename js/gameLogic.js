// Game Logic Module
const {Engine, Render, Runner, Bodies, Body, Sleeping, Composite, Events, Query, Vertices} = Matter;

const config = {
    colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
    shapes: ['circle', 'square', 'pentagon', 'hexagon'],
    initialCount: 300,
    minSize: 20,
    maxSize: 25,
    maxButtons: 3,
    spawnHeight: 10,
    groundHeight: 1000,
    gravity: {y: 0.4}
};

const gameState = {
    score: 0,
    armedButtons: [],
    activeShapes: []
};

const engine = Engine.create({
    gravity: { x: 0, y: 0.5 },
    enableSleeping: true
});
const world = engine.world;

const ground = Bodies.rectangle(400, config.groundHeight - 10, 810, 60, {
    isStatic: true,
    render: {fillStyle: '#333'},
    label: 'ground'
});
const walls = [
    Bodies.rectangle(400, 0, 810, 20, {isStatic: true}),
    Bodies.rectangle(0, config.groundHeight / 2, 20, config.groundHeight, {isStatic: true}),
    Bodies.rectangle(800, config.groundHeight / 2, 20, config.groundHeight, {isStatic: true})
];
Composite.add(world, [ground, ...walls]);

function getStarPath(size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    let path = '';
    for (let i = 0; i < spikes; i++) {
        const outerAngle = (Math.PI * 2 * i) / spikes - Math.PI/2;
        path += (i === 0 ? 'M' : 'L') +
            (Math.cos(outerAngle) * outerRadius + ',' +
                (Math.sin(outerAngle) * outerRadius));
        const innerAngle = outerAngle + Math.PI / spikes;
        path += 'L' +
            (Math.cos(innerAngle) * innerRadius + ',' +
                (Math.sin(innerAngle) * innerRadius));
    }
    return path + 'Z';
}

function createRandomShape() {
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const shapeType = config.shapes[Math.floor(Math.random() * config.shapes.length)];
    const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
    const x = Math.random() * 700 + 50;
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
        case 'square':
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
        case 'pentagon':
            shape = Bodies.polygon(x, config.spawnHeight, 5, size, {
                restitution: 0.5,
                friction: 0.04,
                render: { fillStyle: color },
                label: shapeType,
                shapeColor: color,
                chamfer: { radius: 2 }
            });
            break;
        case 'hexagon':
            shape = Bodies.polygon(x, config.spawnHeight, 6, size, {
                restitution: 0.45,
                friction: 0.035,
                render: { fillStyle: color },
                label: shapeType,
                shapeColor: color,
                chamfer: { radius: 1 }
            });
            break;
        case 'star':
            shape = Bodies.fromVertices(x, config.spawnHeight, [
                Vertices.fromPath(getStarPath(size))
            ], {
                restitution: 0.4,
                friction: 0.06,
                render: { fillStyle: color },
                label: shapeType,
                shapeColor: color,
                chamfer: { radius: 1 }
            }, true);
            break;
    }
    gameState.activeShapes.push(shape);
    Composite.add(world, shape);
    return shape;
}

function destroyShape(shape) {
    Composite.allBodies(world).forEach(body => {
        if (body.isSleeping && !body.isStatic) {
            Body.setStatic(body, false);
            Sleeping.set(body, false);
        }
    });
    Composite.remove(world, shape);
    const index = gameState.activeShapes.indexOf(shape);
    if (index > -1) {
        gameState.activeShapes.splice(index, 1);
    }
    gameState.score++;
    if (typeof window.updateScore === 'function') window.updateScore(gameState.score);
    createRandomShape();
}

function handleCollisions(pairs) {
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if ((pair.bodyA === ground && pair.bodyB.label) ||
            (pair.bodyB === ground && pair.bodyA.label)) {
            const shape = pair.bodyA === ground ? pair.bodyB : pair.bodyA;
            const color = shape.shapeColor;
            const type = shape.label;
            // Destroy if color or type is armed
            if (gameState.armedButtons.includes(color) || gameState.armedButtons.includes(type)) {
                destroyShape(shape);
            }
        }
    }
}

function setupCollisionDetection() {
    Events.on(engine, 'collisionStart', (event) => {
        handleCollisions(event.pairs);
    });
}

function armButton(color) {
    const index = gameState.armedButtons.indexOf(color);
    if (index > -1) {
        gameState.armedButtons.splice(index, 1);
        return;
    }
    gameState.armedButtons.push(color);
    if (gameState.armedButtons.length > config.maxButtons) {
        gameState.armedButtons.shift();
    }
    const pairs = Query.collides(
        ground,
        Composite.allBodies(world).filter(b => b !== ground)
    );
    handleCollisions(pairs);
}

function initGameLogic() {
    setupCollisionDetection();
    for (let i = 0; i < config.initialCount; i++) {
        createRandomShape();
    }
    const runner = Runner.create();
    Runner.run(runner, engine);
}

export { config, gameState, engine, world, ground, armButton, initGameLogic };
