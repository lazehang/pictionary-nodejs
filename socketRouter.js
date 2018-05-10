const nanoid = require('nanoid');

class SocketRouter {
    constructor(io, redisClient) {
        this.io = io;
        this.redisClient = redisClient;
    }

    router() {
        this.io.on('connection', (socket) => {
            let player = socket.session.passport.user;

            console.log('this is from socket.io : \n', player);
            console.log("================")

            if (this.playerIsNotActive(player)) {
                this.addActivePlayer(player);
            }

            let playerObject = this.fetchPlayerFromRedis(player);

            if (!player) {
                socket.emit('unauthorized');
            } else {
                // === room event ===
                socket.on("create room", settings => {
                    this.onCreateRoom(socket, settings);
                });

                socket.on("join room", roomID => {
                    if (player.roomID !== roomID) {
                        player.roomID = roomID;
                        this.onJoinRoom(socket);
                    }
                    else {
                        this.onError("already in room");
                    }
                });

                socket.on("leave room", msg => {
                    this.onLeaveRoom(socket, msg);
                });

                socket.on("end game", msg => {
                    this.onLeaveRoom(socket, msg);
                });

                // === guess event ===
                socket.on("submit guess", guess => {
                    this.onGuess(socket, msg);
                });



                // === draw event ===


                // === disconnect (page change, closed etc) ===
                socket.on('disconnect', () => {
                    // socket.session destroyed already
                    // this.removeActivePlayer(player);
                    this.onDisconnect();
                });
            }
        });
    }

    async onCreateRoom(socket, settings) {
        let player = socket.session.passport.user;

        let activePlayer = await this.fetchPlayerFromPlayerList(player);

        let gameObject = {
            roomID: this.ranGenRoomID(),
            playerOne: activePlayer.nanoID,
            playerTwo: null,
            private: settings.private,
            password: settings.password,
            full: (this.playerTwo ? true : false)
            // to-do : sitdown: true
        };

        // replace it with access to DB
        console.log(`Room Creator   ${gameObject.playerOne}`);
        console.log(`Game id        ${gameObject.roomID}`);
        console.log(`Game p2        ${gameObject.playerTwo}`);
        console.log(`Game privacy   ${gameObject.private}`);
        console.log(`Game pw        ${gameObject.password}`);
        console.log(`Game full      ${gameObject.full}`);

        await this.addGameObjectToDB(gameObject);

        // redir user to room.html
        // this.io.to(socketID) ? socket ?
        socket.emit('room created', { gameObject });

        await this.writeDataToPlayerObjectInDB({ roomID: gameObject.roomID, playerID: gameObject.playerOne });

        // user join socket room
        this.onJoinRoom(socket, gameObject, activePlayer);
    }

    onJoinRoom(socket, gameObject, activePlayer) {
        let roomID = gameObject.roomID;
        let player = activePlayer;

        // join rm in socket
        socket.join(roomID);
        console.log(`${player.email} joined room: ${roomID}.`);
        console.log(`roomID from DB: ${player.roomID}`);

        // emit event to whole chat rm
        this.io.in(roomID).emit('player joining', { user: player.nanoID, roomID: roomID });
    }

    onLeaveRoom(socket, msg) {
        let roomID = gameObject.roomID;
        let player = socket.session.passport.user;

        // also destory game in collection
        var notInGame = true;
        for (var i = 0; i < gameCollection.totalGameCount; i++) {

            var roomIDTmp = gameCollection.gameList[i]['roomID']
            var player1Tmp = gameCollection.gameList[i]['playerOne'];
            var player2Tmp = gameCollection.gameList[i]['playerTwo'];

            if (player1Tmp == player.email) {
                // creator leaving room , destory room
                gameCollection.totalGameCount--;
                console.log("Destroy Game " + roomIDTmp + "!");

                gameCollection.gameList.splice(i, 1);
                console.log(gameCollection.gameList);

                socket.emit('room destroyed', { roomID: roomIDTmp });
                // this.io.to().emit('game destroyed', { roomId: roomIDTmp, gameOwner: user });
                notInGame = false;

            }
            else if (player2Tmp == player.email) {

                gameCollection.gameList[i]['playerTwo'] = null;
                console.log(player.email + " has left " + roomIDTmp);
                socket.emit('leftGame', { gameId: roomIDTmp });
                console.log(gameCollection.gameList[i]);
                notInGame = false;

            }
        }

        // leave rm , remove roomID from session
        socket.leave(roomID);
        socket.session.passport.roomID = "";

        if (notInGame == true) {
            socket.emit('notInGame');
        }
    }

