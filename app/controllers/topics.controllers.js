const fs = require('fs').promises;
const { selectTopics, insertTopic, rejectIfTopicExists } = require('../models/topics.models');

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await selectTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.postTopic = async (req, res, next) => {
  const { slug, description } = req.body;
  if (!slug || !description) throw { status: 400, msg: 'Missing required fields' };
  try {
    await rejectIfTopicExists(slug);
    const topic = await insertTopic(slug, description);
    res.status(201).send({ topic });
  } catch (err) {
    next(err);
  }
};
