const mongoose = require('mongoose');
const passport = require('passport');
const { User } = require('./DB');

const LocalStrategy = require('passport-local').Strategy;

exports.pass = function(passport){
    passport.use(new LocalStrategy({
        usernameField: 'email', // use email as the username
        passwordField: 'password' // keep password as it is
      },
        function(email, password, done) {
            console.log(email, " : ",password);
            User.findOne({ email: email }).then(user => {
                if (!user) { return done(null, false); }
                user.verifyPassword(password, function (err, isMatch) {
                  if (err) { return done(err); }
                  if (!isMatch) { return done(null, false); }
                  return done(null, user);
                });
              }).catch(err => {
                if (err) { return done(err); }
              });
        }
      ));

    passport.serializeUser(function(user, done) {
    done(null, user.id);
    });
    
    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findById(id); // use await instead of callback
            done(null, user);
          } catch (err) {
            done(err);
          }
    });
};

exports.isAuthenticated = (req, res, next) =>{
    if (req.user) {return next()}
    res.redirect("/login");
}