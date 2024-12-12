const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  image: { type: String, required: true },
  title: { type: String },
  description: { type: String }
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
