const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema({
  indicator: String,
  operator: String,
  value: mongoose.Schema.Types.Mixed,
});

const strategySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    conditions: [conditionSchema],
    stopLoss: String,
    target: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Strategy", strategySchema);
