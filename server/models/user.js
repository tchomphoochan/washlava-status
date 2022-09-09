const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
});

// compile model from schema
module.exports = process.env.DISABLE_MONGODB ? new Object() : mongoose.model("user", UserSchema);
