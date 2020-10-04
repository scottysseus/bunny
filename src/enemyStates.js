import { updateLocation } from "./transform";
import { WIDTH } from ".";

export function patrolling(enemyState) {
    let oldX = enemyState.x;
    
    const newState = updateLocation(enemyState);
    if (newState.x >= 400 + enemyState.width / 2 && newState.y <= WIDTH - enemyState.width / 2) {
        enemyState = newState;
    }

    if (oldX === enemyState.x) {
        enemyState.stateFunc = pausing;
    }
    return enemyState;
}

export function pausing(enemyState) {
    if (!enemyState.pausingFrames) {
        enemyState.pausingFrames = 30;
    }
    enemyState.textures = [enemyState.restFrame];

    enemyState.pausingFrames -= 1;
    if (!enemyState.pausingFrames) {
        enemyState.stateFunc = patrolling;
        enemyState.textures = enemyState.walkingFrames;
        enemyState.scale.x *= -1;
        enemyState.dx *= -1;
    }
    return enemyState;
}