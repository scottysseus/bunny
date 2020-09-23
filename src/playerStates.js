import { WIDTH, HEIGHT } from ".";

export const States = {
    CONTROLLED: "controlled",
    KNOCKED_BACK: "knocked_back"
};

export function controlled(player) {
    player.state = States.CONTROLLED;

    updatePlayerLocation(player);
    if ((player.x <= player.width / 2 || player.x >= WIDTH - (player.width / 2) - 2) && player.dx != 0) {
        player.stateFunc = knockedBack;
    }
}

export function knockedBack(player) {
    player.state = States.KNOCKED_BACK;

    if (!player.knockBackFrames) {
        player.knockBackFrames = 25;
        player.dx *= -1;
    }

    updatePlayerLocation(player);

    player.knockBackFrames -= 1;
    if (player.knockBackFrames <= 0) {
        player.stateFunc = controlled;
        player.dx = 0;
        player.gotoAndStop(0);
    }
}

function updatePlayerLocation(player) {
    const newPlayerX = player.x + player.dx;
    const newPlayerY = player.y + player.dy;
    if (newPlayerX >= 0 + player.width / 2 && newPlayerX <= WIDTH - player.width / 2) {
        player.x = newPlayerX;
    }
    
    if (newPlayerY >= 0 && newPlayerY <= HEIGHT) {
        player.y = newPlayerY;
    }
}