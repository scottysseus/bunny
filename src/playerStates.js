import { WIDTH, HEIGHT, PLAYER_SPEED } from ".";
import { updateLocation } from "./transform";

export const EventTypes = {
    LEFT_PRESSED: 0,
    LEFT_RELEASED: 1,
    RIGHT_PRESSED: 2,
    RIGHT_RELEASED: 3,

    COLLISION: 4,
};

export function processPlayerEvents(playerState, queue) {
    while ((event = queue.shift()) !== undefined) {
        switch (event.type) {
            case EventTypes.LEFT_PRESSED:
                if (playerState.stateFunc == controlled && playerState.dx <= 0) {
                    playerState.dx = -PLAYER_SPEED;
                    playerState.scale.x = 1;
                }
                break;
            case EventTypes.RIGHT_PRESSED:
                if (playerState.stateFunc == controlled && playerState.dx >= 0) {
                    playerState.dx = PLAYER_SPEED;
                    playerState.scale.x = -1;
                }
                break;
            case EventTypes.LEFT_RELEASED:
                if (playerState.stateFunc == controlled && playerState.dx <= 0) {
                    playerState.dx = 0;
                }
                break;
            case EventTypes.RIGHT_RELEASED:
                if (playerState.stateFunc == controlled && playerState.dx >= 0) {
                    playerState.dx = 0;
                }
                break;
            case EventTypes.COLLISION:
                playerState.stateFunc = knockedBack;
                playerState.dx = PLAYER_SPEED * -Math.sign(event.dx);
                break;
        }
    }

    return playerState;
}

export function controlled(playerState) {  
    playerState = updateLocation(playerState);
    if ((playerState.x <= playerState.width / 2 || playerState.x >= WIDTH - (playerState.width / 2) - 2) && playerState.dx != 0) {
        playerState.stateFunc = knockedBack;
    }
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