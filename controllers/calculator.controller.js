// const getRiskReward = (req, res) => {
//   try {
//     const { entry, stopLoss, target } = req.body;

//     if (entry == null || stopLoss == null || target == null) {
//       return res.status(400).json({
//         success: false,
//         message: "Entry, StopLoss and Target are required"
//       });
//     }

//     const e = Number(entry);
//     const sl = Number(stopLoss);
//     const t = Number(target);

//     const risk = e - sl;
//     const reward = t - e;

//     if (risk <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid StopLoss (risk must be > 0)"
//       });
//     }

//     const rr = (reward / risk).toFixed(2);

//     return res.status(200).json({
//       success: true,
//       data: {
//         risk,
//         reward,
//         rr
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// const getWinRate = (req, res) => {
//   try {
//     const { wins, losses } = req.body;

//     if (wins == null || losses == null) {
//       return res.status(400).json({
//         success: false,
//         message: "Wins and losses are required"
//       });
//     }

//     const w = Number(wins);
//     const l = Number(losses);

//     const total = w + l;

//     if (total === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Total trades cannot be zero"
//       });
//     }

//     const winRate = ((w / total) * 100).toFixed(2);

//     return res.status(200).json({
//       success: true,
//       data: {
//         winRate
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// const getPositionSize = (req, res) => {
//   try {
//     const { capital, riskPercent, stopLoss } = req.body;

//     if (capital == null || riskPercent == null || stopLoss == null) {
//       return res.status(400).json({
//         success: false,
//         message: "Capital, Risk % and StopLoss are required"
//       });
//     }

//     const cap = Number(capital);
//     const riskP = Number(riskPercent);
//     const sl = Number(stopLoss);

//     if (sl <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "StopLoss must be > 0"
//       });
//     }

//     const riskAmount = cap * (riskP / 100);
//     const quantity = Math.floor(riskAmount / sl);

//     return res.status(200).json({
//       success: true,
//       data: {
//         riskAmount,
//         quantity
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export {
//     getRiskReward,
//     getWinRate,
//     getPositionSize
// }








// Utility function for safe number conversion
const safeNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Utility for validating positive numbers
const validatePositive = (value, fieldName) => {
  if (value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  if (value <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

// 1. Risk Reward Calculator (Enhanced)
const getRiskReward = (req, res) => {
  try {
    let { entry, stopLoss, target } = req.body;

    // Auto-clean and convert inputs
    entry = safeNumber(entry);
    stopLoss = safeNumber(stopLoss);
    target = safeNumber(target);

    // Validate with friendly messages
    if (entry === null) {
      return res.status(400).json({
        success: false,
        message: "Entry price is required. Please enter the price at which you entered the trade."
      });
    }
    if (stopLoss === null) {
      return res.status(400).json({
        success: false,
        message: "Stop Loss price is required. Please enter your stop loss level."
      });
    }
    if (target === null) {
      return res.status(400).json({
        success: false,
        message: "Target price is required. Please enter your profit target."
      });
    }

    // Validate for LONG positions (entry > stopLoss)
    if (entry <= stopLoss) {
      return res.status(400).json({
        success: false,
        message: "For a LONG position, Entry price must be higher than Stop Loss price. Did you mean to enter a SHORT position?"
      });
    }

    if (target <= entry) {
      return res.status(400).json({
        success: false,
        message: "Target price must be higher than Entry price for a LONG position."
      });
    }

    const risk = Number((entry - stopLoss).toFixed(2));
    const reward = Number((target - entry).toFixed(2));
    const rr = Number((reward / risk).toFixed(2));
    
    // Calculate percentage risk/reward
    const riskPercent = Number(((risk / entry) * 100).toFixed(2));
    const rewardPercent = Number(((reward / entry) * 100).toFixed(2));

    // Risk reward ratio interpretation
    let interpretation = "";
    if (rr >= 3) interpretation = "Excellent risk-reward ratio!";
    else if (rr >= 2) interpretation = "Good risk-reward ratio";
    else if (rr >= 1.5) interpretation = "Acceptable risk-reward ratio";
    else if (rr >= 1) interpretation = "Minimum acceptable ratio";
    else interpretation = "Poor risk-reward ratio - consider adjusting targets";

    return res.status(200).json({
      success: true,
      data: {
        risk,
        reward,
        rr,
        riskPercent,
        rewardPercent,
        interpretation
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating. Please check your inputs."
    });
  }
};

// 2. Win Rate Calculator (Enhanced)
const getWinRate = (req, res) => {
  try {
    let { wins, losses, total } = req.body;

    wins = safeNumber(wins);
    losses = safeNumber(losses);
    total = safeNumber(total);

    // Calculate total if not provided but wins/losses are
    if (total === null && wins !== null && losses !== null) {
      total = wins + losses;
    }

    // Validate inputs
    if (wins === null && losses === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide either: (wins and losses) OR (wins and total trades)"
      });
    }

    if (wins === null) {
      return res.status(400).json({
        success: false,
        message: "Number of winning trades is required"
      });
    }

    if (total === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide either losses or total trades"
      });
    }

    if (wins < 0 || (losses !== null && losses < 0) || total < 0) {
      return res.status(400).json({
        success: false,
        message: "Numbers cannot be negative. Please enter valid positive numbers."
      });
    }

    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "Total trades cannot be zero. Please enter valid trade counts."
      });
    }

    if (wins > total) {
      return res.status(400).json({
        success: false,
        message: "Wins cannot exceed total trades. Please check your numbers."
      });
    }

    const winRate = Number(((wins / total) * 100).toFixed(2));
    const lossRate = Number((100 - winRate).toFixed(2));

    // Win rate interpretation
    let interpretation = "";
    if (winRate >= 70) interpretation = "Exceptional win rate!";
    else if (winRate >= 60) interpretation = "Very good win rate";
    else if (winRate >= 50) interpretation = "Good win rate - profitable with good RR";
    else if (winRate >= 40) interpretation = "Average - needs good risk management";
    else interpretation = "Below average - consider strategy review";

    return res.status(200).json({
      success: true,
      data: {
        winRate,
        lossRate,
        wins,
        losses: losses !== null ? losses : total - wins,
        total,
        interpretation
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating. Please check your inputs."
    });
  }
};

