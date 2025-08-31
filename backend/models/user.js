const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 6,
    // validate: {
    //   validator: (value) =>
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,12}$/.test(
    //       value
    //     ),
    //   message: (props) =>
    //     `${props.value} is not a valid password. Password must be 6-12 characters long, and contain at least one lowercase letter, one uppercase letter, one special character, and one numeric digit.`,
    // },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "Please provide a phone number"],
  },
  profileImage: {
    type: String,
    trim: true,
    default: null,
  },
  scans: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Scan", required: true },
    { versionKey: false },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
