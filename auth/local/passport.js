import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, login, password, done) {
  User.find({
    where: {
      email: login.toLowerCase()
    }
  })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'Invalid login or password.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, { message: 'Invalid login or password.' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function(login, password, done) {
    return localAuthenticate(User, login, password, done);
  }));
}
