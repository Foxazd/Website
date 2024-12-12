// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  username: String,
  email: String,
  action: String,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
