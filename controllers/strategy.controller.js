import Strategy from "../models/strategy.model.js"

const createStrategy = async (req, res) => {
  try {
    const { name, conditions, stopLoss, target } = req.body;

    if (!name || !conditions || conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Strategy name and conditions are required"
      });
    }

    const strategy = new Strategy({
      name,
      conditions,
      stopLoss,
      target
    });

    await strategy.save();

    return res.status(201).json({
      success: true,
      data: strategy
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getStrategies = async (req, res) => {
  try {
    const strategies = await Strategy.find();

    return res.status(200).json({
      success: true,
      data: strategies
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getStrategyById = async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = await Strategy.findById(id);

    if (!strategy) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: strategy
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const deleteStrategy = async (req, res) => {
  try {
    const { id } = req.params;

    await Strategy.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Strategy deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export {
    createStrategy,
    getStrategies,
    getStrategyById,
    deleteStrategy
}