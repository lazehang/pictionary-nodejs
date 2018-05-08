const RedisFunction = require('./../redisFunction');
const SocketRoomEvent = require('./../SocketRoomEvent');
const SocketGameEvent = require('./../SocketGameEvent');

class SocketRouter {
    constructor(io, redisClient) {
        this.io = io;
        this.redisClient = redisClient;
        this.redisFx = new RedisFunction(this.redisClient);
        this.roomEvent = new SocketRoomEvent(this.redisClient);
        this.gameEvent = new SocketGameEvent(this.io);
    }

    router() {
        this.io.on('connection', (socket) => {
            let auth = false;
            if (typeof (socket.session.passport) == "undefined") {
                auth = false;
            }
            else if (typeof (socket.session.passport.user) == "undefined") {
                auth = false;
            }
            else {
                auth = true;
            }

            let player = socket.session;
            console.log("================");
            console.log('this is from socket.io : \n', player);
            console.log("================");

            if (!auth) {
                socket.emit('unauthorized');
                console.log("unauthorized");
            } else {
                socket.on("room page ready", () => {
                    console.log("socket join room");
                    this.roomEvent.socketJoinRoom(socket);
                });

                // === check active player list , if no , add to list ===
                this.roomEvent.addNewPlayer(socket);

                // === SocketRoomEvent ===
                socket.on("create room", settings => {
                    this.roomEvent.onCreateRoom(socket, settings);
                });

                socket.on("join room", roomID => {
                    this.roomEvent.onJoinRoom(socket, { roomID: roomID }, null);
                });

                socket.on("room page ready", () => {
                    this.roomEvent.socketJoinRoom(socket);
                })

                socket.on("leave room", msg => {
                    this.roomEvent.onLeaveRoom(socket, msg);
                });

                socket.on("end game", msg => {
                    // this.onLeaveRoom(socket, msg);
                });

                // === SocketGameEvent ===
                let room = "";
                this.findGameByPlayer(socket).then((data) => room = data);
                // === guess event ===
                socket.on("submit guess", data => {
                    this.gameEvent.onGuess(socket, data, room);
                });

                // === draw event ===
                socket.on("mouse down", data => {
                    this.gameEvent.onMouseDown(socket, data, room);
                });

                socket.on("mouse up", data => {
                    this.gameEvent.onMouseUp(socket, data, room);
                });

                socket.on("draw", data => {
                    this.gameEvent.onDraw(socket, data, room);
                });

                socket.on("dust", data => {
                    this.gameEvent.onDust(socket, data, room);
                })

                socket.on("change color", data => {
                    this.gameEvent.onChangeColor(socket, data, room);
                });

                socket.on("brush size", data => {
                    this.gameEvent.onChangeSize(socket, data, room);
                });

                // === disconnect (page change, closed etc) ===
                socket.on('disconnect', () => {
                    // socket.session destroyed already
                    this.onDisconnect(player.passport.user.username);
                });

                // === logout ===
                socket.on("logout", () => {
                    this.onLogout(socket);
                });

                // === lobby game list ===
                socket.on("update game list", () => {
                    this.roomEvent.getRoomList(socket);
                });
            }
        });
    }

    onDisconnect(username) {
        this.roomEvent.onDisconnect(username);
    }

    onLogout(socket) {
        this.roomEvent.onLogout(socket);
    }

    onError(msg) {
        socket.emit("error", msg);
    }
}

module.exports = SocketRouter;