// 3. Position Size Calculator (Enhanced for Indian Markets)
const getPositionSize = (req, res) => {
  try {
    let { capital, riskPercent, stopLoss, marketType = 'equity', contractSize = 1, accountCurrency = 'INR' } = req.body;

    capital = safeNumber(capital);
    riskPercent = safeNumber(riskPercent);
    stopLoss = safeNumber(stopLoss);
    contractSize = safeNumber(contractSize, 1);

    // Validate with friendly messages
    if (capital === null) {
      return res.status(400).json({
        success: false,
        message: "Account capital is required. Please enter your total trading capital in ₹."
      });
    }
    if (capital <= 0) {
      return res.status(400).json({
        success: false,
        message: "Account capital must be greater than 0 ₹."
      });
    }

    if (riskPercent === null) {
      return res.status(400).json({
        success: false,
        message: "Risk percentage is required. Recommended: 1-2% per trade."
      });
    }
    if (riskPercent <= 0) {
      return res.status(400).json({
        success: false,
        message: "Risk percentage must be greater than 0. Recommended: 1-2%"
      });
    }
    if (riskPercent > 100) {
      return res.status(400).json({
        success: false,
        message: "Risk percentage cannot exceed 100%. Please enter a smaller percentage (1-2% recommended)."
      });
    }

    if (stopLoss === null) {
      return res.status(400).json({
        success: false,
        message: "Stop loss distance is required. Enter the price difference from entry to stop loss."
      });
    }
    if (stopLoss <= 0) {
      return res.status(400).json({
        success: false,
        message: "Stop loss distance must be greater than 0."
      });
    }

    const riskAmount = Number((capital * (riskPercent / 100)).toFixed(2));
    
    // Calculate quantity based on market type
    let quantity, actualRisk, actualRiskPercent;
    
    if (marketType === 'fno') {
      // For F&O, calculate lots
      quantity = Math.floor(riskAmount / (stopLoss * contractSize));
      actualRisk = Number((quantity * stopLoss * contractSize).toFixed(2));
    } else {
      // For equity/cash
      quantity = Math.floor(riskAmount / stopLoss);
      actualRisk = Number((quantity * stopLoss).toFixed(2));
    }
    
    actualRiskPercent = Number(((actualRisk / capital) * 100).toFixed(2));

    // Additional helpful calculations
    const maxLoss = Number((capital * 0.02).toFixed(2)); // 2% max risk recommendation
    const isRiskAcceptable = actualRiskPercent <= 2;

    // Market-specific recommendations
    let marketAdvice = "";
    if (marketType === 'fno') {
      if (quantity === 0) {
        marketAdvice = "Risk amount too small for 1 lot. Consider increasing capital or reducing stop loss.";
      } else {
        marketAdvice = `${quantity} lot(s) recommended for F&O trading.`;
      }
    } else {
      marketAdvice = `${quantity} shares recommended for equity/cash segment.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        riskAmount: `₹${riskAmount.toLocaleString('en-IN')}`,
        quantity,
        actualRisk: `₹${actualRisk.toLocaleString('en-IN')}`,
        actualRiskPercent,
        isRiskAcceptable,
        recommendation: isRiskAcceptable 
          ? "Risk is within acceptable range (≤2%)"
          : "Risk exceeds 2% - consider reducing position size",
        maxRecommendedRisk: `₹${maxLoss.toLocaleString('en-IN')}`,
        marketAdvice,
        details: {
          capital: `₹${capital.toLocaleString('en-IN')}`,
          riskPercent,
          stopLoss: `₹${stopLoss}`,
          marketType,
          contractSize,
          accountCurrency
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating. Please check your inputs."
    });
  }
};

// 4. NEW: Profit Calculator (Indian Markets)
const getProfitCalculator = (req, res) => {
  try {
    let { entry, exit, quantity, tradeType = 'long', marketType = 'equity', contractSize = 1 } = req.body;

    entry = safeNumber(entry);
    exit = safeNumber(exit);
    quantity = safeNumber(quantity);
    contractSize = safeNumber(contractSize, 1);

    if (entry === null) {
      return res.status(400).json({
        success: false,
        message: "Entry price is required"
      });
    }
    if (exit === null) {
      return res.status(400).json({
        success: false,
        message: "Exit price is required"
      });
    }
    if (quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Position quantity/size is required"
      });
    }

    let profitLoss, profitLossPercent, totalQuantity;
    
    // Calculate total quantity based on market type
    if (marketType === 'fno') {
      totalQuantity = quantity * contractSize;
    } else {
      totalQuantity = quantity;
    }
    
    if (tradeType === 'long') {
      profitLoss = Number(((exit - entry) * totalQuantity).toFixed(2));
      profitLossPercent = Number((((exit - entry) / entry) * 100).toFixed(2));
    } else {
      profitLoss = Number(((entry - exit) * totalQuantity).toFixed(2));
      profitLossPercent = Number((((entry - exit) / entry) * 100).toFixed(2));
    }

    const isProfit = profitLoss > 0;
    
    // Calculate brokerage impact (approx for Indian markets)
    const brokerage = Math.abs(profitLoss) * 0.0005; // 0.05% approx brokerage
    const stt = marketType === 'fno' ? Math.abs(profitLoss) * 0.01 : Math.abs(profitLoss) * 0.001; // STT for F&O vs equity
    const totalCharges = brokerage + stt;
    const netProfitLoss = profitLoss - totalCharges;

    return res.status(200).json({
      success: true,
      data: {
        profitLoss: `₹${Math.abs(profitLoss).toLocaleString('en-IN')}`,
        profitLossPercent,
        isProfit,
        netProfitLoss: `₹${Math.abs(netProfitLoss).toLocaleString('en-IN')}`,
        brokerage: `₹${brokerage.toFixed(2)}`,
        stt: `₹${stt.toFixed(2)}`,
        totalCharges: `₹${totalCharges.toFixed(2)}`,
        message: isProfit 
          ? `Profit: ₹${Math.abs(profitLoss).toLocaleString('en-IN')} (${profitLossPercent}%)` 
          : `Loss: ₹${Math.abs(profitLoss).toLocaleString('en-IN')} (${profitLossPercent}%)`,
        details: {
          entry: `₹${entry}`,
          exit: `₹${exit}`,
          quantity,
          totalQuantity,
          tradeType,
          marketType,
          contractSize
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating profit."
    });
  }
};

// 5. NEW: Required Win Rate Calculator
const getRequiredWinRate = (req, res) => {
  try {
    let { riskRewardRatio } = req.body;

    riskRewardRatio = safeNumber(riskRewardRatio);

    if (riskRewardRatio === null) {
      return res.status(400).json({
        success: false,
        message: "Risk-Reward ratio is required (e.g., 2 for 1:2 ratio)"
      });
    }
    if (riskRewardRatio <= 0) {
      return res.status(400).json({
        success: false,
        message: "Risk-Reward ratio must be greater than 0"
      });
    }

    // Break-even win rate formula: 1 / (1 + RR)
    const breakEvenWinRate = Number((1 / (1 + riskRewardRatio) * 100).toFixed(2));
    
    // Recommended win rate for profitability
    const profitableWinRate = Number((breakEvenWinRate + 5).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        riskRewardRatio,
        breakEvenWinRate,
        profitableWinRate,
        interpretation: `With a ${riskRewardRatio}:1 risk-reward ratio, you need a ${breakEvenWinRate}% win rate to break even. Aim for ${profitableWinRate}%+ for consistent profitability.`
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating required win rate."
    });
  }
};

// 6. NEW: Expectancy Calculator (Indian Context)
const getExpectancy = (req, res) => {
  try {
    let { avgWin, avgLoss, winRate } = req.body;

    avgWin = safeNumber(avgWin);
    avgLoss = safeNumber(avgLoss);
    winRate = safeNumber(winRate);

    if (avgWin === null) {
      return res.status(400).json({
        success: false,
        message: "Average winning trade amount (in ₹) is required"
      });
    }
    if (avgLoss === null) {
      return res.status(400).json({
        success: false,
        message: "Average losing trade amount (in ₹) is required"
      });
    }
    if (winRate === null) {
      return res.status(400).json({
        success: false,
        message: "Win rate percentage is required"
      });
    }

    const winProb = winRate / 100;
    const lossProb = 1 - winProb;
    
    const expectancy = Number((avgWin * winProb - avgLoss * lossProb).toFixed(2));
    const expectancyPerDollar = Number((expectancy / avgLoss).toFixed(2));
    const monthlyExpectancy = Number((expectancy * 20).toFixed(2)); // Assuming 20 trades per month

    let interpretation = "";
    if (expectancy > 0) {
      interpretation = `Positive expectancy! You can expect to make ₹${expectancy.toLocaleString('en-IN')} per trade on average.`;
    } else {
      interpretation = `Negative expectancy. You need to improve your strategy.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        expectancy: `₹${expectancy.toLocaleString('en-IN')}`,
        expectancyPerDollar,
        monthlyExpectancy: `₹${monthlyExpectancy.toLocaleString('en-IN')}`,
        interpretation,
        details: {
          avgWin: `₹${avgWin.toLocaleString('en-IN')}`,
          avgLoss: `₹${avgLoss.toLocaleString('en-IN')}`,
          winRate
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating expectancy."
    });
  }
};

