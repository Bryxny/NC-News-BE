const express = require('express');
const articlesRouter = express.Router();

const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
  postArticle,
  deleteArticle,
} = require('../controllers/articles.controllers');

articlesRouter.route('/:article_id/comments').get(getCommentsByArticleId).post(postComment);

articlesRouter.route('/:article_id').get(getArticleById).patch(patchArticle).delete(deleteArticle);

articlesRouter.route('/').get(getArticles).post(postArticle);

module.exports = articlesRouter;
