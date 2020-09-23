import * as PIXI from 'pixi.js';
import { States, controlled } from './playerStates';
import { patrolling } from './enemyStates';

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

let player, ground, enemy;

loader.load((loader, resources) => {
    let ground = new PIXI.Container();
    for (let i = 0; i < 25; ++i) {
        let tile  = new PIXI.Sprite(resources.ground.texture);
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

    player.x = player.width;
    player.y = HEIGHT - ground.height - (player.height / 2);
    player.animationSpeed = 0.3;

    player.dx = 0;
    player.dy = 0;
    player.anchor.set(0.5,0.5);
    player.stateFunc = controlled;

    enemy.scale.set(-2,2);
    enemy.x = 600;
    enemy.y = HEIGHT - ground.height - (enemy.height / 2);
    enemy.dx = ENEMY_SPEED;
    enemy.dy = 0;
    enemy.animationSpeed = 0.3;
    enemy.anchor.set(0.5, 0.5);
    enemy.stateFunc = patrolling;
    enemy.play();

    setupKeyboard();

    app.ticker.add(delta => render(delta));
});

function render(delta) {
    player.stateFunc(player);
    enemy.stateFunc(enemy, player);
}

function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if (player.state === States.CONTROLLED) {
            if (keyName === 'ArrowLeft' && player.dx <= 0) {
                player.dx = -PLAYER_SPEED;
                player.scale.x = 1;
                player.play();
    
            } else if (keyName === 'ArrowRight' && player.dx >= 0) {
                player.dx = PLAYER_SPEED;
                player.scale.x = -1;
                player.play();
            }
        }
    }, false);

    document.addEventListener('keyup', (event) => {
        const keyName = event.key;
        if (player.state === States.CONTROLLED) {
            if ((keyName === 'ArrowLeft' && player.dx <= 0) || (keyName === 'ArrowRight' && player.dx >= 0)) {
                player.dx = 0;
                player.gotoAndStop(0);
            }
        }
    }, false);
}