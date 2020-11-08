import * as PIXI from 'pixi.js';
import { controlled, EventTypes, processPlayerEvents, knockedBack, falling, jumping } from './playerStates';
import { patrolling } from './enemyStates';
import { boxesIntersect } from './collision';

export const HEIGHT = 600;
export const WIDTH = 800;

export const PLAYER_SPEED = 3;
export const ENEMY_SPEED = 2;

let app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x33ccff;

const loader = PIXI.Loader.shared;

loader.add('ground', 'assets/ground.png')
    .add('bunny', 'assets/bunny-sheet.png')
    .add('carrot', 'assets/carrot.png')
    .add('enemy', 'assets/enemy-sheet.png');

let player, enemy, ground, carrots;
let playerState = {}, enemyState = {}, envState = {};
let playerQueue = [];

loader.load((loader, resources) => {
    ground = new PIXI.Container();
    for (let i = 0; i < 25; ++i) {
        let tile = new PIXI.Sprite(resources.ground.texture);
        tile.anchor.set(0.5, 0.5)
        ground.addChild(tile);
        tile.position.set((i * tile.width) + tile.width / 2, HEIGHT - (tile.height / 2));
    }

    carrots = new PIXI.Container();
    let carrot = new PIXI.Sprite(resources.carrot.texture);
    carrot.dy = 0.3;
    carrot.anchor.set(0.5, 0.5);
    carrot.position.set(WIDTH - 425, HEIGHT - 60);
    carrots.addChild(carrot);

    let frames = [];
    for (let i = 0; i < 3; ++i) {
        frames.push(new PIXI.Texture(resources.bunny.texture, new PIXI.Rectangle(i * 28, 0, 28, 29)));
    }
    player = new PIXI.AnimatedSprite(frames);

    let walkingFrames = [];
    for (let i = 0; i < 4; ++i) {
        walkingFrames.push(new PIXI.Texture(resources.enemy.texture, new PIXI.Rectangle(i * 24 + i * 1, 0, 24, 36)));
    }
    let enemyAtRest = new PIXI.Texture(resources.enemy.texture, new PIXI.Rectangle(4 * 24 + 4, 0, 24, 36));
    enemy = new PIXI.AnimatedSprite(walkingFrames);
    enemy.restFrame = enemyAtRest;
    enemy.walkingFrames = walkingFrames;

    app.stage.addChild(ground);
    app.stage.addChild(carrots);
    app.stage.addChild(player);
    app.stage.addChild(enemy);

    playerState.scale = {x: -1, y: 1};
    playerState.x = player.width;
    playerState.y = HEIGHT - ground.height - (player.height / 2);
    playerState.width = player.width;
    playerState.height = player.height;
    player.animationSpeed = 0.2;
    player.scale.set(-1,1);

    playerState.dx = 0;
    playerState.dy = 0;
    player.anchor.set(0.5, 0.5);
    playerState.stateFunc = controlled;

    enemy.scale.set(-1, 1);
    enemyState.scale = {x: -1, y: 1};
    enemyState.x = 600;
    enemyState.y = HEIGHT - ground.height - (enemy.height / 2);
    enemyState.dx = ENEMY_SPEED;
    enemyState.dy = 0;
    enemy.animationSpeed = 0.3;
    enemy.anchor.set(0.5, 0.5);
    enemyState.stateFunc = patrolling;
    enemyState.width = enemy.width;
    enemyState.height = enemy.height;

    setupKeyboard();

    app.ticker.add(delta => render(delta));
});

function render(delta) {
    playerState.bounds = player.getBounds();
    enemyState.bounds = enemy.getBounds();
    playerState = processPlayerEvents(playerState, playerQueue);
    playerState = playerState.stateFunc(playerState, enemyState, envState);
    enemyState = enemyState.stateFunc(enemyState);

    renderPlayer();
    renderEnemy();
    renderCarrots();
}

function renderPlayer() {
    Object.assign(player, {x: playerState.x, y: playerState.y});
    player.scale.set(playerState.scale.x, playerState.scale.y);
    if(playerState.stateFunc == controlled && playerState.dx !== 0) {
        player.play();
    } else if(playerState.stateFunc == jumping) {
        player.gotoAndStop(2);
    } else if (playerState.stateFunc == falling) {
        player.gotoAndStop(1);
    } else {
        player.gotoAndStop(0);
    }

    let onGround = false;
    ground.children.forEach(element => {
        if (boxesIntersect(player, element)) {
            onGround = true;
        }
    });

    if (!onGround && playerState.stateFunc != jumping) {
        playerState.stateFunc = falling;
    } else if(playerState.stateFunc == falling) {
        playerState.dy = 0;
        playerState.stateFunc = controlled;
        if (!playerState.leftDown && !playerState.rightDown) {
            playerState.dx = 0;
        }
    }
}

function renderEnemy() {
    Object.assign(enemy, {x: enemyState.x, y: enemyState.y});
    enemy.scale.set(enemyState.scale.x, enemyState.scale.y);
    if (enemyState.stateFunc == patrolling) {
        enemy.play();
    } else {
        enemy.gotoAndStop(0);
    }
}

function renderCarrots() {
    carrots.children.forEach(carrot => {
        if (carrot.y < HEIGHT - 60 || carrot.y > HEIGHT - 50) {
            carrot.dy *= -1;
        }
        carrot.y += carrot.dy;
    });
}

function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        switch (keyName) {
            case "ArrowLeft":
                playerQueue.push({ type: EventTypes.LEFT_PRESSED });
                break;
            case "ArrowRight":
                playerQueue.push({ type: EventTypes.RIGHT_PRESSED });
                break;
        }
    }, false);

    document.addEventListener('keyup', (event) => {
        const keyName = event.key;
        switch (keyName) {
            case "ArrowLeft":
                playerQueue.push({ type: EventTypes.LEFT_RELEASED });
                break;
            case "ArrowRight":
                playerQueue.push({ type: EventTypes.RIGHT_RELEASED });
                break;
            case "ArrowUp":
                playerQueue.push({ type: EventTypes.UP_RELEASED });
                break;
        }
    }, false);
}