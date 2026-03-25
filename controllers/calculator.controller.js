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


// Utility functions
const safeNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// 1. Risk Reward Calculator (FIXED)
const getRiskReward = (req, res) => {
  try {
    const entry = safeNumber(req.body.entry);
    const stopLoss = safeNumber(req.body.stopLoss);
    const target = safeNumber(req.body.target);

    if (entry === null) return res.status(400).json({ error: "Entry price required" });
    if (stopLoss === null) return res.status(400).json({ error: "Stop loss required" });
    if (target === null) return res.status(400).json({ error: "Target required" });

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    
    // FIXED: Division by zero check
    if (risk === 0) {
      return res.status(400).json({ error: "Risk cannot be zero. Entry and stop loss cannot be same" });
    }
    
    const ratio = (reward / risk).toFixed(2);

    res.json({
      risk,
      reward,
      ratio: parseFloat(ratio),
      formatted: {
        risk: `₹${risk}`,
        reward: `₹${reward}`,
        ratio: `${ratio}:1`
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 2. Win Rate Calculator (FIXED)
const getWinRate = (req, res) => {
  try {
    const wins = safeNumber(req.body.wins);
    const losses = safeNumber(req.body.losses);
    const total = safeNumber(req.body.total);

    let winRate;
    let calculatedWins = wins;
    let calculatedLosses = losses;
    
    if (total !== null) {
      if (wins === null) return res.status(400).json({ error: "Wins required" });
      if (wins > total) return res.status(400).json({ error: "Wins cannot exceed total trades" });
      winRate = ((wins / total) * 100).toFixed(1);
      calculatedLosses = total - wins;
    } 
    // FIXED: Proper null check instead of falsy check
    else if (wins !== null && losses !== null) {
      const totalTrades = wins + losses;
      if (totalTrades === 0) return res.status(400).json({ error: "Total trades cannot be zero" });
      winRate = ((wins / totalTrades) * 100).toFixed(1);
    } 
    else {
      return res.status(400).json({ error: "Provide wins & losses or wins & total" });
    }

    res.json({
      winRate: parseFloat(winRate),
      wins: calculatedWins,
      losses: calculatedLosses,
      formatted: {
        winRate: `${winRate}%`,
        wins: calculatedWins,
        losses: calculatedLosses
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 3. Position Size Calculator (FIXED)
const getPositionSize = (req, res) => {
  try {
    const capital = safeNumber(req.body.capital);
    const riskPercent = safeNumber(req.body.riskPercent);
    const type = req.body.type || 'equity';

    if (capital === null) return res.status(400).json({ error: "Capital required" });
    if (riskPercent === null) return res.status(400).json({ error: "Risk % required" });
    if (riskPercent <= 0) return res.status(400).json({ error: "Risk % must be greater than 0" });

    const riskAmount = (capital * riskPercent) / 100;

    // Options Calculator
    if (type === 'options') {
      const premium = safeNumber(req.body.premium);
      const lotSize = safeNumber(req.body.lotSize, 75);
      
      if (premium === null) return res.status(400).json({ error: "Premium required for options" });
      if (premium <= 0) return res.status(400).json({ error: "Premium must be greater than 0" });
      
      const riskPerLot = premium * lotSize;
      const quantity = Math.floor(riskAmount / riskPerLot);
      const actualRisk = quantity * riskPerLot;
      const actualRiskPercent = (actualRisk / capital) * 100;
      
      return res.json({
        quantity,
        actualRisk,
        actualRiskPercent,
        premium,
        lotSize,
        formatted: {
          quantity: `${quantity} lot(s)`,
          actualRisk: `₹${actualRisk.toFixed(2)}`,
          actualRiskPercent: `${actualRiskPercent.toFixed(1)}%`,
          premium: `₹${premium}`,
          investment: `₹${(premium * lotSize * quantity).toFixed(2)}`
        }
      });
    }

    // Futures Calculator
    if (type === 'futures') {
      const entry = safeNumber(req.body.entry);
      const stopLoss = safeNumber(req.body.stopLoss);
      const lotSize = safeNumber(req.body.lotSize, 75);
      
      if (entry === null) return res.status(400).json({ error: "Entry price required for futures" });
      if (stopLoss === null) return res.status(400).json({ error: "Stop loss required for futures" });
      
      const lossPerShare = Math.abs(entry - stopLoss);
      
      // FIXED: Division by zero check
      if (lossPerShare === 0) {
        return res.status(400).json({ error: "Stop loss cannot be same as entry price" });
      }
      
      const riskPerLot = lossPerShare * lotSize;
      const quantity = Math.floor(riskAmount / riskPerLot);
      const actualRisk = quantity * riskPerLot;
      const actualRiskPercent = (actualRisk / capital) * 100;
      
      return res.json({
        quantity,
        actualRisk,
        actualRiskPercent,
        lotSize,
        formatted: {
          quantity: `${quantity} lot(s)`,
          actualRisk: `₹${actualRisk.toFixed(2)}`,
          actualRiskPercent: `${actualRiskPercent.toFixed(1)}%`,
          marginRequired: `₹${(entry * lotSize * quantity * 0.12).toFixed(2)}`
        }
      });
    }

    // Equity & Intraday Calculator
    const entry = safeNumber(req.body.entry);
    const stopLoss = safeNumber(req.body.stopLoss);
    
    if (entry === null) return res.status(400).json({ error: "Entry price required" });
    if (stopLoss === null) return res.status(400).json({ error: "Stop loss required" });
    
    const lossPerShare = Math.abs(entry - stopLoss);
    
    // FIXED: Division by zero check
    if (lossPerShare === 0) {
      return res.status(400).json({ error: "Stop loss cannot be same as entry price" });
    }
    
    let quantity = Math.floor(riskAmount / lossPerShare);
    let actualRisk = quantity * lossPerShare;
    let actualRiskPercent = (actualRisk / capital) * 100;

    // Intraday with leverage
    if (type === 'intraday') {
      const marginRequired = entry * quantity * 0.05;
      if (marginRequired > capital) {
        quantity = Math.floor(capital / (entry * 0.05));
        actualRisk = quantity * lossPerShare;
        actualRiskPercent = (actualRisk / capital) * 100;
      }
      
      return res.json({
        quantity,
        actualRisk,
        actualRiskPercent,
        formatted: {
          quantity: `${quantity} shares`,
          actualRisk: `₹${actualRisk.toFixed(2)}`,
          actualRiskPercent: `${actualRiskPercent.toFixed(1)}%`,
          marginRequired: `₹${(entry * quantity * 0.05).toFixed(2)}`
        }
      });
    }

    // Equity Delivery
    res.json({
      quantity,
      actualRisk,
      actualRiskPercent,
      formatted: {
        quantity: `${quantity} shares`,
        actualRisk: `₹${actualRisk.toFixed(2)}`,
        actualRiskPercent: `${actualRiskPercent.toFixed(1)}%`,
        investment: `₹${(entry * quantity).toFixed(2)}`
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 4. Profit Calculator (FIXED)
const getProfitCalculator = (req, res) => {
  try {
    const entry = safeNumber(req.body.entry);
    const exit = safeNumber(req.body.exit);
    const quantity = safeNumber(req.body.quantity);
    const type = req.body.type || 'equity';
    const lotSize = safeNumber(req.body.lotSize, (type === 'futures' || type === 'options') ? 75 : 1);

    if (entry === null) return res.status(400).json({ error: "Entry price required" });
    if (exit === null) return res.status(400).json({ error: "Exit price required" });
    if (quantity === null) return res.status(400).json({ error: "Quantity required" });

    const totalQty = (type === 'futures' || type === 'options') ? quantity * lotSize : quantity;
    const grossPnL = (exit - entry) * totalQty;
    const isProfit = grossPnL > 0;

    // Zerodha/Groww charges calculation
    let brokerage, stt, exchangeTx, sebi, gst;
    const turnover = Math.abs((entry * totalQty) + (exit * totalQty));
    const value = Math.abs(grossPnL);

    if (type === 'equity') {
      brokerage = Math.min(turnover * 0.0005, 20);
      stt = value * 0.001;
      exchangeTx = turnover * 0.0000325;
      sebi = turnover * 0.000001;
    } else if (type === 'intraday') {
      brokerage = Math.min(turnover * 0.00025, 20);
      stt = value * 0.00025;
      exchangeTx = turnover * 0.0000325;
      sebi = turnover * 0.000001;
    } else if (type === 'futures') {
      brokerage = Math.min(turnover * 0.00025, 20);
      stt = value * 0.0001;
      exchangeTx = turnover * 0.00002;
      sebi = turnover * 0.000001;
    } else if (type === 'options') {
      brokerage = Math.min(turnover * 0.0005, 20);
      stt = value * 0.01;
      exchangeTx = turnover * 0.00005;
      sebi = turnover * 0.000001;
    }

    gst = (brokerage + exchangeTx + sebi) * 0.18;
    const totalCharges = brokerage + stt + exchangeTx + sebi + gst;
    const netPnL = grossPnL - totalCharges;

    res.json({
      grossPnL,
      netPnL,
      returns: (netPnL / (entry * totalQty)) * 100,
      charges: {
        brokerage,
        stt,
        exchangeTx,
        sebi,
        gst,
        total: totalCharges
      },
      formatted: {
        grossPnL: isProfit ? `+₹${Math.abs(grossPnL).toFixed(2)}` : `-₹${Math.abs(grossPnL).toFixed(2)}`,
        netPnL: netPnL > 0 ? `+₹${netPnL.toFixed(2)}` : `-₹${Math.abs(netPnL).toFixed(2)}`,
        returns: `${((netPnL / (entry * totalQty)) * 100).toFixed(2)}%`,
        charges: {
          brokerage: `₹${brokerage.toFixed(2)}`,
          stt: `₹${stt.toFixed(2)}`,
          total: `₹${totalCharges.toFixed(2)}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 5. Required Win Rate Calculator (FIXED)
const getRequiredWinRate = (req, res) => {
  try {
    const rr = safeNumber(req.body.riskReward);
    
    if (rr === null) return res.status(400).json({ error: "Risk-reward ratio required" });
    if (rr <= 0) return res.status(400).json({ error: "Risk-reward ratio must be greater than 0" });

    const breakEven = (1 / (1 + rr) * 100);
    const recommended = breakEven + 10;

    res.json({
      riskReward: rr,
      breakEven,
      recommended,
      formatted: {
        breakEven: `${breakEven.toFixed(1)}%`,
        recommended: `${recommended.toFixed(1)}%`,
        note: `With ${rr}:1 ratio, you need ${breakEven.toFixed(1)}% win rate to break even`
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 6. Expectancy Calculator (FIXED)
const getExpectancy = (req, res) => {
  try {
    const avgWin = safeNumber(req.body.avgWin);
    const avgLoss = safeNumber(req.body.avgLoss);
    const winRate = safeNumber(req.body.winRate);

    if (avgWin === null) return res.status(400).json({ error: "Average win required" });
    if (avgLoss === null) return res.status(400).json({ error: "Average loss required" });
    if (winRate === null) return res.status(400).json({ error: "Win rate required" });
    
    if (avgLoss === 0) return res.status(400).json({ error: "Average loss cannot be zero" });

    const winProb = winRate / 100;
    const expectancy = (avgWin * winProb) - (avgLoss * (1 - winProb));
    const perTrade = expectancy / avgLoss;

    res.json({
      expectancy,
      perTrade,
      isProfitable: expectancy > 0,
      formatted: {
        expectancy: expectancy > 0 ? `+₹${expectancy.toFixed(2)}` : `-₹${Math.abs(expectancy).toFixed(2)}`,
        perTrade: `${perTrade.toFixed(2)}x risk`,
        status: expectancy > 0 ? "Profitable strategy" : "Needs improvement"
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
  }
};

// 7. Brokerage Calculator (FIXED)
const getBrokerageCalculator = (req, res) => {
  try {
    const buyPrice = safeNumber(req.body.buyPrice);
    const sellPrice = safeNumber(req.body.sellPrice);
    const quantity = safeNumber(req.body.quantity);
    const type = req.body.type || 'equity';
    const lotSize = safeNumber(req.body.lotSize, 75);

    if (buyPrice === null) return res.status(400).json({ error: "Buy price required" });
    if (sellPrice === null) return res.status(400).json({ error: "Sell price required" });
    if (quantity === null) return res.status(400).json({ error: "Quantity required" });

    const totalQty = (type === 'futures' || type === 'options') ? quantity * lotSize : quantity;
    const turnover = (buyPrice * totalQty) + (sellPrice * totalQty);
    const pnl = Math.abs((sellPrice - buyPrice) * totalQty);
    
    let brokerage, stt, exchangeTx, sebi, gst;

    if (type === 'equity') {
      brokerage = Math.min(turnover * 0.0005, 20);
      stt = pnl * 0.001;
      exchangeTx = turnover * 0.0000325;
      sebi = turnover * 0.000001;
    } else if (type === 'intraday') {
      brokerage = Math.min(turnover * 0.00025, 20);
      stt = pnl * 0.00025;
      exchangeTx = turnover * 0.0000325;
      sebi = turnover * 0.000001;
    } else if (type === 'futures') {
      brokerage = Math.min(turnover * 0.00025, 20);
      stt = pnl * 0.0001;
      exchangeTx = turnover * 0.00002;
      sebi = turnover * 0.000001;
    } else {
      brokerage = Math.min(turnover * 0.0005, 20);
      stt = pnl * 0.01;
      exchangeTx = turnover * 0.00005;
      sebi = turnover * 0.000001;
    }

    gst = (brokerage + exchangeTx + sebi) * 0.18;
    const total = brokerage + stt + exchangeTx + sebi + gst;

    res.json({
      totalCharges: total,
      breakeven: total / totalQty,
      breakdown: {
        brokerage,
        stt,
        exchangeTx,
        sebi,
        gst
      },
      formatted: {
        totalCharges: `₹${total.toFixed(2)}`,
        breakeven: `₹${(total / totalQty).toFixed(2)}`,
        breakdown: {
          brokerage: `₹${brokerage.toFixed(2)}`,
          stt: `₹${stt.toFixed(2)}`,
          exchange: `₹${exchangeTx.toFixed(2)}`,
          gst: `₹${gst.toFixed(2)}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Calculation failed" });
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