// 7. NEW: Brokerage Calculator (Indian Markets)
const getBrokerageCalculator = (req, res) => {
  try {
    let { buyPrice, sellPrice, quantity, marketType = 'equity', brokerType = 'discount' } = req.body;

    buyPrice = safeNumber(buyPrice);
    sellPrice = safeNumber(sellPrice);
    quantity = safeNumber(quantity);

    if (buyPrice === null || sellPrice === null || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Buy price, sell price, and quantity are required"
      });
    }

    const turnover = (buyPrice * quantity) + (sellPrice * quantity);
    const totalValue = Math.abs((sellPrice - buyPrice) * quantity);
    
    // Calculate charges based on market type and broker type
    let brokerage, stt, exchangeTx, sebiTurnover, gst, stampDuty;
    
    if (marketType === 'equity') {
      // Equity Delivery
      if (brokerType === 'full') {
        brokerage = Math.min(turnover * 0.005, 100); // 0.5% or ₹100 max
      } else {
        brokerage = 20; // Discount broker flat fee
      }
      stt = totalValue * 0.001; // 0.1% STT on sell side
      exchangeTx = turnover * 0.0000325; // 0.00325% exchange transaction charge
      sebiTurnover = turnover * 0.000001; // 0.0001% SEBI turnover fee
      stampDuty = turnover * 0.00002; // 0.002% stamp duty
    } else if (marketType === 'equity_intraday') {
      // Equity Intraday
      if (brokerType === 'full') {
        brokerage = Math.min(turnover * 0.0005, 20); // 0.05% or ₹20 max
      } else {
        brokerage = 20;
      }
      stt = totalValue * 0.00025; // 0.025% STT
      exchangeTx = turnover * 0.0000325;
      sebiTurnover = turnover * 0.000001;
      stampDuty = turnover * 0.00002;
    } else if (marketType === 'fno') {
      // F&O
      if (brokerType === 'full') {
        brokerage = Math.min(turnover * 0.0005, 100); // 0.05% or ₹100 max
      } else {
        brokerage = 20;
      }
      stt = totalValue * 0.01; // 1% STT on options, 0.01% on futures
      exchangeTx = turnover * 0.00005;
      sebiTurnover = turnover * 0.000001;
      stampDuty = turnover * 0.00002;
    }
    
    const totalCharges = brokerage + stt + exchangeTx + sebiTurnover + gst + stampDuty;
    const netProfit = totalValue - totalCharges;
    const breakevenPoints = totalCharges / quantity;

    return res.status(200).json({
      success: true,
      data: {
        totalValue: `₹${totalValue.toLocaleString('en-IN')}`,
        brokerage: `₹${brokerage.toFixed(2)}`,
        stt: `₹${stt.toFixed(2)}`,
        exchangeTx: `₹${exchangeTx.toFixed(2)}`,
        sebiTurnover: `₹${sebiTurnover.toFixed(2)}`,
        stampDuty: `₹${stampDuty.toFixed(2)}`,
        totalCharges: `₹${totalCharges.toFixed(2)}`,
        netProfit: `₹${netProfit.toLocaleString('en-IN')}`,
        breakevenPoints: `₹${breakevenPoints.toFixed(2)}`,
        details: {
          buyPrice: `₹${buyPrice}`,
          sellPrice: `₹${sellPrice}`,
          quantity,
          marketType,
          brokerType
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating brokerage."
    });
  }
};

export {
  getRiskReward,
  getWinRate,
  getPositionSize,
  getProfitCalculator,
  getRequiredWinRate,
  getExpectancy,
  getBrokerageCalculator
};