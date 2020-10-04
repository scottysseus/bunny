import { WIDTH, HEIGHT } from ".";

export function updateLocation(objectState) {
    const newState = Object.assign({}, objectState);
    
    const newX = objectState.x + objectState.dx;
    const newY = objectState.y + objectState.dy;
    
    if (newX >= 0 + objectState.width / 2 && newX <= WIDTH - objectState.width / 2) {
        newState.x = newX;
    }
    
    if (newY >= 0 && newY <= HEIGHT) {
        newState.y = newY;
    }

    return newState;
}