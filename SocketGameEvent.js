// use this when socket is ready on room.hb
// switch joinRoomAfterLoad{} to room.onload

class SocketGameEvent {
    constructor(io) {
        this.io = io;
    }

    // === guess event ===
    onGuess(socket, data, room) {
        this.io.to(room).emit("guess", data);
    }

    // === draw event ===
    onMouseDown(socket, data, room) {
        console.log("mouse down");
        this.io.to(room).emit("mouse down", data);
    }

    onMouseUp(socket, data, room) {
        console.log("mouse up");
        this.io.to(room).emit("mouse up", data);
    }

    onDraw(socket, data, room) {
        console.log("draw");
        this.io.to(room).emit("draw", data);
    }

    onDust(socket, data, room) {
        console.log("dust");
        this.io.to(room).emit("dust", data);
    }

    onChangeColor(socket, data, room) {
        console.log("colorn");
        this.io.to(room).emit("change color", data);
    }

    onChangeSize(socket, data, room) {
        console.log("size");
        this.io.to(room).emit("brush size", data);
    }

    // === misc ===
    onError(msg) {
        socket.emit("error", msg);
    }
}

module.exports = SocketGameEvent;