class SocketRouter {
    constructor(io, redisClient) {
        this.io = io;
        this.redisClient = redisClient;
    }

    router() {
        this.io.on('connection', (socket) => {
            let passportUser = socket.session.passport
            socket.session.passport.roomID = "";

            console.log('this is from socket.io : \n', passportUser);
            console.log("================")

            if (!passportUser) {
                socket.emit('unauthorized');
            } else {

                socket.on("create room", settings => {
                    this.onCreateRoom(socket, settings);
                });

                socket.on("join room", roomID => {
                    if (socket.session.passport.roomID !== roomID) {
                        socket.session.passport.roomID = roomID;
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

                socket.on("submit guess", guess => {
                    this.onGuess(socket, msg);
                });





                socket.on('disconnect', () => {
                    // socket.session.passport.user == undefined
                    this.onDisconnect();
                });
            }
        });
    }

    onCreateRoom(socket, settings) {

        let gameObject = {
            roomID: this.ranGenRoomID(),
            playerOne: socket.session.passport.email,
            playerTwo: null,
            private: settings.private,
            password: settings.password,
            full: (playerTwo ? true : false)
            // sitdown: true
        };

        // replace it with access to DB
        gameCollection.totalGameCount++;
        gameCollection.gameList.push({ gameObject });

        console.log(`Room Created by ${gameObject.playerOne}`);
        console.log(`Game info ${gameObject}`);

        // redir user to room.html
        // this.io.to(socketID) ? socket ?
        socket.emit('room created', { gameObject });

        // user join socket room
        this.onJoinRoom(socket, gameObject);

    }

    onJoinRoom(socket, gameObject) {
        let roomID = gameObject.roomID;
        let user = socket.session.passport.email;

        // join rm
        socket.join(roomID);
        console.log(`${user} joined room: ${roomID}.`);

        // emit event to whole chat rm
        this.io.in(roomID).emit('player joining', {user: user, roomID: roomID});

    }

    onLeaveRoom(socket, msg) {
        let roomID = gameObject.roomID;
        let user = socket.session.passport.email;

        // also destory game in collection
        var notInGame = true;
        for (var i = 0; i < gameCollection.totalGameCount; i++) {

            var roomIDTmp = gameCollection.gameList[i]['roomID']
            var player1Tmp = gameCollection.gameList[i]['playerOne'];
            var player2Tmp = gameCollection.gameList[i]['playerTwo'];

            if (player1Tmp == user) {
                // creator leaving room , destory room
                gameCollection.totalGameCount --;
                console.log("Destroy Game " + roomIDTmp + "!");

                gameCollection.gameList.splice(i, 1);
                console.log(gameCollection.gameList);

                socket.emit('room destroyed', { roomID: roomIDTmp });
                // this.io.to().emit('game destroyed', { roomId: roomIDTmp, gameOwner: user });
                notInGame = false;

            }
            else if (player2Tmp == user) {

                gameCollection.gameList[i]['playerTwo'] = null;
                console.log(user + " has left " + roomIDTmp);
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

    ranGenRoomID() {
        // gen random hash
        // check with game collection
        return "someIDA";
    }
}

module.exports = SocketRouter;

// === supposed to be in DB
var gameCollection = {
    totalGameCount: 0,
    gameList: [
        {
            roomID: 0,
            playerOne: p1-session,
            playerTwo: p2-seesion,
            private: true,
            password: "123456",
            full: true
        }
    ]
};