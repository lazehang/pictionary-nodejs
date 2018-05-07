const express = require('express');
const passport = require('passport');

class appRouter {
    // constructor(appService) {
    //     this.appService = appService;
    // }

    router() {
        let router = express.Router();

        function isLoggedIn(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }

            res.redirect('/login');
        }


        router.get("/", isLoggedIn, (req, res) => {
            res.send('Here we are ' + req.user.username + '<a href="/logout">logout</a>');
        });

        router.get("/login", (req, res) => {
            res.send('<h1>login page</h1>')
        })

        router.get("/signup", (req, res) => {
            res.send('<h1>Signup Page </h1>')
        })

        router.post('/login', passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/error'
        }));

        router.get('/error', (req, res) => {
            res.send('You are not logged in!');
        });

        router.get('/signup', (req, res) => {
            res.sendFile(__dirname + '/signup.html');
        });

        router.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: '/error'
        }));

        router.get('/auth/facebook', passport.authenticate('facebook'));

        router.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

        router.get('/facebook', (req, res) => {
            res.send('FACEBOOK LOGIN' + JSON.stringify(req.user));
        })

        router.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        return router;
    }


}

module.exports = appRouter;