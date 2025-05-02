const express = require("express");
const articlesRouter = express.Router();

const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
} = require("../app.controllers");

articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articlesRouter.route("/").get(getArticles);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articlesRouter;
