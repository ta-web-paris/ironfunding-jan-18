const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign');
const TYPES = require('../config/campaign-types');
const { ensureLoggedIn } = require('connect-ensure-login');

router.get('/', ensureLoggedIn(), (req, res, next) => {
  res.render('campaigns/index');
});

router.get('/new', ensureLoggedIn(), (req, res, next) => {
  res.render('campaigns/new', {
    categories: TYPES,
  });
});

router.post('/', ensureLoggedIn(), (req, res, next) => {
  const newCampaign = new Campaign({
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline,
    // We're assuming a user is logged in here
    // If they aren't, this will throw an error
    creator: req.user._id,
  });

  newCampaign.save(err => {
    if (newCampaign.errors) {
      Object.values(newCampaign.errors).forEach(error => {
        req.flash('error', error.message);
      });
      return res.redirect('/campaigns/new');
    }
    if (err) return next(err);

    res.redirect('/campaigns/' + newCampaign._id);
  });
});

module.exports = router;
