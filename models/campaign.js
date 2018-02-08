const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TYPES = require('../config/campaign-types');

const campaignSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  goal: {
    required: true,
    min: 1,
    type: Number,
  },
  deadline: {
    required: true,
    type: Date,
  },
  category: {
    required: true,
    enum: TYPES,
    type: String,
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
