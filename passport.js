const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('./bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const knexConfig = require('./knexfile')[process.env.NODE_ENV || 'staging'];
const knex = require('knex')(knexConfig);

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('local-login', new LocalStrategy(
        (username, password, done) => {
            knex('users').where({
                    username: username
                })
                .then((user) => {
                    if (user == null) {
                        return done(null, false, { message: 'Incorrect credentials.' });
                    }
                    user = user[0];
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


        }));

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_ACCESS_TOKEN,
        callbackURL: `/auth/facebook/callback`
    }, (accessToken, refreshToken, profile, done) => {
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
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};