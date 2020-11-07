import { WIDTH, PLAYER_SPEED } from ".";
import { boxesIntersect } from "./collision";
import { updateLocation } from "./transform";

export const EventTypes = {
    LEFT_PRESSED: 0,
    LEFT_RELEASED: 1,
    RIGHT_PRESSED: 2,
    RIGHT_RELEASED: 3,
    UP_RELEASED: 4,
};

export function processPlayerEvents(playerState, queue) {
    while ((event = queue.shift()) !== undefined) {
        switch (event.type) {
            case EventTypes.LEFT_PRESSED:
                if (playerState.stateFunc == controlled && playerState.dx <= 0) {
                    playerState = goLeft(playerState);
                }
                playerState.leftDown = true;
                break;
            case EventTypes.RIGHT_PRESSED:
                if (playerState.stateFunc == controlled && playerState.dx >= 0) {
                    playerState = goRight(playerState);
                }
                playerState.rightDown = true;
                break;
            case EventTypes.LEFT_RELEASED:
                if (playerState.stateFunc == controlled && playerState.dx <= 0) {
                    if (playerState.rightDown) {
                        playerState = goRight(playerState);
                    } else {
                        playerState.dx = 0;
                    }
                }
                playerState.leftDown = false;
                break;
            case EventTypes.RIGHT_RELEASED:
                if (playerState.stateFunc == controlled && playerState.dx >= 0) {
                    if(playerState.leftDown) {
                        playerState = goLeft(playerState);
                    } else {
                        playerState.dx = 0;
                    }
                }
                playerState.rightDown = false;
                break;
            case EventTypes.UP_RELEASED:
                if (playerState.stateFunc == controlled) {
                    playerState.stateFunc = jumping;
                }
                break;
        }
    }

    return playerState;
}

export function controlled(playerState, enemyState, envState) {
    playerState = updateLocation(playerState);
    if ((playerState.x <= playerState.width / 2 || playerState.x >= WIDTH - (playerState.width / 2) - 2) && playerState.dx != 0) {
        playerState.stateFunc = knockedBack;
    }

    if(boxesIntersect(playerState.bounds, enemyState.bounds)) {
        let eventDx = playerState.dx ? -playerState.dx : enemyState.dx;
        playerState.stateFunc = knockedBack;
        playerState.dx = PLAYER_SPEED * -Math.sign(eventDx);
    }

    return playerState;
}

export function jumping(playerState) {
    if (!playerState.jumpingFrames || playerState.jumpingFrames < 0) {
        playerState.jumpingFrames = 25;
        playerState.dy = -3;
    }

    playerState = updateLocation(playerState);

    playerState.jumpingFrames -= 1;
    if (playerState.jumpingFrames <= 0) {
        playerState.stateFunc = falling;
    }

    return playerState;
}

export function falling(playerState) {
    playerState.dy = 2;
    playerState = updateLocation(playerState);
    return playerState;
}

export function knockedBack(playerState) {
    if (!playerState.knockBackFrames) {
        playerState.knockBackFrames = 25;
        playerState.dx *= -1;
    }

    playerState = updateLocation(playerState);

    playerState.knockBackFrames -= 1;
    if (playerState.knockBackFrames <= 0) {
        playerState.stateFunc = controlled;
        playerState.dx = 0;
    }
    return playerState;
}

function goLeft(playerState) {
    playerState.dx = -PLAYER_SPEED;
    playerState.scale.x = -1;
    return playerState;
}

function goRight(playerState) {
    playerState.dx = PLAYER_SPEED;
    playerState.scale.x = 1;
    return playerState;
}