const express = require("express");
const commentsRouter = express.Router();
const { deleteCommentById } = require("../app.controllers");

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
