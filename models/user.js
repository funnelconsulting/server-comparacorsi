const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  surname: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  phone : {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 64,
  },
  passwordResetCode: {
    type: String,
  },
  codeVerifyEmail: {
    type: String,
  },
  emailNotification: {
    type: String,
  },
  notificationsEnabled: { type: Boolean, default: false },
  notificationSubscriptions: [{ 
    type: Object,
    default: null,
  }],
});

module.exports = mongoose.model("User", userSchema);
