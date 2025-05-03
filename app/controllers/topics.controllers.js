const fs = require("fs").promises;
const { selectTopics } = require("../models/topics.models");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await selectTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};