    onGuess(socket, guess) {
        let roomID = socket.session.passport.roomID;
        let user = socket.session.passport.user.email;
        let guessBlock = { user: user, guess: guess };
        console.log(guessBlock);

        // emit msg to rm
        this.io.to(roomID).emit('display guesses', guessBlock);

        // check answer
        if (guessBlock.guess == answer) {
            // do sth
        }
    }

    onDisconnect() {
        console.log('a user left us');
    }

    // ===== create / join / kill room

    gameSeeker(socket) {
        ++loopLimit;
        if ((gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

            buildGame(socket);
            loopLimit = 0;

        } else {
            var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
            if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null) {
                gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
                socket.emit('joinSuccess', {
                    gameId: gameCollection.gameList[rndPick]['gameObject']['id']
                });

                console.log(socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);

            } else {

                gameSeeker(socket);
            }
        }
    }

    onError(msg) {
        socket.emit("error", msg);
    }

    randomGenID(type) {
        if (type == "roomID" || type == "playerID") {
            let found, result;
            this.redisClient.lrange(type, 0, -1, (err, data) => {
                if (err) {
                    console.log(err);
                }
                else {
                    for (let i = 0; i < data.length; i++) {
                        result = type + "_" + nanoid();
                        found = data.find(result);
                        if (found == undefined) {
                            i == data.length;
                        }
                    }
                }
            });
            this.redisClient.lpush(type, result, (err) => {
                console.log(err);
            });
            return result;
        }
        else {
            throw new Error("invalid type");
        }
    }

    async fetchPlayerListFromRedis() {

        this.redisClient.lrange("playerList", 0, -1, (err, data) => {
            if (err) {
                throw err;
            }
            else {
                return (data);
            }
        });

    }

    async fetchPlayerFromPlayerList(player) {
        let playerList = await this.fetchPlayerListFromRedis();
        let length = playerList.length;

        for (let i = 0; i < length; i++) {
            if (playerList[i][email] == player.email) {
                return (playerList[i]);
            }
        }
        return (false);
    }

    async playerIsNotActive(player) {
        let hasPlayer = await this.fetchPlayerFromPlayerList();
        return ((hasPlayer == false) ? true : false);
    }

    addActivePlayer(player) {
        let playerToAdd = {
            id: player.id,
            email: player.email,
            nanoID: this.randomGenID("playerID"),
            roomID: "none"
        }
        this.redisClient.lpush("playerList", playerToAdd, (err) => {
            throw (err);
        });
    }

    async removeActivePlayer(player) {

        if (await this.playerIsNotActive(player)) {
            throw new Error("no such player in active list");
        }
        else {
            let hasPlayer = await this.fetchPlayerFromPlayerList();

            await this.redisClient.lrem("playerList", 1, hasPlayer, (err) => {
                if (err) {
                    throw (err)
                }

            });
        }

    }

    async addGameObjectToDB(gameObject) {

        this.redisClient.lpush("gameList", gameObject, (err, data) => {
            if (err) {
                throw new Error(err);
            }

        })

    }

    async writeDataToPlayerObjectInDB(data) {

        let playerList = await this.fetchPlayerListFromRedis();
        let length = playerList.length;

        for (let i = 0; i < length; i++) {
            if (playerList[i][playerID] == data.playerID) {
                playerList[i][roomID] = data.roomID;
                await removeActivePlayer(playerList[i]);
                await addActivePlayer(playerList[i]);

            }
        }


    }
}

module.exports = SocketRouter;

// === supposed to be in DB
var gameCollection = {
    totalGameCount: 0,
    gameList: [
        {
            roomID: 0,
            playerOne: "p1-session",
            playerTwo: "p2-seesion",
            private: true,
            password: "123456",
            full: true
        }
    ]
};