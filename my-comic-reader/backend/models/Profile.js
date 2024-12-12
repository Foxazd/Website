const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  province: { type: String, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'], 
    required: true
  },
  birthday: { type: Date },
  phone: { type: String, required: true },
  isChecked: { type: Boolean, required: true }
});

module.exports = mongoose.model('Profile', ProfileSchema);
