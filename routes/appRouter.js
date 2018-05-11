//router.js
const passport = require('passport');

const SocketRouter = require("./socketRouter");
var socketRouterList = {};

const knexConfig = require('../knexfile')[process.env.NODE_ENV || 'staging'];
const knex = require('knex')(knexConfig);

const AppService = require('../services/appService');
const appService = new AppService(knex);




module.exports = (express, app, io) => {
    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }

    // router.get('/', isLoggedIn, (req, res) => {
    //     res.redirect('/lobby');
    // });

    router.get('/', (req, res) => {
        res.redirect('/login');
    });

    router.get('/login', (req, res) => {
        res.render('login');
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/lobby',
        failureRedirect: '/error'
    }));

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/lobby',
        failureRedirect: '/error'
    }));

    router.get("/auth/facebook", passport.authenticate('facebook', {
        authType: 'rerequest',
        scope: ['user_friends', 'manage_pages']
    }));

    router.get("/auth/facebook/callback", passport.authenticate('facebook', {
        failureRedirect: "/login"
    }), (req, res) => {
        res.redirect('/lobby');
    });

    router.get('/lobby', isLoggedIn, (req, res) => {
        appService.getStat(req.user.id).then((stat) => {
            res.render('lobby', {
                user: req.user,
                isLoggedIn: req.isAuthenticated(),
                stats: stat
            });
        })
    });

    router.post("/room", (req, res) => {
        appService.getAllStats().then((allStats) => {
            console.log(allStats)
            res.render("room", {
                allStats: allStats,
                isLoggedIn: req.isAuthenticated()
            });
        });

    })

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    router.get('/error', (req, res) => {
        res.send('You are not logged in!');
    });

    router.get('/stats', isLoggedIn, (req, res) => {
        appService.getStat(req.user.id).then((stat) => {
            res.json(stat);
        });
    });

    router.get('/profile', (req, res) => {
        appService.getStat(req.user.id).then((stat) => {
            res.render('profile', {
                stats: stat
            });
        })

    })

    return router;
};