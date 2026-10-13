import Prediction from "../models/Prediction.js";

export const getHistory = async (req, res, next) => {
  try {
    const { q = "", result = "all", sort = "desc" } = req.query;
    const filter = { user: req.user._id };
    if (result !== "all") filter.result = result;
    if (q) filter.$or = [{ result: new RegExp(q, "i") }, { subtype: new RegExp(q, "i") }, { explanation: new RegExp(q, "i") }];

    const predictions = await Prediction.find(filter).sort({ createdAt: sort === "asc" ? 1 : -1 });
    res.json(predictions);
  } catch (error) {
    next(error);
  }
};

export const getPrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findOne({ _id: req.params.id, user: req.user._id });
    if (!prediction) {
      res.status(404);
      throw new Error("Prediction not found");
    }
    res.json(prediction);
  } catch (error) {
    next(error);
  }
};

export const deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!prediction) {
      res.status(404);
      throw new Error("Prediction not found");
    }
    res.json({ message: "Prediction deleted" });
  } catch (error) {
    next(error);
  }
};

