const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
