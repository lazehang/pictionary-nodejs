const nanoid = require('nanoid');

class RedisFunction {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    randomGenID(type) {
        if (type == "roomID" || type == "playerID") {
            let result = type + "_" + nanoid();
            return result;
        }
        // to do : add checking for repeat id
        else {
            console.log("err : invalid type input");
            return "err : invalid type input";
        }
    }

    // === player event , username ===
    // arg = socketPlayer , return X
    async checkPlayerIsActive(socketPlayer) {
        try {
            if (! await this.playerIsActive(socketPlayer)) {
                console.log("not active , add now")
                await this.addActivePlayer(socketPlayer);
            }
            else {
                console.log("player is active")
            }
        }
        catch (err) {
            console.log("from checkPlayerIsActive");
            console.log(err);
        }
    }

    // arg = socketPlayer , return bool
    async playerIsActive(socketPlayer) {
        try {
            // let hasPlayer = true;
            let hasPlayer = await this.findPlayerFromList(socketPlayer);
            console.log("find player from list : ", hasPlayer)
            return ((hasPlayer) ? true : false);
        }
        catch (err) {
            console.log("from playerIsActive");
            console.log(err);
        }
    }

    // arg = socketPlayer , return stored player OBJ
    async findPlayerFromList(socketPlayer) {
        try {
            let playerList = await this.fetchPlayerList();
            console.log("find player from list");
            let length = playerList.length;
            if (length > 0) {
                for (let i = 0; i < length; i++) {
                    let element = JSON.parse(playerList[i]);
                    if (element["username"] == socketPlayer.username) {
                        console.log(element["username"], "already exists");
                        return (element);
                    }
                }
                return (false);
            }
            else {
                console.log("seed the list");
                await this.addActivePlayer({ id: "seed", username: "seed" });
                return (false);
            }
        }
        catch (err) {
            console.log("from findPlayerFromList");
            console.log(err);
        }
    }

    // arg = X , return arr of stored player objs
    async fetchPlayerList() {
        return new Promise((resolve, reject) => {
            try {
                // return an array of JSON object (string)
                this.redisClient.lrange("playerList", 0, -1, (err, data) => {
                    console.log("fetched player list");
                    // console.log(data);
                    resolve(data);
                });
            }
            catch (err) {
                console.log("from fetchPlayerList");
                console.log(err);
                reject();
            }
        });
    }

    // arg = socketPlayer , return X
    addActivePlayer(socketPlayer) {
        return new Promise((resolve, reject) => {
            try {
                let playerToAdd = {
                    id: socketPlayer.id,
                    username: socketPlayer.username,
                    nanoID: this.randomGenID("playerID"),
                    roomID: "none"
                }
                this.redisClient.lpush("playerList", JSON.stringify(playerToAdd), (err, data) => {
                    console.log("new player added");
                    resolve();
                });
            }
            catch (err) {
                console.log("from addActivePlayer");
                console.log(err);
                reject();
            }
        });
    }

    // arg = socketPlayer , return X
    async removeActivePlayer(socketPlayer) {
        // v bool
        let isActive = await this.playerIsActive(socketPlayer);
        if (!isActive) {
            console.log("remove : no such player in active list");
        }
        else {
            // v plain obj
            let playerObj = await this.findPlayerFromList(socketPlayer);
            console.log("remove : ", playerObj.username);
            return new Promise((resolve, reject) => {
                try {
                    // JSONify b4 using
                    this.redisClient.lrem("playerList", 1, JSON.stringify(playerObj), (err) => {
                        console.log("player removed from active list");
                        resolve();
                    });
                }
                catch (err) {
                    console.log("from removeActivePlayer");
                    console.log(err);
                    reject();
                }
            });
        }
    }

