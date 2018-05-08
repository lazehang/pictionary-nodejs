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
                    return done(null, {
                        id: user.id,
                        username: profile.id,
                        name: profile.displayName

                    });
                } else {
                    const newUser = {
                        username: profile.id,
                        social_id: profile.id,
                        name: profile.displayName
                    };

                    knex('users').insert(newUser)
                        .then((user) => {
                            done(null, {
                                id: user.id,
                                username: profile.id,
                                name: profile.displayName
                            });
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
                    bcrypt.checkPassword(password, user.password)
                        .then(result => {
                            if (result) {
                                return done(null, {
                                    id: user.id,
                                    username: user.username,
                                    name: user.name
                                });
                            } else {
                                return done(null, false, { message: 'Incorrect credentials' });
                            }
                        })
                        .catch(err => console.log(err));
                })
        }
    ));

    passport.use('local-signup', new LocalStrategy({
            passReqToCallback: true
        },
        (req, username, password, done) => {
            knex('users').where({ username: username }).first()
                .then((user) => {
                    if (user) {
                        return done(null, false, { message: 'Username already taken' });
                    } else {
                        bcrypt.hashPassword(password)
                            .then(hash => {
                                const newUser = {
                                    username: username,
                                    password: hash,
                                    name: req.body.name
                                };

                                knex('users').insert(newUser).then((newuser) => {
                                    console.log(newuser)
                                    knex('users').where({ username: newUser.username }).first().then((user) => {
                                        done(null, {
                                            id: user.id,
                                            username: user.username,
                                            name: user.name
                                        });
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