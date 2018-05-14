const RedisFunction = require('./../redisFunction');

class SocketRouter {
    constructor(io, redisClient) {
        this.io = io;
        this.redisClient = redisClient;
        this.redisFx = new RedisFunction(this.redisClient);
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
                // work around : check joinRoomAfterReload to join room
                if (joinRoomAfterLoad[socket.session.passport.user.username] == true) {
                    console.log("socket join room");
                    this.socketJoinRoom(socket);
                }

                // === check active player list , if no , add to list ===
                this.addNewPlayer(socket);

                // === SocketRoomEvent ===
                socket.on("create room", settings => {
                    this.onCreateRoom(socket, settings);
                });

                socket.on("join room", roomID => {
                    this.onJoinRoom(socket, { roomID: roomID }, null);
                });

                socket.on("room page ready", () => {
                    this.socketJoinRoom(socket);
                })

                socket.on("leave room", () => {
                    this.onLeaveRoom(socket);
                });

                socket.on("end game", data => {
                    this.onEndGame(socket, data);
                });

                // // === SocketGameEvent ===
                let room = "";
                this.findGameByPlayer(socket).then((data) => room = data);

                socket.on("round ready", () => {
                    this.roundReady(socket, room);
                });

                socket.on("win round", () => {
                    this.roundWin(socket, room);
                });

                socket.on("lose round", () => {
                    this.roundLose(socket, room);
                });

                // === guess event ===
                socket.on("submit guess", data => {
                    this.onGuess(socket, data, room);
                });

                // === draw event ===
                socket.on("mouse down", data => {
                    this.onMouseDown(socket, data, room);
                });

                socket.on("mouse up", data => {
                    this.onMouseUp(socket, data, room);
                });

                socket.on("draw", data => {
                    this.onDraw(socket, data, room);
                });

                socket.on("dust", data => {
                    this.onDust(socket, data, room);
                })

                socket.on("change color", data => {
                    this.onChangeColor(socket, data, room);
                });

                socket.on("brush size", data => {
                    this.onChangeSize(socket, data, room);
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
                    this.getRoomList(socket);
                });
            }
        });
    }

    // ROOM EVENT
    async onCreateRoom(socket, settings) {
        // create game info obj store in redis , creator "join" room
        let player = socket.session.passport.user;
        let activePlayer = await this.redisFx.findPlayerFromList(player);
        let gameObject = {
            roomID: "someIDA", //this.redisFx.randomGenID("roomID"),
            roomName: settings.roomName || "default",
            playerOne: activePlayer.nanoID,
            P1name: activePlayer.username,
            playerTwo: null,
            P2name: null,
            private: settings.private,
            password: settings.password,
            full: (this.playerTwo ? true : false)
        };
        // dev
        console.log(`Room Creator   ${gameObject.P1name}     ${gameObject.playerOne}`);
        console.log(`Game id        ${gameObject.roomID}`);
        console.log(`Game p2        ${gameObject.P2name}     ${gameObject.playerTwo}`);
        console.log(`Game privacy   ${gameObject.private}`);
        console.log(`Game pw        ${gameObject.password}`);
        console.log(`Game full      ${gameObject.full}`);
        // write game obj to db
        await this.redisFx.addGameToList(gameObject);
        // user "join" room
        this.onJoinRoom(socket, gameObject, activePlayer);
    }

    async onJoinRoom(socket, gameObject, activePlayer) {
        // write roomID to player info if not yet
        // write P2 into selected game
        // call socket join when room page is ready
        let roomID = gameObject.roomID;
        console.log("on join room ", roomID)
        let player = activePlayer || socket.session.passport.user;
        let playerID = "";
        let username = "";
        if (activePlayer) {
            // comes from create room
            playerID = activePlayer.nanoID;
            username = activePlayer.username;
        }
        else {
            // comes from join room directly
            console.log("from join room directly")
            let user = await this.redisFx.findPlayerFromList(player);
            playerID = user.nanoID;
            username = user.username;
            // writeP2IntoGameObj
            await this.redisFx.writePlayer2IntoGameObject({ roomID: roomID, playerID: playerID, username: username });
        }
        // write room ID to player obj
        await this.redisFx.writeRoomIDToPlayerObjectInDB({ roomID: roomID, playerID: playerID });
        // not joining socket room b4 page is loaded

        // work around b4 fixing
        joinRoomAfterLoad[username] = true;
    }

    async socketJoinRoom(socket) {
        // socket join room since page is ready , trigger on client side
        // find session user's room id
        let player = socket.session.passport.user;
        let playerObj = await this.redisFx.findPlayerFromList(player);
        // join rm in socket
        socket.join(playerObj.roomID);
        console.log(`${playerObj.username} joined room: ${playerObj.roomID}.`);

        this.io.in(playerObj.roomID).clients((error, clients) => {
            if (error) throw error;
            console.log(clients);
        });
        joinRoomAfterLoad[playerObj.username] = false;

        // === dev ===
        let game = await this.redisFx.findGameFromList(playerObj.roomID);
        if (game.playerOne == playerObj.nanoID) {
            socket.emit("player draw", null);
        }
        else {
            socket.emit("player guess", null);
            this.io.in(playerObj.roomID).emit("both player ready");
        }
    }

    async onLeaveRoom(socket) {
        let player = socket.session.passport.user;
        // p2 leave room > ajax get lobby > socket auto leave room > socket reconnect
        // remove rmID from p2 obj > remove p2 from rm obj
        let playerObj = await this.redisFx.findPlayerFromList(player);
        let gameObj = await this.redisFx.findGameFromList(playerObj.roomID);

        if (gameObj.playerTwo == playerObj.nanoID) {
            // case : P2 , find , del , mod , add
            // room obj
            await this.redisFx.removeGameFromList(gameObj);
            gameObj.playerTwo = null;
            gameObj.P2name = null;
            await this.redisFx.addGameToList(gameObj);
            // player obj
            await this.redisFx.removePlayerUsingNanoID(playerObj.nanoID);
            playerObj.roomID = "none";
            await this.redisFx.reAddPlayerWithRoomID(playerObj);
        }
        else {
            // case : P1 , check / 5s , p2 == null , del game , update P obj
            setInterval(() => {
                this.checkP2(playerObj);
            }, 3000);
        }
    }

    async checkP2(playerObj) {
        let gameObj = await this.redisFx.findGameFromList(playerObj.roomID);
        if (gameObj.playerTwo == null) {
            clearInterval();
            // del game
            await this.redisFx.removeGameFromList(gameObj);
            // update player
            await this.redisFx.removePlayerUsingNanoID(playerObj.nanoID);
            playerObj.roomID = "none";
            await this.redisFx.reAddPlayerWithRoomID(playerObj);
        }
    }

    async findGameByPlayer(socket) {
        return await this.redisFx.findGameByPlayer(socket.session.passport.user);
    }

    addNewPlayer(socket) {
        this.redisFx.checkPlayerIsActive(socket.session.passport.user);
    }

    async getRoomList(socket) {
        let listOfGames = await this.redisFx.getRoomList(socket);
        socket.emit("new game list", listOfGames);
    }

    onDisconnect(username) {
        console.log(username, ' disconnected');
    }

    onLogout(socket) {
        console.log("log out : ", socket.session.passport.user.username)
        this.redisFx.removeActivePlayer(socket.session.passport.user);
        // ^ may cause lobby show rm breaking
        // also remove item from psql db
    }

    onError(msg) {
        socket.emit("error", msg);
    }

    // GAME EVENT
    // === guess event ===
    onGuess(socket, data, room) {
        console.log(data);
        this.io.to(room).emit("receive guess", data);
    }

    // === draw event ===
    onMouseDown(socket, data, room) {
        console.log("MD");
        console.log(room);
        this.io.to(room).emit("mouse down", data);
    }

    onMouseUp(socket, data, room) {
        console.log("MU");
        this.io.to(room).emit("mouse up", data);
    }

    onDraw(socket, data, room) {
        this.io.to(room).emit("draw", data);
    }

    onDust(socket, data, room) {
        this.io.to(room).emit("dust", data);
    }

    onChangeColor(socket, data, room) {
        this.io.to(room).emit("change color", data);
    }

    onChangeSize(socket, data, room) {
        this.io.to(room).emit("brush size", data);
    }

    onEndGame(socket, data) {
        // data = { gamePlayed , win , point }
        // write to knex
    }

    roundReady(socket, room) {
        let username = socket.session.passport.user.username;
        let opp = "";
        let allReady = false;
        let key = Object.keys(roundReady);
        console.log("check ready");
        if (key.length == 0){
            console.log("empty list");
            roundReady[room] = {};
            roundReady[room][username] = {};
            roundReady[room][username]["ready"] = true;
        }
        else {
            if (typeof (roundReady[room]) == "undefined") {
                console.log("no room found, add 1");
                roundReady[room] = {};
                roundReady[room][username] = {};
                roundReady[room][username]["ready"] = true;
            }
            else {
                let ukey = Object.keys(roundReady[room]);
                if (ukey.length == 1) {
                    if (ukey[0] != username) {
                        opp = ukey[0];
                        console.log("obj has 1 key, diff user");
                        roundReady[room][username] = {};
                        roundReady[room][username]["ready"] = true;
                        allReady = true;
                    } else {
                        console.log("obj has 1 key, same user");
                    }
                }
                else {
                    // round2 n on
                    opp = (ukey[0] == username) ? ukey[1] : ukey[0];
                    if (roundReady[room][opp]["ready"] && !roundReady[room][username]["ready"]) {
                        console.log("obj has 2 key , both ok now");
                        roundReady[room][username]["ready"] = true;
                        allReady = true;
                    }
                    else {
                        console.log("obj has 2 key , opp not ok");
                        // other guy not ready
                        roundReady[room][username]["ready"] = true;
                    }
                }
            }
        }
        if (allReady) {
            console.log("start :", socket.session.passport.user.username);
            this.io.to(room).emit("start round");
            allReady = false;
            console.log(opp)
            console.log(roundReady[room])
            roundReady[room][username]["ready"] = false;
            roundReady[room][opp]["ready"] = false;
        }
    }

    roundWin(socket, room) {
        this.io.to(room).emit("win round");
    }

    // roundLose(socket, room) {
    //     this.io.to(room).emit("lose round");
    // }
}

module.exports = SocketRouter;

let joinRoomAfterLoad = {};

let roundReady = {};