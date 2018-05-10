//passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('./utils/bcrypt');
const knexConfig = require('./knexfile')[process.env.NODE_ENV || 'staging'];
const knex = require('knex')(knexConfig);
require('dotenv').config();

module.exports = (app) => {
    console.log("passport init");
    app.use(passport.initialize());
    console.log("passport session");
    app.use(passport.session());

    passport.use('facebook', new FacebookStrategy({
            clientID: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_OAUTH_CBURL
                // callbackURL: process.env.FACEBOOK_OAUTH_CBURL_DEV
        },
        function(accessToken, refreshToken, profile, done) {
            knex('users').where({
                social_id: profile.id
            }).first().then((user) => {
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        username: profile.displayName,
                        password: null,
                        social_id: profile.id
                    };

                    knex('users').insert(newUser)
                        .then((user) => {
                            done(null, newUser);
                        })
                        .catch((err) => {
                            done(err);
                        })
                }
            })
        }
    ));

    passport.use('local-login', new LocalStrategy(
        (username, password, done) => {
            knex('users').where({
                    username: username
                })
                .first()
                .then((user) => {
                    if (user == null) {
                        return done(null, false, { message: 'Incorrect credentials.' });
                    }
                    console.log(user.password);
                    bcrypt.checkPassword(password, user.password)
                        .then(result => {
                            if (result) {
                                return done(null, user);
                            } else {
                                return done(null, false, { message: 'Incorrect credentials' });
                            }
                        })
                        .catch(err => console.log(err));
                })
        }
    ));

    passport.use('local-signup', new LocalStrategy(
        (username, password, done) => {
            knex('users').where({ username: username }).first()
                .then((user) => {
                    if (user) {
                        return done(null, false, { message: 'Username already taken' });
                    } else {
                        bcrypt.hashPassword(password)
                            .then(hash => {
                                const newUser = {
                                    username: username,
                                    password: hash
                                };
                                knex('users').insert(newUser).then((newuser) => {
                                    console.log(newuser)
                                    knex('users').where({ username: newUser.username }).first().then((user) => {
                                        done(null, user);
                                    })
                                })
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch((err) => {
                    return done(err);
                });
        }
    ));

    passport.serializeUser((sessionUser, done) => {
        console.log("Serialize : \n", sessionUser);
        done(null, sessionUser);
    });

    passport.deserializeUser((sessionUser, done) => {
        console.log("Deserialize sessionUser : \n", sessionUser, "\n ===");
        done(null, sessionUser);
        // if (sessionUser.profile != null) {
        //     if (sessionUser.profile.provider == 'facebook') {
        //         if (sessionUser.profile) {
        //             done(null, sessionUser.profile)
        //         } else {
        //             done(new Error('facebook sessionUser failed.'));
        //         }
        //     }
        // } else if (sessionUser.email) {
        //     let user = users.find((u) => u.email == sessionUser.email);
        //     if (user == null) {
        //         done(new Error('wrong email.'));
        //     } else {
        //         done(null, user);
        //     }
        // }
    });
};