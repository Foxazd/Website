const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  province: {
    type: String,
    required: false,
  },
  comicsRead: {
    type: Number,
    default: 0, // Khởi tạo số lượng truyện đã đọc
  },
  accountLevel: {
    type: String,
    enum: [
      'Bình thường',
      'Level 1', 
      'Level 2', 
      'Level 3', 
      'Level 4', 
      'Level 5', 
      'Level 6', 
      'Level 7', 
      'Level 8', 
      'Level 9', 
      'Level 10'
    ],
    default: 'Bình thường',
    required: false
  }, 
  gender: {
    type: String,
    enum: ['male', 'female', 'other'], 
    required: false
  },
  birthday: {
    type: Date,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: props => `${props.value} is not a valid date!`
    }
  },
  phone: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return /^[\d\s\-\+\(\)]+$/.test(v); 
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  image: {
    type: String,
    required: false,
  },
  lastLogin: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  notificationType: {
    type: String,
    enum: ['email'],
    default: 'email'
  },
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comic' 
  }]
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!this.email || !emailRegex.test(this.email)) {
    return next(new Error('Invalid email format'));
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  return this.save();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
