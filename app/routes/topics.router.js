const express = require("express");
const topicsRouter = express.Router();
const { getTopics } = require("../app.controllers");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
