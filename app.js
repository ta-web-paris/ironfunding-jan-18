const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejsLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost/ironfunding');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(ejsLayout);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'ironfundingdev',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// NEW
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, cb);
});

app.use(flash());

// Signing Up
passport.use(
  'local-signup',
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: 'email',
    },
    (req, email, password, done) => {
      // To avoid race conditions
      process.nextTick(() => {
        // Destructure the body
        const { email, password } = req.body;
        bcrypt.genSalt(14, (err, salt) => {
          if (err) return done(err);
          bcrypt.hash(password, salt, (err, hashedPass) => {
            if (err) return done(err);
            const newUser = new User({
              email,
              password: hashedPass,
            });

            newUser.save(err => {
              console.log(err);
              if (err && err.code === 11000) {
                req.flash('error', `An account with email '${email}' already exists`);
                return done(null, false);
              }
              if (newUser.errors) {
                Object.values(newUser.errors).forEach(error => {
                  req.flash('error', error.message);
                });
                return done(null, false);
              }
              done(err, newUser);
            });
          });
        });
      });
    }
  )
);

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    (email, password, done) => {
      User.findOne({ email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        bcrypt.compare(password, user.password, (err, isTheSame) => {
          if (err) return done(err);
          if (!isTheSame) {
            return done(null, false, { message: 'Incorrect password' });
          }
          return done(null, user);
        });
      });
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
