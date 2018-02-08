const express = require('express');
const moment = require('moment');
const router = express.Router();
const Campaign = require('../models/campaign');
const TYPES = require('../config/campaign-types');
const { ensureLoggedIn } = require('connect-ensure-login');

router.get('/', ensureLoggedIn(), (req, res, next) => {
  Campaign.find({}, (err, campaigns) => {
    if (err) return next(err)
    res.render('campaigns/index', { campaigns, moment });
  })
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

router.get('/:id', (req, res, next) => {
  Campaign.findById(req.params.id)
    .populate('creator')
    .exec((err, campaign) => {
      if (err) return next(err);
      res.render('campaigns/show', { campaign, moment });
    });
});

module.exports = router;