    // === player event , nanoID ===
    // arg = nanoID , return stored player OBJ
    async findPlayerUsingNanoID(nanoID) {
        try {
            console.log("fetch player list (nanoID)");
            let playerList = await this.fetchPlayerList();
            console.log("find player using NanoID");
            let length = playerList.length;
            if (length > 0) {
                for (let i = 0; i < length; i++) {
                    let element = JSON.parse(playerList[i]);
                    if (element["nanoID"] == nanoID) {
                        console.log("found player with nanoID : ", element.username);
                        return (element);
                    }
                }
            }
            else {
                throw new Error("no such player");
            }
        }
        catch (err) {
            console.log("from findPlayerUsingNanoID");
            console.log(err);
        }
    }

    // arg = nanoID , return old player obj
    async removePlayerUsingNanoID(nanoID) {
        // v plain obj
        let playerObj = await this.findPlayerUsingNanoID(nanoID);
        console.log(playerObj)
        return new Promise((resolve, reject) => {
            try {
                // JSONify b4 using
                this.redisClient.lrem("playerList", 1, JSON.stringify(playerObj), (err) => {
                    console.log("player removed from active list");
                    resolve(playerObj);
                });
            }
            catch (err) {
                console.log("from remove player using NanoID");
                console.log(err);
                reject();
            }
        });
    }

    // arg = new player obj , return X
    async reAddPlayerWithRoomID(playerToAdd) {
        return new Promise((resolve, reject) => {
            try {
                this.redisClient.lpush("playerList", JSON.stringify(playerToAdd), (err, data) => {
                    console.log("player's roomID added");
                    resolve();
                });
            }
            catch (err) {
                console.log("from reAddPlayerWithRoomID");
                console.log(err);
                reject();
            }
        });
    }

    // === room event ===
    // arg = game object , return X
    async addGameToList(gameObject) {
        return new Promise((resolve, reject) => {
            try {
                // add game obj to db
                this.redisClient.lpush("gameList", JSON.stringify(gameObject), (err, data) => {
                    console.log("game obj added");
                    resolve();
                });
            }
            catch (err) {
                console.log("add game obj");
                console.log(err);
                reject();
            }
        });
    }

    // arg = game obj , return X
    async removeGameFromList(gameObject) {
        return new Promise((resolve, reject) => {
            try {
                this.redisClient.lrem("gameList", 1, JSON.stringify(gameObject), (err) => {
                    console.log("game obj removed");
                    resolve();
                });
            }
            catch (err) {
                console.log("remove game obj");
                console.log(err);
                reject();
            }
        });
    }

    // arg = roomID , return room obj
    async findGameFromList(roomID) {
        return new Promise((resolve, reject) => {
            try {
                this.redisClient.lrange("gameList", 0, -1, (err, data) => {
                    let list = data;
                    let length = list.length;
                    for (let i = 0; i < length; i++) {
                        let element = JSON.parse(list[i]);
                        if (element["roomID"] == roomID) {
                            i = length;
                            resolve(element);
                        }
                    }
                });
            }
            catch (err) {
                console.log("from findGameFromList");
                console.log(err);
                reject();
            }
        });
    }

    // arg = settings = { roomID: roomID, playerID: playerID } , return X
    async writePlayer2IntoGameObject(settings) {
        // find it , del it , mod it , add it back
        console.log("write P2 Into Game Object");
        let gameObject = await this.findGameFromList(settings.roomID);
        await this.removeGameFromList(gameObject);
        let newObj = gameObject;
        newObj.playerTwo = settings.playerID;
        await this.addGameToList(newObj);
    }


    // arg = {roomID, nanoID} , return X
    async writeRoomIDToPlayerObjectInDB(data) {
        // update player obj with roomID
        let oldPlayerObj = await this.removePlayerUsingNanoID(data.playerID);
        oldPlayerObj.roomID = data.roomID;
        await this.reAddPlayerWithRoomID(oldPlayerObj);
    }

    async findGameByPlayer(socketPlayer) {
        let activePlayer = await this.findPlayerFromList(socketPlayer);
        return activePlayer.roomID;
    }

    async gameListWithNames(socket){
        let JSONlist = await this.getRoomList();
        
    }

    // arg X , return game list JSON
    async getRoomList() {
        return new Promise((resolve, reject) => {
            try {
                this.redisClient.lrange("gameList", 0, -1, (err, data) => {
                    resolve(data);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = RedisFunction;