const express = require('express');
const topicsRouter = express.Router();
const { getTopics, postTopic } = require('../controllers/topics.controllers');

topicsRouter.route('/').get(getTopics).post(postTopic);

module.exports = topicsRouter;
