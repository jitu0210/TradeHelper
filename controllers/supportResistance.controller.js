const getSRPrediction = (req, res) => {
  try {
    // ==================== INPUT VALIDATION ====================
    const { supports, resistances, currentPrice } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!supports) missingFields.push('supports');
    if (!resistances) missingFields.push('resistances');
    if (currentPrice === undefined || currentPrice === null) missingFields.push('currentPrice');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      });
    }

    // Validate array types
    if (!Array.isArray(supports)) {
      return res.status(400).json({
        success: false,
        error: 'Supports must be an array',
        code: 'INVALID_SUPPORTS_FORMAT'
      });
    }

    if (!Array.isArray(resistances)) {
      return res.status(400).json({
        success: false,
        error: 'Resistances must be an array',
        code: 'INVALID_RESISTANCES_FORMAT'
      });
    }

    // Validate array not empty
    if (supports.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Supports array cannot be empty',
        code: 'EMPTY_SUPPORTS'
      });
    }

    if (resistances.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resistances array cannot be empty',
        code: 'EMPTY_RESISTANCES'
      });
    }

    // Validate currentPrice
    const price = Number(currentPrice);
    if (isNaN(price) || !isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'currentPrice must be a valid positive number',
        code: 'INVALID_PRICE'
      });
    }

    const now = new Date();

    // ==================== HELPER FUNCTIONS ====================
    const validateDate = (dateString) => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    };

    const getTimeWeight = (timeString) => {
      try {
        if (!timeString) return 0;
        
        const time = new Date(timeString);
        if (isNaN(time.getTime())) return 0;
        
        const diffMinutes = Math.max(0, (now - time) / (1000 * 60));
        
        // Exponential decay with configurable half-life (500 minutes ≈ 8.3 hours)
        // Weight = e^(-t / halfLife)
        const halfLife = 500; // minutes
        const weight = Math.exp(-diffMinutes / halfLife);
        
        // Ensure weight is between 0 and 1
        return Math.min(1, Math.max(0, weight));
      } catch (error) {
        return 0;
      }
    };

    const calculateDistancePercentage = (price, level, range) => {
      if (range === 0) return 0;
      return (Math.abs(price - level) / range) * 100;
    };

    // ==================== DATA PARSING & VALIDATION ====================
    const parseLevels = (levels, type) => {
      const parsed = [];
      
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        
        // Validate required fields
        if (!level || typeof level !== 'object') {
          console.warn(`Skipping invalid ${type} entry at index ${i}: not an object`);
          continue;
        }
        
        if (level.price === undefined || level.price === null) {
          console.warn(`Skipping ${type} entry at index ${i}: missing price`);
          continue;
        }
        
        const priceNum = Number(level.price);
        if (isNaN(priceNum) || !isFinite(priceNum) || priceNum <= 0) {
          console.warn(`Skipping ${type} entry at index ${i}: invalid price ${level.price}`);
          continue;
        }
        
        // Time is optional for backward compatibility
        let weight = 0.5; // default weight if no time provided
        if (level.time) {
          if (!validateDate(level.time)) {
            console.warn(`Skipping ${type} entry at index ${i}: invalid date format`);
            continue;
          }
          weight = getTimeWeight(level.time);
        }
        
        parsed.push({
          price: priceNum,
          time: level.time || null,
          weight: weight,
          originalIndex: i
        });
      }
      
      return parsed.sort((a, b) => a.price - b.price);
    };

    const validSupports = parseLevels(supports, 'support');
    const validResistances = parseLevels(resistances, 'resistance');

    // Check if we have valid data
    if (validSupports.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid support levels found after validation',
        code: 'INVALID_SUPPORT_DATA'
      });
    }

    if (validResistances.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid resistance levels found after validation',
        code: 'INVALID_RESISTANCE_DATA'
      });
    }

    // ==================== FIND NEAREST LEVELS ====================
    // Find nearest support (highest support below or equal to current price)
    const supportsBelow = validSupports.filter(s => s.price <= price);
    const nearestSupport = supportsBelow.length > 0 
      ? supportsBelow.reduce((max, curr) => curr.price > max.price ? curr : max)
      : null;

    // Find nearest resistance (lowest resistance above or equal to current price)
    const resistancesAbove = validResistances.filter(r => r.price >= price);
    const nearestResistance = resistancesAbove.length > 0
      ? resistancesAbove.reduce((min, curr) => curr.price < min.price ? curr : min)
      : null;

    // Validate price is within range
    if (!nearestSupport || !nearestResistance) {
      let errorMessage = 'Current price must lie between support and resistance levels. ';
      if (!nearestSupport && !nearestResistance) {
        errorMessage += 'No support below or resistance above current price found.';
      } else if (!nearestSupport) {
        errorMessage += 'No support level found below current price.';
      } else {
        errorMessage += 'No resistance level found above current price.';
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        code: 'PRICE_OUT_OF_RANGE',
        details: {
          currentPrice: price,
          hasSupportBelow: !!nearestSupport,
          hasResistanceAbove: !!nearestResistance
        }
      });
    }

    const range = nearestResistance.price - nearestSupport.price;
    
    if (range <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price range: support must be less than resistance',
        code: 'INVALID_RANGE',
        details: {
          support: nearestSupport.price,
          resistance: nearestResistance.price
        }
      });
    }

    // ==================== CALCULATE PROBABILITIES ====================
    const distToSupport = Math.abs(price - nearestSupport.price);
    const distToResistance = Math.abs(nearestResistance.price - price);
    
    // Base probabilities (distance-based)
    const baseUpProb = (distToResistance / range) * 100;
    const baseDownProb = (distToSupport / range) * 100;
    
    // Apply time weights (recent levels have higher influence)
    const weightedUpProb = baseUpProb * nearestSupport.weight;
    const weightedDownProb = baseDownProb * nearestResistance.weight;
    
    // Sideways probability based on equidistance
    let sidewaysProb = 100 - Math.abs(weightedUpProb - weightedDownProb);
    
    // Normalize probabilities to sum to 100%
    let upProb, downProb;
    const totalWeighted = weightedUpProb + weightedDownProb + sidewaysProb;
    
    if (totalWeighted > 0) {
      upProb = (weightedUpProb / totalWeighted) * 100;
      downProb = (weightedDownProb / totalWeighted) * 100;
      sidewaysProb = (sidewaysProb / totalWeighted) * 100;
    } else {
      // Fallback to equal distribution
      upProb = 33.33;
      downProb = 33.33;
      sidewaysProb = 33.34;
    }
    
    // Determine prediction with confidence threshold
    const CONFIDENCE_THRESHOLD = 5; // minimum percentage difference to make a directional call
    
    let prediction = 'SIDEWAYS';
    let confidence = 'LOW';
    
    if (upProb > downProb + CONFIDENCE_THRESHOLD && upProb > sidewaysProb + CONFIDENCE_THRESHOLD) {
      prediction = 'UP';
      confidence = upProb - Math.max(downProb, sidewaysProb) > 15 ? 'HIGH' : 'MEDIUM';
    } else if (downProb > upProb + CONFIDENCE_THRESHOLD && downProb > sidewaysProb + CONFIDENCE_THRESHOLD) {
      prediction = 'DOWN';
      confidence = downProb - Math.max(upProb, sidewaysProb) > 15 ? 'HIGH' : 'MEDIUM';
    }
    
    // ==================== GENERATE INSIGHTS ====================
    const generateInsight = () => {
      const supportAge = nearestSupport.time ? 
        Math.round((now - new Date(nearestSupport.time)) / (1000 * 60 * 60)) : null;
      const resistanceAge = nearestResistance.time ? 
        Math.round((now - new Date(nearestResistance.time)) / (1000 * 60 * 60)) : null;
      
      if (prediction === 'UP') {
        return `Strong support at ${nearestSupport.price.toFixed(2)}${supportAge !== null ? ` (formed ${supportAge} hours ago)` : ''}. Price is ${distToSupport.toFixed(2)} from support and ${distToResistance.toFixed(2)} from resistance. Bullish bias with ${confidence} confidence.`;
      } else if (prediction === 'DOWN') {
        return `Strong resistance at ${nearestResistance.price.toFixed(2)}${resistanceAge !== null ? ` (formed ${resistanceAge} hours ago)` : ''}. Price is ${distToResistance.toFixed(2)} from resistance and ${distToSupport.toFixed(2)} from support. Bearish bias with ${confidence} confidence.`;
      } else {
        return `Price is balanced between support (${nearestSupport.price.toFixed(2)}) and resistance (${nearestResistance.price.toFixed(2)}). Range width: ${range.toFixed(2)}. Sideways movement likely.`;
      }
    };
    
    // ==================== RESPONSE ====================
    return res.status(200).json({
      success: true,
      data: {
        currentPrice: price,
        nearestSupport: {
          price: nearestSupport.price,
          time: nearestSupport.time,
          weight: parseFloat(nearestSupport.weight.toFixed(4))
        },
        nearestResistance: {
          price: nearestResistance.price,
          time: nearestResistance.time,
          weight: parseFloat(nearestResistance.weight.toFixed(4))
        },
        range: {
          value: range,
          percentageFromSupport: ((distToSupport / range) * 100).toFixed(2),
          percentageFromResistance: ((distToResistance / range) * 100).toFixed(2)
        },
        probabilities: {
          up: parseFloat(upProb.toFixed(2)),
          down: parseFloat(downProb.toFixed(2)),
          sideways: parseFloat(sidewaysProb.toFixed(2))
        },
        prediction: {
          direction: prediction,
          confidence: confidence,
          strength: prediction === 'SIDEWAYS' ? 'NEUTRAL' : (confidence === 'HIGH' ? 'STRONG' : 'MODERATE')
        },
        insights: generateInsight(),
        metadata: {
          supportsAnalyzed: validSupports.length,
          resistancesAnalyzed: validResistances.length,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }
      }
    });
    
  } catch (error) {
    // Comprehensive error logging
    console.error('Support/Resistance Prediction Error:', {
      message: error.message,
      stack: error.stack,
      body: req.body ? {
        hasSupports: !!req.body.supports,
        hasResistances: !!req.body.resistances,
        hasCurrentPrice: req.body.currentPrice !== undefined
      } : null
    });
    
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the prediction',
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { getSRPrediction };