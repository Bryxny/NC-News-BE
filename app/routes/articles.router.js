const express = require("express");
const articlesRouter = express.Router();

const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
  postArticle,
} = require("../controllers/articles.controllers");

articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articlesRouter;
