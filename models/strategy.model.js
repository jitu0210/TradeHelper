import mongoose from "mongoose";

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

const Strategy = mongoose.model("Strategy", strategySchema);
