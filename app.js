//app.js
//express app
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const http = require('http').Server(app);
const io = require('socket.io')(http);

// redis connection
const expressSession = require('express-session');
const redis = require("redis");
const RedisStore = require('connect-redis')(expressSession);
const socketIOSession = require("socket.io.session");

const hb = require('express-handlebars');
console.log("redis-connection");

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379
});

const sessionStore = new RedisStore({
    client: redisClient,
    unset: "destroy"
});

const settings = {
    store: sessionStore,
    secret: "supersecret",
    cookie: { "path": '/', "httpOnly": true, "secure": false, "maxAge": null },
    resave: false,
    saveUninitialized: true
        // maxAge : 10 * 60 * 1000 ms
};

redisClient.on("error", function(err) {
    console.log(`REDIS: ${err}`);
});

app.use(expressSession(settings));
io.use(socketIOSession(settings).parser);

app.engine('handlebars', hb({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// passport
console.log("passport.js");
const passport = require("./passport")(app);

// for create socketRouter in router.js
const SocketRouter = require("./socketRouter");
const socketRouter = new SocketRouter(io, redisClient);
socketRouter.router();

// routing

const router = require('./routes/appRouter')(express, app, io);
app.use("/", router);

http.listen(8080);

// https for dev
// const localHttps = require("./local-https");
// localHttps(app);