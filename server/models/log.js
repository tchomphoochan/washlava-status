const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["startup", "auth_start", "auth_check_pass", "auth_check_fail", "machine_status"],
    },
    machineId: String,
    previousStatus: String,
    newStatus: String,
  },
  { timestamps: true }
);

// compile model from schema
module.exports = mongoose.model("log", LogSchema);
