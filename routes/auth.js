const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

router.get('/signup', ensureLoggedOut(), (req, res, next) => {
  res.render('auth/signup', {
    errors: req.flash('error'),
  });
});

router.get('/login', ensureLoggedOut(), (req, res, next) => {
  res.render('auth/login', {
    errors: req.flash('error'),
  });
});

router.post(
  '/signup',
  ensureLoggedOut(),
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true,
  })
);

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

router.get('/logout', ensureLoggedIn(), (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
