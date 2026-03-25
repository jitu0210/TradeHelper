const {
  calculateRR,
  calculateWinRate,
  positionSize
} = require("../utils/trading");

exports.getRiskReward = (req, res) => {
  try {
    const { entry, stopLoss, target } = req.body;

    if (!entry || !stopLoss || !target) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const result = calculateRR(
      Number(entry),
      Number(stopLoss),
      Number(target)
    );

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getWinRate = (req, res) => {
  try {
    const { wins, losses } = req.body;

    if (wins == null || losses == null) {
      return res.status(400).json({
        success: false,
        message: "Wins and losses are required"
      });
    }

    const result = calculateWinRate(
      Number(wins),
      Number(losses)
    );

    return res.status(200).json({
      success: true,
      data: {
        winRate: result
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPositionSize = (req, res) => {
  try {
    const { capital, riskPercent, stopLoss } = req.body;

    if (!capital || !riskPercent || !stopLoss) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const result = positionSize(
      Number(capital),
      Number(riskPercent),
      Number(stopLoss)
    );

    return res.status(200).json({
      success: true,
      data: {
        quantity: result
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};