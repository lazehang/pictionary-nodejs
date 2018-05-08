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
                socket.on("subscribe", roomID => {
                    if (socket.session.passport.roomID !== roomID) {
                        socket.session.passport.roomID = roomID;
                        this.onJoinRoom(socket);
                    }
                });

                socket.on("chat message", msg => {
                    this.onMsgReceive(socket, msg);
                });

                socket.on("leaveRm", msg => {
                    this.onLeaveRoom(socket);
                })

                socket.on('disconnect', () => {
                    // socket.session.passport.user == undefined
                    this.onDisconnect();
                });
            }
        });
    }

    onJoinRoom(socket) {
        let roomID = socket.session.passport.roomID;
        let email = socket.session.passport.user.email;

        // join rm
        socket.join(roomID);
        console.log(`${email} joined room: ${roomID}.`);

        // emit event to whole chat rm
        this.io.in(roomID).emit('join room', `${email} joined room: ${roomID}.`);

        // fetch old msg for this user
        this.fetchMsg(socket, 0);
    }

    onLeaveRoom(socket) {
        // leave rm , remove roomID from session
        socket.leave(socket.session.passport.roomID);
        socket.session.passport.roomID = "";
    }

    onMsgReceive(socket, msg) {
        let roomID = socket.session.passport.roomID;
        let email = socket.session.passport.user.email;
        let storeMsg = { user: email, msg : msg };

        // save msg to redis
        this.redisClient.lpush(roomID, JSON.stringify(storeMsg), (err, data) => {
            if (err) { throw err; }
        });
        console.log(storeMsg);

        // emit msg to rm
        this.io.to(roomID).emit('chat message', storeMsg);
        // socket.in(this.chatroomName).emit('chat message', storeMsg);
    }

    fetchMsg(socket, count) {
        let roomID = socket.session.passport.roomID;

        // fetch msg by request from redis
        this.redisClient.lrange(roomID, count, count + 10, (err, messages) => {
            if (err) {
                console.log(err);
                this.io.emit('read chat error');
                return;
            }
            messages.reverse();
            this.io.to(roomID).emit('old message', messages);
            // socket.to(socket.id).emit('old message', messages);
        });
    }

    onDisconnect() {
        console.log('a user left us');
    }
}

module.exports = SocketRouter;