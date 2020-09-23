import { WIDTH, HEIGHT, PLAYER_SPEED } from ".";
import { boxesIntersect } from "./collision";
import { knockedBack } from "./playerStates";

export function patrolling(enemy, player) {
    let oldX = enemy.x;
    updateEnemyLocation(enemy);
    if (oldX === enemy.x) {
        enemy.stateFunc = pausing;
    }

    if (boxesIntersect(player, enemy)) {
        player.stateFunc = knockedBack;
        if (player.dx == 0) {
            player.dx = PLAYER_SPEED * -Math.sign(enemy.dx);
        }
    }
}

export function pausing(enemy, player) {
    if (!enemy.pausingFrames) {
        enemy.pausingFrames = 30;
        enemy.gotoAndStop(0);
    }
    enemy.textures = [enemy.restFrame];

    enemy.pausingFrames -= 1;
    if (!enemy.pausingFrames) {
        enemy.stateFunc = patrolling;
        enemy.textures = enemy.walkingFrames;
        enemy.scale.x *= -1;
        enemy.dx *= -1;
        enemy.play();
    }
}

function updateEnemyLocation(enemy) {
    const newEnemyX = enemy.x + enemy.dx;
    const newEnemyY = enemy.y + enemy.dy;
    if (newEnemyX >= 400 + enemy.width / 2 && newEnemyX <= WIDTH - enemy.width / 2) {
        enemy.x = newEnemyX;
    }
    
    if (newEnemyY >= 0 && newEnemyY <= HEIGHT) {
        enemy.y = newEnemyY;
    }
}