const express = require("express");
const apiRouter = express.Router();
const { getApi } = require("../app.controllers");

const articlesRouter = require("./articles.router");
const commentsRouter = require("./comments.router");
const usersRouter = require("./users.router");
const topicsRouter = require("./topics.router");

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/topics", topicsRouter);

apiRouter.get("/", getApi);

module.exports = apiRouter;
