const express = require('express');
const app = express();
const setupPassport = require('./passport');
const bodyParser = require('body-parser');
const knexConfig = require('./knexfile')[process.env.NODE_ENV || 'staging'];
const knex = require('knex')(knexConfig);
const expressSession = require('express-session');
const port = process.env.PORT || 3030;
// const http = require('http').Server(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(expressSession({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true
}));

// app.use(passport.initialize());

setupPassport(app);
const AppRouter = require('./routes/appRouter');
let approuter = new AppRouter();
app.use('/', approuter.router());

app.listen(port);