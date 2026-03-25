const getRiskReward = (req, res) => {
  try {
    const { entry, stopLoss, target } = req.body;

    if (entry == null || stopLoss == null || target == null) {
      return res.status(400).json({
        success: false,
        message: "Entry, StopLoss and Target are required"
      });
    }

    const e = Number(entry);
    const sl = Number(stopLoss);
    const t = Number(target);

    const risk = e - sl;
    const reward = t - e;

    if (risk <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid StopLoss (risk must be > 0)"
      });
    }

    const rr = (reward / risk).toFixed(2);

    return res.status(200).json({
      success: true,
      data: {
        risk,
        reward,
        rr
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getWinRate = (req, res) => {
  try {
    const { wins, losses } = req.body;

    if (wins == null || losses == null) {
      return res.status(400).json({
        success: false,
        message: "Wins and losses are required"
      });
    }

    const w = Number(wins);
    const l = Number(losses);

    const total = w + l;

    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "Total trades cannot be zero"
      });
    }

    const winRate = ((w / total) * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      data: {
        winRate
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getPositionSize = (req, res) => {
  try {
    const { capital, riskPercent, stopLoss } = req.body;

    if (capital == null || riskPercent == null || stopLoss == null) {
      return res.status(400).json({
        success: false,
        message: "Capital, Risk % and StopLoss are required"
      });
    }

    const cap = Number(capital);
    const riskP = Number(riskPercent);
    const sl = Number(stopLoss);

    if (sl <= 0) {
      return res.status(400).json({
        success: false,
        message: "StopLoss must be > 0"
      });
    }

    const riskAmount = cap * (riskP / 100);
    const quantity = Math.floor(riskAmount / sl);

    return res.status(200).json({
      success: true,
      data: {
        riskAmount,
        quantity
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
    getRiskReward,
    getWinRate,
    getPositionSize
}