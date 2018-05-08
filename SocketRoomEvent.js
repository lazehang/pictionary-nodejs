// use this when socket is ready on room.hb
// switch joinRoomAfterLoad{} to room.onload

const RedisFunction = require('./redisFunction');

class SocketRoomEvent {
    constructor(redisClient) {
        this.redisClient = redisClient;
        this.redisFx = new RedisFunction(this.redisClient);
    }

    async onCreateRoom(socket, settings) {
        // create game info obj store in redis , creator "join" room
        let player = socket.session.passport.user;
        let activePlayer = await this.redisFx.findPlayerFromList(player);
        let gameObject = {
            roomID: "someIDA", //this.redisFx.randomGenID("roomID"),
            playerOne: activePlayer.nanoID,
            playerTwo: null,
            private: settings.private,
            password: settings.password,
            full: (this.playerTwo ? true : false)
        };
        // dev
        console.log(`Room Creator   ${gameObject.playerOne}`);
        console.log(`Game id        ${gameObject.roomID}`);
        console.log(`Game p2        ${gameObject.playerTwo}`);
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
            await this.redisFx.writePlayer2IntoGameObject({ roomID: roomID, playerID: playerID });
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
        // this.io.in(roomID).emit('player joining', { user: player.nanoID, roomID: roomID });
    }

    async onLeaveRoom(socket, msg) {
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

    async findGameByPlayer(playerObj) {
        let player = socket.session.passport.user;
        let activePlayer = await this.redisFx.findPlayerFromList(player);
        return activePlayer.roomID;
    }

    addNewPlayer(socket) {
        this.redisFx.checkPlayerIsActive(socket.session.passport.user);
    }

    async getRoomList(socket) {
        let JSONlist = await this.redisFx.getRoomList(socket);
        socket.emit("new game list", JSONlist);
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
}

module.exports = SocketRoomEvent;