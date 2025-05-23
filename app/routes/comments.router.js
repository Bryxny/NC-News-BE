const express = require("express");
const commentsRouter = express.Router();
const {
  deleteCommentById,
  patchCommentById,
} = require("../controllers/comments.controllers");

commentsRouter
  .route("/:comment_id")
  .delete(deleteCommentById)
  .patch(patchCommentById);

module.exports = commentsRouter;
