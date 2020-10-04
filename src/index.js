import * as PIXI from 'pixi.js';
import { controlled, EventTypes, processPlayerEvents, knockedBack } from './playerStates';
import { patrolling } from './enemyStates';
import { boxesIntersect } from './collision';

export const HEIGHT = 600;
export const WIDTH = 800;

export const PLAYER_SPEED = 3;
export const ENEMY_SPEED = 2;

let app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;

loader.add('ground', 'assets/ground.png')
    .add('bunny', 'assets/bunny-sheet.png')
    .add('enemy', 'assets/enemy-sheet.png');

let player, enemy;
let playerState = {}, enemyState = {};
let playerQueue = [];

loader.load((loader, resources) => {
    let ground = new PIXI.Container();
    for (let i = 0; i < 25; ++i) {
        let tile = new PIXI.Sprite(resources.ground.texture);
        ground.addChild(tile);
        tile.position.set(i * tile.width, HEIGHT - (tile.height));
    }

    let frames = [];
    for (let i = 0; i < 4; ++i) {
        frames.push(new PIXI.Texture(resources.bunny.texture, new PIXI.Rectangle(i * 48, 0, 48, 32)));
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
    app.stage.addChild(player);
    app.stage.addChild(enemy);

    playerState.scale = {x: 1, y: 1};
    playerState.x = player.width;
    playerState.y = HEIGHT - ground.height - (player.height / 2);
    playerState.width = player.width;
    playerState.height = player.height;
    player.animationSpeed = 0.3;

    playerState.dx = 0;
    playerState.dy = 0;
    player.anchor.set(0.5, 0.5);
    playerState.stateFunc = controlled;

    enemy.scale.set(-2, 2);
    enemyState.scale = {x: -2, y: 2};
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
    playerState = processPlayerEvents(playerState, playerQueue);
    playerState = playerState.stateFunc(playerState);
    enemyState = enemyState.stateFunc(enemyState);

    if(playerState.stateFunc != knockedBack && boxesIntersect(player, enemy)) {
        playerQueue.push({type: EventTypes.COLLISION, dx: enemyState.dx});
    }

    renderPlayer();
    renderEnemy();
}

function renderPlayer() {
    Object.assign(player, {x: playerState.x, y: playerState.y});
    player.scale.set(playerState.scale.x, playerState.scale.y);
    if(playerState.stateFunc == controlled && playerState.dx !== 0) {
        player.play();
    } else {
        player.gotoAndStop(0);
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
        }
    }, false);
}