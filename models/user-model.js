const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
    default: '../defaultimg/no-thumbnail.jpg'
  },
  // local login
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
  role:{
    type: String,
    enum:["manager","owner"],
    default:"owner",
  }
});

module.exports = mongoose.model("User", userSchema);

// 如果有不同權限的使用者
userSchema.methods.isOwner = function () {
  return this.role == "owner";
}

userSchema.methods.isManager = function () {
  return this.role == "manager";
}
